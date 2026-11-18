# Pixel Art MCP Server — image to pixel art for Claude, Cursor and VS Code

**English** · [简体中文](README.zh.md) · [Español](README.es.md) · [Português](README.pt.md) · [Русский](README.ru.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

`simplepixelart-mcp` is an [MCP](https://modelcontextprotocol.io) server for pixel art. It lets an AI assistant (Claude, Cursor, Windsurf, VS Code…) convert an image to pixel art — a photo, a PNG or a screenshot — reduce its colors or map it to a PICO-8 or Game Boy palette, extract a palette, and upscale pixel art without blur for game assets and previews.

Free, runs locally, no API key and no native dependencies. Made by [SimplePixelArt](https://simplepixelart.com), whose [image to pixel art converter](https://simplepixelart.com/converter) and [online pixel art editor](https://simplepixelart.com/editor) do the same in the browser.

## Tools

| Tool | What it does | In the browser |
|---|---|---|
| `pixelate_image` | Image → pixel art. Shrinks to a pixel grid (e.g. 64 px wide), reduces to N colours with median cut or maps to a named palette, saves a PNG (optionally upscaled for preview). | [Image to pixel art converter](https://simplepixelart.com/converter) |
| `extract_palette` | Pulls the main colours out of an image and returns hex codes plus a GIMP / Aseprite `.gpl` palette. | [Palette from image](https://simplepixelart.com/palettes/color-palette-from-image) |
| `remap_palette` | Recolours existing pixel art so every pixel uses a palette colour — PICO-8, Game Boy, CGA, EGA, Sweetie 16 or your own hex list. | [Pixel art editor](https://simplepixelart.com/editor) |
| `upscale_pixel_art` | Nearest-neighbour upscale by a whole number, so pixels stay sharp. | [Pixel art resizer](https://simplepixelart.com/pixel-art-resizer) |
| `list_palettes` | Lists the built-in palettes. | [Palette library](https://simplepixelart.com/palettes) |
| `get_palette` | One palette's colours as hex codes or a `.gpl` file. | [Palette library](https://simplepixelart.com/palettes) |
| `search_palettes` | Finds built-in palettes by name or number of colours. | [Palette library](https://simplepixelart.com/palettes) |

Results include a link to keep working in the browser editor — with the palette preloaded when it has a page on SimplePixelArt.

## Palettes

PICO-8, Game Boy (DMG and Pocket), CGA 16 and both CGA mode 4 palettes, EGA 64, RGB 3-3-2, web-safe 216, 1-bit, grayscale 4/8/16 and primary 8 come from [pixel-art-palettes](https://github.com/comficker/pixel-art-palettes) (CC BY 4.0), which also ships them as JSON, CSV and `.gpl` files. [Sweetie 16](https://lospec.com/palette-list/sweetie-16) is by GrafxKid and [ENDESGA 32](https://lospec.com/palette-list/endesga-32) by ENDESGA. `game-boy` still works as a name for `game-boy-dmg`.

## Install

Add it to your MCP client config. For Claude Desktop (`claude_desktop_config.json`), Cursor (`.cursor/mcp.json`) and most other clients:

```json
{
  "mcpServers": {
    "pixel-art": {
      "command": "npx",
      "args": ["-y", "simplepixelart-mcp"]
    }
  }
}
```

Claude Code:

```bash
claude mcp add pixel-art -- npx -y simplepixelart-mcp
```

Requires Node.js 18 or newer.

### Hosted (no install)

A remote endpoint runs at `https://mcp.simplepixelart.com/mcp` (Streamable HTTP, no auth). Images go in as a public URL or base64 and come back as PNG. Limits: 4 MB / 2048x2048 input, 1024 px output, 20 requests a minute.

```bash
claude mcp add --transport http pixel-art https://mcp.simplepixelart.com/mcp
```

```json
{
  "mcpServers": {
    "pixel-art": { "url": "https://mcp.simplepixelart.com/mcp" }
  }
}
```

To run the HTTP server yourself: `npm run start:http` (listens on `127.0.0.1:4020`, set `PORT` / `HOST` to change).

## Examples

Ask your assistant things like:

- "Turn `~/photos/cat.jpg` into 48 px wide pixel art with the PICO-8 palette, and save an 8x preview."
- "Extract a 6-colour palette from this screenshot and give me the .gpl file."
- "Recolour every sprite in `assets/` to the Game Boy palette."
- "Upscale `hero.png` 10x for the store page."

## Use it as a library

```js
import { loadImage, pixelate, saveImage } from 'simplepixelart-mcp/src/pixel.js'

const img = await loadImage('photo.jpg')
const { display, palette } = pixelate(img, { width: 64, palette: 'sweetie-16', scale: 8 })
await saveImage(display, 'photo-pixel.png')
```

## Want to edit the result?

The tools get you a clean starting grid; the fun part is fixing it by hand. Open the PNG in [SimplePixelArt](https://simplepixelart.com/), a free online [pixel art editor](https://simplepixelart.com/editor) with layers, animation and tileset tools, or try its in-browser [pixel art converter](https://simplepixelart.com/converter) for live adjustments. No account needed.

## Development

```bash
npm install
npm test        # starts the server over stdio and calls every tool
```

## About SimplePixelArt

[SimplePixelArt](https://simplepixelart.com) is a free pixel art maker for the browser and [Android](https://play.google.com/store/apps/details?id=com.simple.pixel.art): layers, animation, a [sprite maker](https://simplepixelart.com/sprite-maker), a [tileset editor](https://simplepixelart.com/tilesets/editor) with Godot and Tiled export, [pixel art color palettes](https://simplepixelart.com/palettes), and a community gallery where every piece can be opened and remixed.

## License

MIT © Comficker
