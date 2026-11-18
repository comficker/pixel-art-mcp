# Servidor MCP de pixel art — convertir imagen a pixel art en Claude, Cursor y VS Code

[English](README.md) · [简体中文](README.zh.md) · **Español** · [Português](README.pt.md) · [Русский](README.ru.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

Un servidor [MCP](https://modelcontextprotocol.io) que da a los asistentes de IA (Claude, Cursor, Windsurf, VS Code…) herramientas reales de pixel art: convertir cualquier imagen en pixel art, extraer una paleta, recolorear sprites a PICO-8 o Game Boy y ampliar sin desenfoque. Funciona en local, con archivos PNG/JPEG o URLs, sin claves de API.

## Herramientas

| Herramienta | Qué hace | En el navegador |
|---|---|---|
| `pixelate_image` | Imagen → pixel art: reduce a una cuadrícula de píxeles, limita los colores con median cut o los ajusta a una paleta, y guarda un PNG. | [Convertidor de imagen a pixel art](https://simplepixelart.com/converter) |
| `extract_palette` | Extrae los colores principales de una imagen como códigos hex y una paleta `.gpl` de GIMP/Aseprite. | [Paleta desde imagen](https://simplepixelart.com/palettes/color-palette-from-image) |
| `remap_palette` | Recolorea pixel art con los colores de una paleta (PICO-8, Game Boy, CGA, EGA, Sweetie 16 o la tuya). | [Editor de pixel art](https://simplepixelart.com/editor) |
| `upscale_pixel_art` | Amplía por un número entero con vecino más cercano, sin perder nitidez. | [Redimensionador de pixel art](https://simplepixelart.com/pixel-art-resizer) |
| `list_palettes` | Lista las paletas incluidas. | [Biblioteca de paletas](https://simplepixelart.com/palettes) |
| `get_palette` | Devuelve una paleta como códigos hex o archivo `.gpl`. | [Biblioteca de paletas](https://simplepixelart.com/palettes) |
| `search_palettes` | Busca paletas por nombre o número de colores. | [Biblioteca de paletas](https://simplepixelart.com/palettes) |

Los resultados incluyen un enlace para seguir en el editor del navegador, con la paleta cargada si tiene página en SimplePixelArt.

## Instalación

Añádelo a la configuración MCP de tu cliente (Claude Desktop, Cursor…):

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

Versión alojada (sin instalar): `https://mcp.simplepixelart.com/mcp` (Streamable HTTP, sin autenticación).

```bash
claude mcp add --transport http pixel-art https://mcp.simplepixelart.com/mcp
```

Requiere Node.js 18 o superior.

## Paletas

PICO-8, Game Boy, CGA, EGA, colores web seguros y otras vienen de [pixel-art-palettes](https://github.com/comficker/pixel-art-palettes) (CC BY 4.0). [Sweetie 16](https://lospec.com/palette-list/sweetie-16) es de GrafxKid y [ENDESGA 32](https://lospec.com/palette-list/endesga-32) de ENDESGA.

## Sobre SimplePixelArt

[SimplePixelArt](https://simplepixelart.com) es un editor de pixel art gratuito para navegador y Android: capas, animación, sprite sheets, tilesets que se exportan a Godot y Tiled, y una galería donde cada obra se puede abrir y remezclar.

## Licencia

MIT © Comficker
