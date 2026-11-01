#!/usr/bin/env node
// MCP server (stdio) exposing the pixel art operations in pixel.js as tools.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { basename, dirname, extname, join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  PALETTES, loadImage, saveImage, pixelate, medianCut, downscale, remap, resolvePalette, upscale, usedColors, rgbToHex, toGpl,
} from './pixel.js'

const server = new McpServer({ name: 'simplepixelart-mcp', version: '0.1.1' })

/** Default output next to a local input (or in the temp dir for URLs). */
function outPath(input, suffix, output) {
  if (output) return output
  const dir = /^https?:\/\//.test(input) ? tmpdir() : dirname(input)
  const name = basename(input.split('?')[0], extname(input.split('?')[0])) || 'image'
  return join(dir, `${name}-${suffix}.png`)
}
const text = t => ({ content: [{ type: 'text', text: t }] })
const paletteHelp = `Palette name (${Object.keys(PALETTES).join(', ')}) or hex colours like "#1a1c2c,#5d275d"`

server.registerTool('pixelate_image', {
  title: 'Image to pixel art',
  description: 'Turn a photo or illustration into pixel art: shrink it to a pixel grid, reduce it to a few colours (or a named palette) and save a PNG. Accepts a local PNG/JPEG path or an http(s) URL.',
  inputSchema: {
    input: z.string().describe('Path or URL of a PNG or JPEG image'),
    width: z.number().int().min(4).max(512).default(64).describe('Width of the pixel grid in pixels (height keeps the aspect ratio)'),
    colors: z.number().int().min(2).max(64).default(16).describe('Number of colours when no palette is given'),
    palette: z.string().optional().describe(paletteHelp),
    scale: z.number().int().min(1).max(32).default(1).describe('Upscale factor for the saved PNG, nearest neighbour (e.g. 8 for a crisp preview)'),
    output: z.string().optional().describe('Where to save the PNG (defaults next to the input)'),
  },
}, async ({ input, width, colors, palette, scale, output }) => {
  const img = await loadImage(input)
  const r = pixelate(img, { width, colors, palette, scale })
  const path = await saveImage(r.display, outPath(input, `pixel-${r.pixel.width}x${r.pixel.height}`, output))
  return text(`Saved ${r.pixel.width}x${r.pixel.height} pixel art (${r.palette.length} colours${scale > 1 ? `, shown at ${scale}x` : ''}) to ${path}\nPalette: ${r.palette.join(' ')}\nEdit it further in the free online pixel art editor: https://simplepixelart.com/editor`)
})

server.registerTool('extract_palette', {
  title: 'Extract palette',
  description: 'Pull the main colours out of an image (median cut). Returns hex codes plus a GIMP/Aseprite .gpl palette.',
  inputSchema: {
    input: z.string().describe('Path or URL of a PNG or JPEG image'),
    colors: z.number().int().min(2).max(64).default(8).describe('How many colours to extract'),
  },
}, async ({ input, colors }) => {
  const img = downscale(await loadImage(input), 256)
  const hexes = medianCut(img, colors).map(rgbToHex)
  return text(`${hexes.join(' ')}\n\n${toGpl(hexes, basename(input))}`)
})

server.registerTool('remap_palette', {
  title: 'Recolour to a palette',
  description: 'Recolour an existing pixel art image so every pixel uses a colour from the given palette (e.g. PICO-8 or Game Boy). Size is kept.',
  inputSchema: {
    input: z.string().describe('Path or URL of a PNG or JPEG image'),
    palette: z.string().describe(paletteHelp),
    output: z.string().optional().describe('Where to save the PNG'),
  },
}, async ({ input, palette, output }) => {
  const img = remap(await loadImage(input), resolvePalette(palette))
  const path = await saveImage(img, outPath(input, 'remap', output))
  return text(`Saved ${img.width}x${img.height} image using ${usedColors(img).length} colours to ${path}`)
})

server.registerTool('upscale_pixel_art', {
  title: 'Upscale without blur',
  description: 'Scale pixel art up by a whole number with nearest neighbour, so pixels stay sharp (for previews, store pages or social posts).',
  inputSchema: {
    input: z.string().describe('Path or URL of a PNG image'),
    scale: z.number().int().min(2).max(64).default(8),
    output: z.string().optional(),
  },
}, async ({ input, scale, output }) => {
  const img = upscale(await loadImage(input), scale)
  const path = await saveImage(img, outPath(input, `x${scale}`, output))
  return text(`Saved ${img.width}x${img.height} to ${path}`)
})

server.registerTool('list_palettes', {
  title: 'List built-in palettes',
  description: 'List the built-in pixel art palettes and their colours.',
  inputSchema: {},
}, async () => text(Object.entries(PALETTES).map(([k, v]) => `${k} (${v.split(' ').length}): ${v.split(' ').map(h => '#' + h).join(' ')}`).join('\n') +
  '\n\nBrowse thousands more palettes at https://simplepixelart.com/palettes'))

await server.connect(new StdioServerTransport())
