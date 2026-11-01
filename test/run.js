// End-to-end check: start the server over stdio and call every tool.
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadImage } from '../src/pixel.js'

const dir = await mkdtemp(join(tmpdir(), 'pam-'))
const client = new Client({ name: 'test', version: '0' })
await client.connect(new StdioClientTransport({ command: 'node', args: ['src/index.js'] }))
const call = async (name, args) => {
  const r = await client.callTool({ name, arguments: args })
  if (r.isError) throw new Error(`${name}: ${r.content[0].text}`)
  return r.content[0].text
}
const tools = (await client.listTools()).tools.map(t => t.name)
console.log('tools:', tools.join(', '))

let t = await call('pixelate_image', { input: 'test/sample.png', width: 48, colors: 8, scale: 4, output: join(dir, 'a.png') })
let im = await loadImage(join(dir, 'a.png'))
console.log('pixelate png:', im.width, 'x', im.height, '|', t.split('\n')[0])
if (im.width !== 48 * 4) throw new Error('wrong width')

t = await call('pixelate_image', { input: 'test/sample.jpg', width: 40, palette: 'pico-8', output: join(dir, 'b.png') })
console.log('pixelate jpg+pico8:', t.split('\n')[1])

t = await call('extract_palette', { input: 'test/sample.jpg', colors: 6 })
console.log('palette:', t.split('\n')[0])

t = await call('remap_palette', { input: join(dir, 'a.png'), palette: 'game-boy', output: join(dir, 'c.png') })
console.log('remap:', t)
im = await loadImage(join(dir, 'c.png'))
const cols = new Set(); for (let i = 0; i < im.data.length; i += 4) if (im.data[i + 3]) cols.add(im.data.slice(i, i + 3).join())
if (cols.size > 4) throw new Error('remap left extra colours: ' + cols.size)

t = await call('upscale_pixel_art', { input: join(dir, 'c.png'), scale: 2, output: join(dir, 'd.png') })
console.log('upscale:', t)
console.log((await call('list_palettes', {})).split('\n')[0])

const bad = await client.callTool({ name: 'remap_palette', arguments: { input: 'test/sample.png', palette: 'nope' } })
console.log('bad palette isError:', bad.isError, '|', bad.content[0].text.slice(0, 60))
await client.close()
console.log('OK', dir)
