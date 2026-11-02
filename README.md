# simplepixelart-mcp

An [MCP](https://modelcontextprotocol.io) server that gives AI assistants (Claude, Cursor, Windsurf, VS Code…) real pixel art tools: turn any image into pixel art, extract a palette, recolour sprites to PICO-8 or Game Boy colours, and upscale without blur.

Runs locally, works on PNG and JPEG files or image URLs, no API keys, no native dependencies.

## Tools

| Tool | What it does |
|---|---|
| `pixelate_image` | Image → pixel art. Shrinks to a pixel grid (e.g. 64 px wide), reduces to N colours with median cut or maps to a named palette, saves a PNG (optionally upscaled for preview). |
| `extract_palette` | Pulls the main colours out of an image and returns hex codes plus a GIMP / Aseprite `.gpl` palette. |
| `remap_palette` | Recolours existing pixel art so every pixel uses a palette colour — PICO-8, Sweetie 16, ENDESGA 32, Game Boy, 1-bit or your own hex list. |
| `upscale_pixel_art` | Nearest-neighbour upscale by a whole number, so pixels stay sharp. |
| `list_palettes` | Lists the built-in palettes. |

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

## License

MIT © Comficker
