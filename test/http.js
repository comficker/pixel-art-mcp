// Starts the HTTP server and calls every tool over Streamable HTTP.
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const PORT = 4799
const proc = spawn(process.execPath, ['src/http.js'], { env: { ...process.env, PORT }, stdio: ['ignore', 'pipe', 'inherit'] })
await new Promise(r => proc.stdout.once('data', r))
const url = `http://127.0.0.1:${PORT}/mcp`
const b64 = readFileSync(new URL('./sample.png', import.meta.url)).toString('base64')
const jpg = readFileSync(new URL('./sample.jpg', import.meta.url)).toString('base64')

const client = new Client({ name: 'test', version: '0' })
await client.connect(new StreamableHTTPClientTransport(new URL(url)))
const show = (label, r) => console.log(label + ':', r.isError ? 'ERROR' : '', r.content.map(c => c.type === 'image' ? `[png ${c.data.length}b64]` : c.text.split('\n')[0]).join(' | '))
console.log('tools:', (await client.listTools()).tools.map(t => t.name).join(', '))
show('pixelate', await client.callTool({ name: 'pixelate_image', arguments: { image_base64: b64, width: 48, colors: 8 } }))
show('pixelate jpg pico', await client.callTool({ name: 'pixelate_image', arguments: { image_base64: 'data:image/jpeg;base64,' + jpg, palette: 'pico-8' } }))
show('palette', await client.callTool({ name: 'extract_palette', arguments: { image_base64: b64, colors: 6 } }))
show('remap', await client.callTool({ name: 'remap_palette', arguments: { image_base64: b64, palette: 'game-boy' } }))
show('upscale', await client.callTool({ name: 'upscale_pixel_art', arguments: { image_base64: b64, scale: 4 } }))
show('url real', await client.callTool({ name: 'pixelate_image', arguments: { image_url: 'https://simplepixelart.com/android-chrome-512x512.png', width: 32 } }))
show('ssrf localhost', await client.callTool({ name: 'pixelate_image', arguments: { image_url: `http://127.0.0.1:${PORT}/health` } }))
show('ssrf metadata', await client.callTool({ name: 'pixelate_image', arguments: { image_url: 'http://169.254.169.254/latest/meta-data/' } }))
show('ssrf dns', await client.callTool({ name: 'pixelate_image', arguments: { image_url: 'http://localtest.me/' } }))
show('ssrf mapped', await client.callTool({ name: 'pixelate_image', arguments: { image_url: `http://[::ffff:127.0.0.1]:${PORT}/health` } }))
show('no input', await client.callTool({ name: 'pixelate_image', arguments: {} }))
let n429 = 0
for (let i = 0; i < 20; i++) { const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: '{"jsonrpc":"2.0","id":1,"method":"ping"}' }); if (r.status === 429) n429++ }
console.log('rate limited responses out of 20 extra:', n429)
const big = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: 'x'.repeat(7e6) }).catch(e => ({ status: 'reset' }))
console.log('7MB body:', big.status)
proc.kill()
process.exit(0)
