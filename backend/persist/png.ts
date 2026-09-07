import { deflateSync } from 'node:zlib'

function crc32(buf: Buffer) {
  let crc = 0xffffffff
  for (const byte of buf) {
    crc ^= byte
    for (let i = 0; i < 8; i += 1) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Buffer) {
  const head = Buffer.alloc(4 + 4)
  head.writeUInt32BE(data.length, 0)
  head.write(type, 4, 4, 'ascii')
  const crcBuf = Buffer.concat([head.subarray(4), data])
  const tail = Buffer.alloc(4)
  tail.writeUInt32BE(crc32(crcBuf), 0)
  return Buffer.concat([head, data, tail])
}

/** Uncompressed RGB PNG. */
export function encodeRgbPng(width: number, height: number, rgb: Buffer) {
  const raw = Buffer.alloc((width * 3 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    const dest = y * (width * 3 + 1)
    raw[dest] = 0
    rgb.copy(raw, dest + 1, y * width * 3, (y + 1) * width * 3)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 1 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/** 5×7 glyphs for printable ASCII. Unknown chars draw as a box. */
const GLYPH: Record<string, number[]> = {
  ' ': [0, 0, 0, 0, 0],
  '!': [4, 4, 4, 4, 0, 4, 0],
  '"': [10, 10, 0, 0, 0, 0, 0],
  '#': [10, 31, 10, 31, 10, 0, 0],
  '%': [19, 19, 4, 4, 26, 26, 0],
  '&': [4, 10, 4, 10, 17, 14, 0],
  "'": [4, 4, 0, 0, 0, 0, 0],
  '(': [4, 8, 8, 8, 8, 4, 0],
  ')': [4, 2, 2, 2, 2, 4, 0],
  '+': [0, 4, 4, 31, 4, 4, 0],
  ',': [0, 0, 0, 0, 4, 4, 8],
  '-': [0, 0, 0, 31, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 4, 0],
  '/': [1, 2, 4, 8, 16, 0, 0],
  '0': [14, 17, 19, 21, 25, 14, 0],
  '1': [4, 12, 4, 4, 4, 14, 0],
  '2': [14, 17, 1, 6, 8, 31, 0],
  '3': [14, 17, 2, 1, 17, 14, 0],
  '4': [2, 6, 10, 18, 31, 2, 0],
  '5': [31, 16, 30, 1, 17, 14, 0],
  '6': [14, 16, 30, 17, 17, 14, 0],
  '7': [31, 1, 2, 4, 8, 8, 0],
  '8': [14, 17, 14, 17, 17, 14, 0],
  '9': [14, 17, 17, 15, 1, 14, 0],
  ':': [0, 4, 0, 0, 4, 0, 0],
  ';': [0, 4, 0, 0, 4, 8, 0],
  '<': [2, 4, 8, 4, 2, 0, 0],
  '=': [0, 0, 31, 0, 31, 0, 0],
  '>': [8, 4, 2, 4, 8, 0, 0],
  '?': [14, 17, 2, 4, 0, 4, 0],
  'A': [14, 17, 17, 31, 17, 17, 0],
  'B': [30, 17, 30, 17, 17, 30, 0],
  'C': [14, 17, 16, 16, 17, 14, 0],
  'D': [30, 17, 17, 17, 17, 30, 0],
  'E': [31, 16, 30, 16, 16, 31, 0],
  'F': [31, 16, 30, 16, 16, 16, 0],
  'G': [14, 17, 16, 19, 17, 14, 0],
  'H': [17, 17, 31, 17, 17, 17, 0],
  'I': [14, 4, 4, 4, 4, 14, 0],
  'J': [1, 1, 1, 1, 17, 14, 0],
  'K': [17, 18, 28, 18, 17, 17, 0],
  'L': [16, 16, 16, 16, 16, 31, 0],
  'M': [17, 27, 21, 17, 17, 17, 0],
  'N': [17, 25, 21, 19, 17, 17, 0],
  'O': [14, 17, 17, 17, 17, 14, 0],
  'P': [30, 17, 17, 30, 16, 16, 0],
  'Q': [14, 17, 17, 21, 18, 13, 0],
  'R': [30, 17, 17, 30, 18, 17, 0],
  'S': [14, 17, 8, 2, 17, 14, 0],
  'T': [31, 4, 4, 4, 4, 4, 0],
  'U': [17, 17, 17, 17, 17, 14, 0],
  'V': [17, 17, 17, 17, 10, 4, 0],
  'W': [17, 17, 17, 21, 21, 10, 0],
  'X': [17, 10, 4, 4, 10, 17, 0],
  'Y': [17, 17, 10, 4, 4, 4, 0],
  'Z': [31, 2, 4, 8, 16, 31, 0],
  '[': [14, 8, 8, 8, 8, 14, 0],
  ']': [14, 2, 2, 2, 2, 14, 0],
  '_': [0, 0, 0, 0, 0, 0, 0],
  'a': [0, 14, 1, 15, 17, 15, 0],
  'b': [16, 16, 30, 17, 17, 30, 0],
  'c': [0, 14, 17, 16, 17, 14, 0],
  'd': [1, 1, 15, 17, 17, 15, 0],
  'e': [0, 14, 17, 31, 16, 14, 0],
  'f': [6, 8, 28, 8, 8, 8, 0],
  'g': [0, 15, 17, 15, 1, 14, 0],
  'h': [16, 16, 30, 17, 17, 17, 0],
  'i': [4, 0, 12, 4, 4, 14, 0],
  'j': [2, 0, 2, 2, 18, 12, 0],
  'k': [16, 18, 20, 24, 20, 18, 0],
  'l': [12, 4, 4, 4, 4, 14, 0],
  'm': [0, 26, 21, 21, 21, 21, 0],
  'n': [0, 30, 17, 17, 17, 17, 0],
  'o': [0, 14, 17, 17, 17, 14, 0],
  'p': [0, 30, 17, 30, 16, 16, 0],
  'q': [0, 15, 17, 15, 1, 1, 0],
  'r': [0, 22, 25, 16, 16, 16, 0],
  's': [0, 15, 16, 14, 1, 30, 0],
  't': [8, 28, 8, 8, 8, 6, 0],
  'u': [0, 17, 17, 17, 17, 15, 0],
  'v': [0, 17, 17, 17, 10, 4, 0],
  'w': [0, 17, 17, 21, 21, 10, 0],
  'x': [0, 17, 10, 4, 10, 17, 0],
  'y': [0, 17, 17, 15, 1, 14, 0],
  'z': [0, 31, 2, 4, 8, 31, 0],
}

function glyph(ch: string) {
  return GLYPH[ch] ?? [31, 17, 17, 17, 17, 31, 0]
}

export type Rgb = { r: number; g: number; b: number }

export function fillRgb(width: number, height: number, color: Rgb) {
  const rgb = Buffer.alloc(width * height * 3)
  for (let i = 0; i < width * height; i += 1) {
    rgb[i * 3] = color.r
    rgb[i * 3 + 1] = color.g
    rgb[i * 3 + 2] = color.b
  }
  return rgb
}

function plot(rgb: Buffer, width: number, height: number, x: number, y: number, color: Rgb) {
  if (x < 0 || y < 0 || x >= width || y >= height) return
  const i = (y * width + x) * 3
  rgb[i] = color.r
  rgb[i + 1] = color.g
  rgb[i + 2] = color.b
}

export function drawText(
  rgb: Buffer,
  width: number,
  height: number,
  x: number,
  y: number,
  text: string,
  color: Rgb,
  scale = 2,
) {
  let cx = x
  for (const ch of text) {
    const rows = glyph(ch)
    for (let row = 0; row < 7; row += 1) {
      const bits = rows[row] ?? 0
      for (let col = 0; col < 5; col += 1) {
        if (bits & (16 >> col)) {
          for (let dy = 0; dy < scale; dy += 1) {
            for (let dx = 0; dx < scale; dx += 1) plot(rgb, width, height, cx + col * scale + dx, y + row * scale + dy, color)
          }
        }
      }
    }
    cx += 6 * scale
  }
}

export function wrapLines(text: string, cols: number) {
  const out: string[] = []
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const line = raw.replace(/\t/g, ' ')
    if (!line) {
      out.push('')
      continue
    }
    let rest = line
    while (rest.length > cols) {
      let cut = rest.lastIndexOf(' ', cols)
      if (cut < cols / 2) cut = cols
      out.push(rest.slice(0, cut))
      rest = rest.slice(cut).trimStart()
    }
    if (rest) out.push(rest)
  }
  return out
}

export function drawLine(
  rgb: Buffer,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: Rgb,
) {
  const dx = Math.abs(x1 - x0)
  const sx = x0 < x1 ? 1 : -1
  const dy = -Math.abs(y1 - y0)
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  let x = Math.round(x0)
  let y = Math.round(y0)
  for (;;) {
    plot(rgb, width, height, x, y, color)
    if (x === Math.round(x1) && y === Math.round(y1)) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x += sx
    }
    if (e2 <= dx) {
      err += dx
      y += sy
    }
  }
}

export function fillRect(
  rgb: Buffer,
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number,
  color: Rgb,
  stroke?: Rgb,
) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const edge = xx === x || yy === y || xx === x + w - 1 || yy === y + h - 1
      plot(rgb, width, height, xx, yy, edge && stroke ? stroke : color)
    }
  }
}
