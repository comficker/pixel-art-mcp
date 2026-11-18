# Servidor MCP de pixel art — converter imagem em pixel art no Claude, Cursor e VS Code

[English](README.md) · [简体中文](README.zh.md) · [Español](README.es.md) · **Português** · [Русский](README.ru.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

Um servidor [MCP](https://modelcontextprotocol.io) que dá aos assistentes de IA (Claude, Cursor, Windsurf, VS Code…) ferramentas reais de pixel art: transformar qualquer imagem em pixel art, extrair uma paleta, recolorir sprites para PICO-8 ou Game Boy e ampliar sem borrar. Roda localmente, com arquivos PNG/JPEG ou URLs, sem chave de API.

## Ferramentas

| Ferramenta | O que faz | No navegador |
|---|---|---|
| `pixelate_image` | Imagem → pixel art: reduz a uma grade de pixels, limita as cores com median cut ou as ajusta a uma paleta, e salva um PNG. | [Conversor de imagem em pixel art](https://simplepixelart.com/converter) |
| `extract_palette` | Extrai as cores principais de uma imagem em códigos hex e uma paleta `.gpl` do GIMP/Aseprite. | [Paleta a partir de imagem](https://simplepixelart.com/palettes/color-palette-from-image) |
| `remap_palette` | Recolore pixel art com as cores de uma paleta (PICO-8, Game Boy, CGA, EGA, Sweetie 16 ou a sua). | [Editor de pixel art](https://simplepixelart.com/editor) |
| `upscale_pixel_art` | Amplia por um número inteiro com vizinho mais próximo, mantendo os pixels nítidos. | [Redimensionador de pixel art](https://simplepixelart.com/pixel-art-resizer) |
| `list_palettes` | Lista as paletas incluídas. | [Biblioteca de paletas](https://simplepixelart.com/palettes) |
| `get_palette` | Retorna uma paleta em códigos hex ou arquivo `.gpl`. | [Biblioteca de paletas](https://simplepixelart.com/palettes) |
| `search_palettes` | Procura paletas por nome ou número de cores. | [Biblioteca de paletas](https://simplepixelart.com/palettes) |

Os resultados trazem um link para continuar no editor do navegador, com a paleta carregada quando ela tem página no SimplePixelArt.

## Instalação

Adicione à configuração MCP do seu cliente (Claude Desktop, Cursor…):

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

Versão hospedada (sem instalar): `https://mcp.simplepixelart.com/mcp` (Streamable HTTP, sem autenticação).

```bash
claude mcp add --transport http pixel-art https://mcp.simplepixelart.com/mcp
```

Requer Node.js 18 ou mais recente.

## Paletas

PICO-8, Game Boy, CGA, EGA, cores seguras para web e outras vêm do [pixel-art-palettes](https://github.com/comficker/pixel-art-palettes) (CC BY 4.0). [Sweetie 16](https://lospec.com/palette-list/sweetie-16) é de GrafxKid e [ENDESGA 32](https://lospec.com/palette-list/endesga-32) de ENDESGA.

## Sobre o SimplePixelArt

O [SimplePixelArt](https://simplepixelart.com) é um editor de pixel art gratuito para navegador e Android: camadas, animação, sprite sheets, tilesets que exportam para Godot e Tiled, e uma galeria em que cada obra pode ser aberta e remixada.

## Licença

MIT © Comficker
