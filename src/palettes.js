// The palettes the tools understand, and where each one lives on
// SimplePixelArt. Most come from the pixel-art-palettes package (hardware and
// standard colour sets, CC BY 4.0); two artist palettes have shipped since
// 0.1 and stay, credited to their authors, so existing prompts keep working.
import { palettes as LIBRARY } from 'pixel-art-palettes'

const SITE = 'https://simplepixelart.com'

export const LINKS = {
  site: `${SITE}/`,
  editor: `${SITE}/editor`,
  converter: `${SITE}/converter`,
  palettes: `${SITE}/palettes`,
  paletteFromImage: `${SITE}/palettes/color-palette-from-image`,
  resizer: `${SITE}/pixel-art-resizer`,
}

const ARTIST = [
  {
    id: 'sweetie-16', name: 'Sweetie 16', author: 'GrafxKid',
    colors: '1A1C2C 5D275D B13E53 EF7D57 FFCD75 A7F070 38B764 257179 29366F 3B5DC9 41A6F6 73EFF7 F4F4F4 94B0C2 566C86 333C57',
    sourceUrl: 'https://lospec.com/palette-list/sweetie-16',
  },
  {
    id: 'endesga-32', name: 'ENDESGA 32', author: 'ENDESGA',
    colors: 'BE4A2F D77643 EAD4AA E4A672 B86F50 733E39 3E2731 A22633 E43B44 F77622 FEAE34 FEE761 63C74D 3E8948 265C42 193C3E 124E89 0099DB 2CE8F5 FFFFFF C0CBDC 8B9BB4 5A6988 3A4466 262B44 181425 FF0044 68386C B55088 F6757A E8B796 C28569',
    sourceUrl: 'https://lospec.com/palette-list/endesga-32',
  },
]

/** Every palette: {id, name, colors: '#RRGGBB'[], source, page, editor}. */
export const PALETTE_LIST = [
  ...LIBRARY.map(p => ({
    id: p.id, name: p.name, colors: p.colors, source: p.source,
    page: p.simplepixelart.page, editor: p.simplepixelart.editor,
  })),
  ...ARTIST.map(p => ({
    id: p.id, name: p.name, colors: p.colors.split(' ').map(h => '#' + h),
    source: `By ${p.author} (${p.sourceUrl}).`,
    page: LINKS.palettes, editor: LINKS.editor,
  })),
]

// Names that shipped in 0.1 and still resolve.
const ALIASES = { 'game-boy': 'game-boy-dmg' }

const byId = new Map(PALETTE_LIST.map(p => [p.id, p]))

/** The palette for a name or alias (case-insensitive), or undefined. */
export function paletteInfo(name) {
  const key = String(name || '').toLowerCase()
  return byId.get(ALIASES[key] || key)
}

/** id -> 'RRGGBB RRGGBB …', the shape pixel.js has always exported. */
export const PALETTES = Object.fromEntries([
  ...PALETTE_LIST.map(p => [p.id, p.colors.map(h => h.slice(1)).join(' ')]),
  ...Object.entries(ALIASES).map(([alias, id]) => [alias, byId.get(id).colors.map(h => h.slice(1)).join(' ')]),
])
