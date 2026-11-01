// Pixel art image operations on plain RGBA buffers: load/save PNG and JPEG,
// downscale by area averaging, median-cut quantise, palette remap and
// nearest-neighbour upscale. No native dependencies.
import { readFile, writeFile } from 'node:fs/promises'
import { PNG } from 'pngjs'
import jpeg from 'jpeg-js'

export const PALETTES = {
  'pico-8': '000000 1D2B53 7E2553 008751 AB5236 5F574F C2C3C7 FFF1E8 FF004D FFA300 FFEC27 00E436 29ADFF 83769C FF77A8 FFCCAA',
  'sweetie-16': '1A1C2C 5D275D B13E53 EF7D57 FFCD75 A7F070 38B764 257179 29366F 3B5DC9 41A6F6 73EFF7 F4F4F4 94B0C2 566C86 333C57',
  'endesga-32': 'BE4A2F D77643 EAD4AA E4A672 B86F50 733E39 3E2731 A22633 E43B44 F77622 FEAE34 FEE761 63C74D 3E8948 265C42 193C3E 124E89 0099DB 2CE8F5 FFFFFF C0CBDC 8B9BB4 5A6988 3A4466 262B44 181425 FF0044 68386C B55088 F6757A E8B796 C28569',
  'game-boy': '0F380F 306230 8BAC0F 9BBC0F',
  '1-bit': '000000 FFFFFF',
}

const hexToRgb = h => [0, 2, 4].map(i => parseInt(h.replace('#', '').slice(i, i + 2), 16))
export const rgbToHex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('')

/** Palette from a known name or a list of hex colours. */
export function resolvePalette(p) {
  if (!p) return null
  if (Array.isArray(p)) return p.map(hexToRgb)
  const known = PALETTES[String(p).toLowerCase()]
  if (known) return known.split(' ').map(hexToRgb)
  const list = String(p).split(/[\s,]+/).filter(Boolean)
  if (list.every(h => /^#?[0-9a-f]{6}$/i.test(h))) return list.map(hexToRgb)
  throw new Error(`Unknown palette "${p}". Use one of ${Object.keys(PALETTES).join(', ')} or a list of hex colours.`)
}

/** Load a PNG or JPEG from a path or http(s) URL into { width, height, data: RGBA }. */
export async function loadImage(input) {
  let buf
  if (/^https?:\/\//.test(input)) {
    const res = await fetch(input)
    if (!res.ok) throw new Error(`Could not fetch ${input}: HTTP ${res.status}`)
    buf = Buffer.from(await res.arrayBuffer())
  } else {
    buf = await readFile(input)
  }
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    const png = PNG.sync.read(buf)
    return { width: png.width, height: png.height, data: new Uint8ClampedArray(png.data) }
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    const j = jpeg.decode(buf, { useTArray: true, formatAsRGBA: true })
    return { width: j.width, height: j.height, data: new Uint8ClampedArray(j.data) }
  }
  throw new Error('Unsupported image format: only PNG and JPEG are supported.')
}

export async function saveImage(img, path) {
  const png = new PNG({ width: img.width, height: img.height })
  png.data = Buffer.from(img.data)
  await writeFile(path, PNG.sync.write(png))
  return path
}

/** Downscale to `width` pixels wide (aspect kept) by averaging each source block. */
export function downscale(img, width) {
  const w = Math.max(1, Math.min(width, img.width))
  const h = Math.max(1, Math.round(img.height * w / img.width))
  const out = new Uint8ClampedArray(w * h * 4)
  const sx = img.width / w, sy = img.height / h
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x * sx), x1 = Math.max(x0 + 1, Math.floor((x + 1) * sx))
      const y0 = Math.floor(y * sy), y1 = Math.max(y0 + 1, Math.floor((y + 1) * sy))
      let r = 0, g = 0, b = 0, a = 0, n = 0
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * img.width + xx) * 4, al = img.data[i + 3]
          r += img.data[i] * al; g += img.data[i + 1] * al; b += img.data[i + 2] * al; a += al; n++
        }
      }
      const o = (y * w + x) * 4
      if (a > 0) { out[o] = r / a; out[o + 1] = g / a; out[o + 2] = b / a }
      out[o + 3] = a / n >= 128 ? 255 : 0 // pixel art is hard-edged: no partial alpha
    }
  }
  return { width: w, height: h, data: out }
}

const opaque = img => {
  const px = []
  for (let i = 0; i < img.data.length; i += 4) if (img.data[i + 3] >= 128) px.push([img.data[i], img.data[i + 1], img.data[i + 2]])
  return px
}

/** Median cut: split the colour box with the widest channel range until `n` boxes. */
export function medianCut(img, n) {
  const px = opaque(img)
  if (!px.length) return []
  let boxes = [px]
  while (boxes.length < n) {
    let best = -1, bi = -1, ch = 0
    boxes.forEach((b, i) => {
      if (b.length < 2) return
      for (let c = 0; c < 3; c++) {
        let lo = 255, hi = 0
        for (const p of b) { if (p[c] < lo) lo = p[c]; if (p[c] > hi) hi = p[c] }
        if (hi - lo > best) { best = hi - lo; bi = i; ch = c }
      }
    })
    if (bi < 0 || best === 0) break
    const b = boxes[bi].sort((p, q) => p[ch] - q[ch])
    const mid = b.length >> 1
    boxes.splice(bi, 1, b.slice(0, mid), b.slice(mid))
  }
  return boxes.map(b => [0, 1, 2].map(c => Math.round(b.reduce((s, p) => s + p[c], 0) / b.length)))
}

const dist = (a, b) => {
  // Weighted RGB distance: close enough to perceptual for small palettes.
  const r = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]
  return (2 + r / 256) * dr * dr + 4 * dg * dg + (2 + (255 - r) / 256) * db * db
}

/** Map every opaque pixel to its nearest palette colour. */
export function remap(img, palette) {
  const out = new Uint8ClampedArray(img.data)
  const cache = new Map()
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] < 128) { out[i + 3] = 0; continue }
    const key = (out[i] << 16) | (out[i + 1] << 8) | out[i + 2]
    let c = cache.get(key)
    if (!c) {
      const p = [out[i], out[i + 1], out[i + 2]]
      c = palette.reduce((best, q) => dist(p, q) < dist(p, best) ? q : best, palette[0])
      cache.set(key, c)
    }
    out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2]; out[i + 3] = 255
  }
  return { width: img.width, height: img.height, data: out }
}

export function upscale(img, scale) {
  const s = Math.max(1, Math.floor(scale))
  const w = img.width * s, h = img.height * s
  const out = new Uint8ClampedArray(w * h * 4)
  const src = new Uint32Array(img.data.buffer, img.data.byteOffset, img.width * img.height)
  const dst = new Uint32Array(out.buffer)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) dst[y * w + x] = src[((y / s) | 0) * img.width + ((x / s) | 0)]
  return { width: w, height: h, data: out }
}

/** Colours actually present, most used first. */
export function usedColors(img) {
  const n = new Map()
  for (let i = 0; i < img.data.length; i += 4) {
    if (img.data[i + 3] < 128) continue
    const h = rgbToHex([img.data[i], img.data[i + 1], img.data[i + 2]])
    n.set(h, (n.get(h) || 0) + 1)
  }
  return [...n.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0])
}

/** Image → pixel art: downscale, quantise (or map to a palette), optionally upscale for display. */
export function pixelate(img, { width = 64, colors = 16, palette, scale = 1 } = {}) {
  let out = downscale(img, width)
  const pal = resolvePalette(palette) || medianCut(out, colors)
  out = remap(out, pal)
  return { pixel: out, display: scale > 1 ? upscale(out, scale) : out, palette: usedColors(out) }
}

export const toGpl = (hexes, name = 'Palette') =>
  `GIMP Palette\nName: ${name}\nColumns: 8\n#\n` + hexes.map(h => { const [r, g, b] = hexToRgb(h); return `${String(r).padStart(3)} ${String(g).padStart(3)} ${String(b).padStart(3)}\t${h}` }).join('\n') + '\n'
