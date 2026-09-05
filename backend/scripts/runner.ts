import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { root } from '../paths.ts'

const PY_CANDIDATES = ['python', 'py', 'python3']

function pickPython() {
  return process.env.RAG_PYTHON?.trim() || PY_CANDIDATES[0]
}

export type RagResult = {
  ok: boolean
  data?: unknown
  error?: string
  hint?: string
}

export const SCRIPT_ALLOW = ['seed', 'rebuild', 'ask', 'site'] as const
export type ScriptName = (typeof SCRIPT_ALLOW)[number]

export function runRag(args: string[], timeoutMs = 180_000): Promise<RagResult> {
  const python = pickPython()
  const cli = join(root, 'rag', 'cli.py')
  if (!existsSync(cli)) {
    return Promise.resolve({ ok: false, error: 'rag/cli.py missing' })
  }
  return new Promise((resolve) => {
    const child = spawn(python, ['-m', 'rag.cli', ...args], {
      cwd: root,
      env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8' },
      windowsHide: true,
    })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill()
      resolve({ ok: false, error: `rag timed out after ${timeoutMs}ms`, hint: pipHint() })
    }, timeoutMs)
    child.stdout.on('data', (chunk) => {
      stdout += String(chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })
    child.on('error', (err) => {
      clearTimeout(timer)
      resolve({
        ok: false,
        error: err.message,
        hint: 'Install Python, then pip install -r requirements-rag.txt',
      })
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code !== 0) {
        resolve({
          ok: false,
          error: (stderr || stdout || `exit ${code}`).slice(0, 4000),
          hint: pipHint(stderr),
        })
        return
      }
      try {
        resolve({ ok: true, data: JSON.parse(stdout) })
      } catch {
        resolve({ ok: true, data: { raw: stdout } })
      }
    })
  })
}

function pipHint(stderr = '') {
  if (/ModuleNotFoundError|No module named|chromadb|rank_bm25|sentence_transformers/i.test(stderr)) {
    return 'pip install -r requirements-rag.txt'
  }
  return 'python -m rag.cli seed && python -m rag.cli rebuild'
}
