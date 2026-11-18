# 像素画 MCP 服务器 — 在 Claude、Cursor、VS Code 中图片转像素画

[English](README.md) · **简体中文** · [Español](README.es.md) · [Português](README.pt.md) · [Русский](README.ru.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

一个 [MCP](https://modelcontextprotocol.io) 服务器，为 AI 助手（Claude、Cursor、Windsurf、VS Code…）提供真正的像素画工具：把图片转成像素画、提取调色板、把精灵重新着色为 PICO-8 或 Game Boy 配色、无模糊放大。本地运行，支持 PNG/JPEG 文件或图片 URL，无需 API key。

## 工具

| 工具 | 作用 | 浏览器版 |
|---|---|---|
| `pixelate_image` | 图片 → 像素画：缩小到像素网格，用中位切分减色或映射到指定调色板，保存 PNG。 | [图片转像素画](https://simplepixelart.com/converter) |
| `extract_palette` | 提取图片主色，返回十六进制色值和 GIMP/Aseprite `.gpl` 调色板。 | [从图片提取调色板](https://simplepixelart.com/palettes/color-palette-from-image) |
| `remap_palette` | 把像素画重新着色为调色板中的颜色（PICO-8、Game Boy、CGA、EGA、Sweetie 16 或自定义）。 | [像素画编辑器](https://simplepixelart.com/editor) |
| `upscale_pixel_art` | 按整数倍最近邻放大，像素保持清晰。 | [像素画尺寸调整](https://simplepixelart.com/pixel-art-resizer) |
| `list_palettes` | 列出内置调色板。 | [调色板库](https://simplepixelart.com/palettes) |
| `get_palette` | 以十六进制或 `.gpl` 文件返回某个调色板。 | [调色板库](https://simplepixelart.com/palettes) |
| `search_palettes` | 按名称或颜色数查找内置调色板。 | [调色板库](https://simplepixelart.com/palettes) |

结果中附带在浏览器编辑器里继续编辑的链接；调色板在 SimplePixelArt 有页面时会预先载入。

## 安装

添加到 MCP 客户端配置（Claude Desktop、Cursor 等）：

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

Claude Code：

```bash
claude mcp add pixel-art -- npx -y simplepixelart-mcp
```

托管版（无需安装）：`https://mcp.simplepixelart.com/mcp`（Streamable HTTP，无需认证）。

```bash
claude mcp add --transport http pixel-art https://mcp.simplepixelart.com/mcp
```

需要 Node.js 18 或更高版本。

## 调色板

PICO-8、Game Boy、CGA、EGA、网页安全色等来自 [pixel-art-palettes](https://github.com/comficker/pixel-art-palettes)（CC BY 4.0）。[Sweetie 16](https://lospec.com/palette-list/sweetie-16) 作者 GrafxKid，[ENDESGA 32](https://lospec.com/palette-list/endesga-32) 作者 ENDESGA。

## 关于 SimplePixelArt

[SimplePixelArt](https://simplepixelart.com) 是免费的浏览器和 Android 像素画编辑器：图层、动画、精灵图表、可导出到 Godot 和 Tiled 的图块集，以及可打开、可二次创作的社区作品库。

## 许可

MIT © Comficker
