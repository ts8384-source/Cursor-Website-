import { spawn } from 'node:child_process'
import { unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** Kill this process if the event loop stops writing heartbeats (wedged accept/JSON). */
export function startWatchdog(staleMs = 20_000) {
  const beatPath = join(tmpdir(), `drawing-loop-backend-${process.pid}.beat`)
  const writeBeat = () => {
    try {
      writeFileSync(beatPath, String(Date.now()))
    } catch {
      // tmp full
    }
  }
  writeBeat()
  const pulse = setInterval(writeBeat, 1_000)
  pulse.unref()

  const script = `
const fs = require('fs');
const beat = ${JSON.stringify(beatPath)};
const parent = ${process.pid};
const stale = ${staleMs};
const t = setInterval(() => {
  try {
    process.kill(parent, 0);
  } catch {
    clearInterval(t);
    try { fs.unlinkSync(beat); } catch {}
    process.exit(0);
  }
  let age = stale + 1;
  try { age = Date.now() - Number(fs.readFileSync(beat, 'utf8')); } catch {}
  if (age > stale) {
    console.error('[watchdog] backend heartbeat stale', age, 'ms — killing', parent);
    try { process.kill(parent); } catch {}
    try { fs.unlinkSync(beat); } catch {}
    process.exit(0);
  }
}, 3000);
`
  const child = spawn(process.execPath, ['-e', script], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  child.unref()

  const cleanup = () => {
    try {
      unlinkSync(beatPath)
    } catch {
      // already gone
    }
  }
  process.on('exit', cleanup)
}
