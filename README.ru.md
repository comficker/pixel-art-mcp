# MCP-сервер для пиксель арта — изображение в пиксель-арт в Claude, Cursor и VS Code

[English](README.md) · [简体中文](README.zh.md) · [Español](README.es.md) · [Português](README.pt.md) · **Русский** · [한국어](README.ko.md) · [日本語](README.ja.md)

[MCP](https://modelcontextprotocol.io)-сервер, который даёт ИИ-ассистентам (Claude, Cursor, Windsurf, VS Code…) настоящие инструменты для пиксель-арта: превратить любое изображение в пиксель-арт, извлечь палитру, перекрасить спрайты в PICO-8 или Game Boy и увеличить без размытия. Работает локально с PNG/JPEG или URL, без API-ключей.

## Инструменты

| Инструмент | Что делает | В браузере |
|---|---|---|
| `pixelate_image` | Изображение → пиксель-арт: уменьшает до пиксельной сетки, сокращает цвета методом median cut или приводит к палитре, сохраняет PNG. | [Конвертер изображений в пиксель-арт](https://simplepixelart.com/converter) |
| `extract_palette` | Извлекает основные цвета изображения в hex и палитру `.gpl` для GIMP/Aseprite. | [Палитра из изображения](https://simplepixelart.com/palettes/color-palette-from-image) |
| `remap_palette` | Перекрашивает пиксель-арт в цвета палитры (PICO-8, Game Boy, CGA, EGA, Sweetie 16 или своей). | [Редактор пиксель-арта](https://simplepixelart.com/editor) |
| `upscale_pixel_art` | Увеличивает в целое число раз методом ближайшего соседа, пиксели остаются чёткими. | [Ресайзер пиксель-арта](https://simplepixelart.com/pixel-art-resizer) |
| `list_palettes` | Список встроенных палитр. | [Библиотека палитр](https://simplepixelart.com/palettes) |
| `get_palette` | Палитра в виде hex-кодов или файла `.gpl`. | [Библиотека палитр](https://simplepixelart.com/palettes) |
| `search_palettes` | Поиск встроенных палитр по названию или числу цветов. | [Библиотека палитр](https://simplepixelart.com/palettes) |

В результатах есть ссылка, чтобы продолжить в редакторе в браузере — с уже загруженной палитрой, если у неё есть страница на SimplePixelArt.

## Установка

Добавьте в конфигурацию MCP вашего клиента (Claude Desktop, Cursor…):

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

Хостинг-версия (без установки): `https://mcp.simplepixelart.com/mcp` (Streamable HTTP, без авторизации).

```bash
claude mcp add --transport http pixel-art https://mcp.simplepixelart.com/mcp
```

Нужен Node.js 18 или новее.

## Палитры

PICO-8, Game Boy, CGA, EGA, веб-безопасные цвета и другие взяты из [pixel-art-palettes](https://github.com/comficker/pixel-art-palettes) (CC BY 4.0). [Sweetie 16](https://lospec.com/palette-list/sweetie-16) — автор GrafxKid, [ENDESGA 32](https://lospec.com/palette-list/endesga-32) — ENDESGA.

## О SimplePixelArt

[SimplePixelArt](https://simplepixelart.com) — бесплатный редактор пиксель-арта для браузера и Android: слои, анимация, спрайтшиты, тайлсеты с экспортом в Godot и Tiled и галерея, где любую работу можно открыть и переделать.

## Лицензия

MIT © Comficker
