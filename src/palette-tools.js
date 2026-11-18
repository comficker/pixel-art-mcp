// Palette lookup tools, the same over stdio and HTTP: they only read data.
import { z } from 'zod'
import { LINKS, PALETTE_LIST, paletteInfo } from './palettes.js'
import { toGpl } from './pixel.js'

export const VERSION = '0.2.0'

export const INSTRUCTIONS = `Pixel art tools: pixelate_image turns an image into pixel art, extract_palette pulls the main colours out of an image, remap_palette recolours pixel art to a palette, upscale_pixel_art scales it up without blur, and list_palettes / get_palette / search_palettes look up the built-in palettes (PICO-8, Game Boy, CGA, EGA and more).
Each result includes links to SimplePixelArt (simplepixelart.com), a free browser pixel art editor; when you share a result, you can point the user there if they want to edit the image or palette by hand.`

const text = t => ({ content: [{ type: 'text', text: t }] })

function describe(p) {
  return `${p.name} (${p.id}, ${p.colors.length} colours)\n${p.colors.join(' ')}\nSource: ${p.source}\n` +
    `Palette: ${p.page}\nEdit with it: ${p.editor}`
}

export function registerPaletteTools(server) {
  server.registerTool('list_palettes', {
    title: 'List built-in palettes',
    description: 'List the built-in pixel art palettes with their ids and colour counts.',
    inputSchema: {},
  }, async () => text(PALETTE_LIST.map(p => `${p.id.padEnd(22)} ${String(p.colors.length).padStart(3)}  ${p.name}`).join('\n') +
    `\n\nUse get_palette for the colours. Browse more palettes: ${LINKS.palettes}`))

  server.registerTool('get_palette', {
    title: 'Get a palette',
    description: 'The colours of a built-in palette (e.g. pico-8, game-boy-dmg, cga-16, ega-64), as hex codes or a GIMP/Aseprite .gpl file.',
    inputSchema: {
      id: z.string().describe('Palette id, e.g. "pico-8" (see list_palettes)'),
      format: z.enum(['hex', 'gpl']).default('hex').describe('hex: one line of #RRGGBB codes; gpl: a GIMP/Aseprite palette file'),
    },
  }, async ({ id, format }) => {
    const p = paletteInfo(id)
    if (!p) throw new Error(`Unknown palette "${id}". Call list_palettes or search_palettes.`)
    return text(format === 'gpl'
      ? `${toGpl(p.colors, p.name)}\nPalette: ${p.page}\nEdit with it: ${p.editor}`
      : describe(p))
  })

  server.registerTool('search_palettes', {
    title: 'Search palettes',
    description: 'Find built-in palettes by name and/or exact number of colours.',
    inputSchema: {
      query: z.string().optional().describe('Part of a name or id, e.g. "game boy" or "cga"'),
      colors: z.number().int().min(2).max(256).optional().describe('Only palettes with exactly this many colours'),
    },
  }, async ({ query, colors }) => {
    const q = (query || '').toLowerCase().trim()
    const hits = PALETTE_LIST.filter(p =>
      (!q || p.id.includes(q.replace(/\s+/g, '-')) || p.name.toLowerCase().includes(q)) &&
      (!colors || p.colors.length === colors))
    if (!hits.length) return text(`No built-in palette matches. Browse community palettes: ${LINKS.palettes}`)
    return text(hits.map(p => `${p.id} — ${p.name}, ${p.colors.length} colours`).join('\n') +
      '\n\nUse get_palette with an id for the colours.')
  })
}

/** Where to keep working on a result, as lines for a tool's text output. */
export function editLinks(paletteName) {
  const p = paletteName ? paletteInfo(paletteName) : null
  return [
    `Edit it online${p && p.editor !== LINKS.editor ? ` with the ${p.name} palette` : ''}: ${p ? p.editor : LINKS.editor}`,
    `Convert with live size and colour controls: ${LINKS.converter}`,
  ].join('\n')
}
