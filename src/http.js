#!/usr/bin/env node
// Hosted MCP endpoint (Streamable HTTP, stateless). Same pixel art operations as
// the stdio server, but images come in as URLs or base64 and go back as PNG
// content. Built to run on a small shared box: hard caps on input size, output
// size, request rate and concurrency, and no fetches to private addresses.
import { createServer } from 'node:http'
import http from 'node:http'
import https from 'node:https'
import dns from 'node:dns'
import { BlockList, isIP } from 'node:net'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'
import {
  PALETTES, decodeImage, encodePng, imageSize, pixelate, medianCut, downscale, remap, resolvePalette, upscale, usedColors, rgbToHex, toGpl,
} from './pixel.js'

const PORT = Number(process.env.PORT || 4020)
const HOST = process.env.HOST || '127.0.0.1'
const MAX_BYTES = 4 * 1024 * 1024 // input image
const MAX_BODY = 6 * 1024 * 1024 // JSON-RPC body (base64 adds a third)
const MAX_PIXELS = 2048 * 2048 // input image, checked from the header before decoding
const MAX_OUT = 1024 // longest side of a returned image
const RATE = 20 // requests per IP per minute
const MAX_BUSY = 1 // tool calls running at once (1 vCPU, 2 GB box)
const SITE = 'https://simplepixelart.com/'
const EDITOR = 'https://simplepixelart.com/editor'

// --- fetching user-supplied URLs safely -------------------------------------

const blocked = new BlockList()
for (const [net, bits] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['224.0.0.0', 3]]) blocked.addSubnet(net, bits, 'ipv4')
for (const [net, bits] of [['::', 127], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8]]) blocked.addSubnet(net, bits, 'ipv6')
// IPv4-mapped IPv6 (::ffff:7f00:1) is refused outright rather than unpacked.
const isBlocked = ip => isIP(ip) === 6 ? /^::ffff:/i.test(ip) || blocked.check(ip, 'ipv6') : blocked.check(ip, 'ipv4')

// Checked at connect time, so a DNS answer can't change between check and use.
function safeLookup(host, opts, cb) {
  dns.lookup(host, { ...opts, all: true }, (err, addrs) => {
    if (err) return cb(err)
    const ok = addrs.filter(a => !isBlocked(a.address))
    if (!ok.length) return cb(new Error('That address is not allowed.'))
    opts.all ? cb(null, ok) : cb(null, ok[0].address, ok[0].family)
  })
}

function fetchImage(url, redirects = 2) {
  return new Promise((resolve, reject) => {
    let u
    try { u = new URL(url) } catch { return reject(new Error('Invalid image_url.')) }
    if (!/^https?:$/.test(u.protocol)) return reject(new Error('image_url must be http(s).'))
    if (isIP(u.hostname.replace(/^\[|\]$/g, '')) && isBlocked(u.hostname.replace(/^\[|\]$/g, ''))) return reject(new Error('That address is not allowed.'))
    const req = (u.protocol === 'https:' ? https : http).get(u, {
      lookup: safeLookup, timeout: 10000, headers: { 'user-agent': 'simplepixelart-mcp (+https://simplepixelart.com/)' },
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        if (!redirects) return reject(new Error('Too many redirects.'))
        return fetchImage(new URL(res.headers.location, u).href, redirects - 1).then(resolve, reject)
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`Could not fetch image: HTTP ${res.statusCode}`)) }
      if (Number(res.headers['content-length']) > MAX_BYTES) { res.destroy(); return reject(new Error('Image is larger than 4 MB.')) }
      const chunks = []; let n = 0
      res.on('data', c => { n += c.length; if (n > MAX_BYTES) { res.destroy(); reject(new Error('Image is larger than 4 MB.')) } else chunks.push(c) })
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    })
    req.on('timeout', () => req.destroy(new Error('Image download timed out.')))
    req.on('error', reject)
  })
}

async function readInput({ image_url, image_base64 }) {
  let buf
  if (image_base64) {
    buf = Buffer.from(image_base64.replace(/^data:[^,]*,/, ''), 'base64')
    if (buf.length > MAX_BYTES) throw new Error('Image is larger than 4 MB.')
  } else if (image_url) {
    buf = await fetchImage(image_url)
  } else {
    throw new Error('Pass image_url or image_base64.')
  }
  const size = imageSize(buf)
  if (!size) throw new Error('Unsupported image format: only PNG and JPEG are supported.')
  if (size.width * size.height > MAX_PIXELS) throw new Error('Image is larger than 2048x2048 pixels.')
  return decodeImage(buf)
}

// --- tools ------------------------------------------------------------------

/** Largest whole scale that keeps the longest side within MAX_OUT. */
const fitScale = (img, want) => Math.max(1, Math.min(want, Math.floor(MAX_OUT / Math.max(img.width, img.height))))
const png = (img, note) => ({
  content: [
    { type: 'image', data: encodePng(img).toString('base64'), mimeType: 'image/png' },
    { type: 'text', text: note },
  ],
})
const imageArgs = {
  image_url: z.string().url().optional().describe('Public http(s) URL of a PNG or JPEG (max 4 MB, 2048x2048)'),
  image_base64: z.string().optional().describe('PNG or JPEG as base64 (or a data: URL), if there is no public URL'),
}
const paletteHelp = `Palette name (${Object.keys(PALETTES).join(', ')}) or hex colours like "#1a1c2c,#5d275d"`

function buildServer() {
  const server = new McpServer({ name: 'simplepixelart-mcp', version: '0.1.1', websiteUrl: SITE })

  server.registerTool('pixelate_image', {
    title: 'Image to pixel art',
    description: 'Turn a photo or illustration into pixel art: shrink it to a pixel grid and reduce it to a few colours (or a named palette). Returns the PNG.',
    inputSchema: {
      ...imageArgs,
      width: z.number().int().min(4).max(256).default(64).describe('Width of the pixel grid in pixels (height keeps the aspect ratio)'),
      colors: z.number().int().min(2).max(64).default(16).describe('Number of colours when no palette is given'),
      palette: z.string().optional().describe(paletteHelp),
      scale: z.number().int().min(1).max(32).default(8).describe('Nearest-neighbour upscale of the returned PNG, capped at 1024 px'),
    },
  }, async ({ width, colors, palette, scale, ...input }) => {
    const r = pixelate(await readInput(input), { width, colors, palette })
    const s = fitScale(r.pixel, scale)
    return png(s > 1 ? upscale(r.pixel, s) : r.pixel,
      `${r.pixel.width}x${r.pixel.height} pixel art, ${r.palette.length} colours${s > 1 ? `, shown at ${s}x` : ''}.\nPalette: ${r.palette.join(' ')}\nEdit it further in the free online pixel art editor: ${EDITOR}`)
  })

  server.registerTool('extract_palette', {
    title: 'Extract palette',
    description: 'Pull the main colours out of an image (median cut). Returns hex codes plus a GIMP/Aseprite .gpl palette.',
    inputSchema: { ...imageArgs, colors: z.number().int().min(2).max(64).default(8).describe('How many colours to extract') },
  }, async ({ colors, ...input }) => {
    const hexes = medianCut(downscale(await readInput(input), 256), colors).map(rgbToHex)
    return { content: [{ type: 'text', text: `${hexes.join(' ')}\n\n${toGpl(hexes, 'Extracted')}\nMore palettes: https://simplepixelart.com/palettes` }] }
  })

  server.registerTool('remap_palette', {
    title: 'Recolour to a palette',
    description: 'Recolour an existing pixel art image so every pixel uses a colour from the given palette (e.g. PICO-8 or Game Boy). Size is kept. Returns the PNG.',
    inputSchema: { ...imageArgs, palette: z.string().describe(paletteHelp) },
  }, async ({ palette, ...input }) => {
    const src = await readInput(input)
    const img = remap(src.width > MAX_OUT || src.height > MAX_OUT ? downscale(src, MAX_OUT) : src, resolvePalette(palette))
    return png(img, `${img.width}x${img.height}, ${usedColors(img).length} colours. Open it in ${EDITOR} to touch it up.`)
  })

  server.registerTool('upscale_pixel_art', {
    title: 'Upscale without blur',
    description: 'Scale pixel art up by a whole number with nearest neighbour, so pixels stay sharp. Output is capped at 1024 px.',
    inputSchema: { ...imageArgs, scale: z.number().int().min(2).max(64).default(8) },
  }, async ({ scale, ...input }) => {
    const src = await readInput(input)
    const s = fitScale(src, scale)
    if (s < 2) throw new Error('Image is already 512 px or larger; nothing to upscale within the 1024 px limit.')
    const img = upscale(src, s)
    return png(img, `${img.width}x${img.height} (${s}x). Made with ${SITE}`)
  })

  server.registerTool('list_palettes', {
    title: 'List built-in palettes',
    description: 'List the built-in pixel art palettes and their colours.',
    inputSchema: {},
  }, async () => ({
    content: [{
      type: 'text',
      text: Object.entries(PALETTES).map(([k, v]) => `${k} (${v.split(' ').length}): ${v.split(' ').map(h => '#' + h).join(' ')}`).join('\n') +
        '\n\nBrowse thousands more palettes at https://simplepixelart.com/palettes',
    }],
  }))

  return server
}

// --- HTTP -------------------------------------------------------------------

const hits = new Map() // ip -> [windowStart, count]
setInterval(() => { const t = Date.now(); for (const [k, v] of hits) if (t - v[0] > 60000) hits.delete(k) }, 60000).unref()
function limited(ip) {
  const t = Date.now(), h = hits.get(ip)
  if (!h || t - h[0] > 60000) { hits.set(ip, [t, 1]); return false }
  return ++h[1] > RATE
}
let busy = 0

const LANDING = `<!doctype html><meta charset="utf-8"><title>Pixel Art MCP server</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 16px}code{background:#eee;padding:2px 4px}</style>
<h1>Pixel Art MCP server</h1>
<p>Remote <a href="https://modelcontextprotocol.io">MCP</a> endpoint: <code>https://mcp.simplepixelart.com/mcp</code> (Streamable HTTP, no auth).</p>
<p>Tools: pixelate an image, extract or remap a palette, upscale without blur. Images go in as a URL or base64 and come back as PNG.</p>
<p>Made by <a href="${SITE}">SimplePixelArt</a>, a free online <a href="${EDITOR}">pixel art editor</a>. Source and local version: <a href="https://github.com/comficker/pixel-art-mcp">github.com/comficker/pixel-art-mcp</a>.</p>`

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0
    req.on('data', c => { n += c.length; if (n > MAX_BODY) { reject(Object.assign(new Error('Body too large'), { status: 413 })); req.destroy() } else chunks.push(c) })
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || 'null')) } catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })) } })
    req.on('error', reject)
  })
}

const rpcError = (res, status, message) => {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message }, id: null }))
}

createServer(async (req, res) => {
  const path = req.url.split('?')[0]
  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('access-control-allow-headers', 'content-type, mcp-session-id, mcp-protocol-version, authorization')
  res.setHeader('access-control-expose-headers', 'mcp-session-id')
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }

  if (path === '/' && req.method === 'GET') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(LANDING) }
  if (path === '/health') { res.writeHead(200); return res.end('ok') }
  if (path !== '/mcp') { res.writeHead(404); return res.end('Not found') }
  // Stateless: no server-initiated stream, no sessions to delete.
  if (req.method !== 'POST') return rpcError(res, 405, 'Method not allowed.')

  const ip = req.headers['x-real-ip'] || req.socket.remoteAddress
  if (limited(ip)) { res.setHeader('retry-after', '60'); return rpcError(res, 429, `Rate limit: ${RATE} requests per minute.`) }

  let body
  try { body = await readBody(req) } catch (e) { return rpcError(res, e.status || 400, e.message) }
  const isCall = [].concat(body).some(m => m?.method === 'tools/call')
  if (isCall && busy >= MAX_BUSY) { res.setHeader('retry-after', '5'); return rpcError(res, 503, 'Server busy, try again in a few seconds.') }

  if (isCall) busy++
  const server = buildServer()
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
  res.on('close', () => { transport.close(); server.close() })
  try {
    await server.connect(transport)
    await transport.handleRequest(req, res, body)
  } catch (e) {
    if (!res.headersSent) rpcError(res, 500, 'Internal error.')
  } finally {
    if (isCall) busy--
  }
}).listen(PORT, HOST, () => console.log(`pixel art MCP on http://${HOST}:${PORT}/mcp`))
