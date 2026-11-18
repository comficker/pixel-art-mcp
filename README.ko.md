# 픽셀 아트 MCP 서버 — Claude, Cursor, VS Code에서 이미지를 픽셀 아트로

[English](README.md) · [简体中文](README.zh.md) · [Español](README.es.md) · [Português](README.pt.md) · [Русский](README.ru.md) · **한국어** · [日本語](README.ja.md)

AI 어시스턴트(Claude, Cursor, Windsurf, VS Code…)에게 실제 픽셀 아트 도구를 주는 [MCP](https://modelcontextprotocol.io) 서버입니다. 이미지를 픽셀 아트로 바꾸고, 팔레트를 추출하고, 스프라이트를 PICO-8이나 게임보이 색으로 바꾸고, 흐림 없이 확대합니다. 로컬에서 PNG/JPEG 파일이나 이미지 URL로 동작하며 API 키가 필요 없습니다.

## 도구

| 도구 | 기능 | 브라우저 버전 |
|---|---|---|
| `pixelate_image` | 이미지 → 픽셀 아트: 픽셀 격자로 줄이고 median cut으로 색을 줄이거나 지정 팔레트에 맞춰 PNG로 저장합니다. | [이미지 → 픽셀 아트 변환기](https://simplepixelart.com/converter) |
| `extract_palette` | 이미지의 주요 색을 hex 코드와 GIMP/Aseprite `.gpl` 팔레트로 뽑아 줍니다. | [이미지에서 팔레트 추출](https://simplepixelart.com/palettes/color-palette-from-image) |
| `remap_palette` | 픽셀 아트를 팔레트 색으로 다시 칠합니다(PICO-8, 게임보이, CGA, EGA, Sweetie 16 또는 직접 지정). | [픽셀 아트 에디터](https://simplepixelart.com/editor) |
| `upscale_pixel_art` | 정수 배율 최근접 이웃 방식으로 확대해 픽셀을 선명하게 유지합니다. | [픽셀 아트 리사이저](https://simplepixelart.com/pixel-art-resizer) |
| `list_palettes` | 내장 팔레트 목록을 보여 줍니다. | [팔레트 라이브러리](https://simplepixelart.com/palettes) |
| `get_palette` | 팔레트 하나를 hex 코드나 `.gpl` 파일로 돌려줍니다. | [팔레트 라이브러리](https://simplepixelart.com/palettes) |
| `search_palettes` | 이름이나 색 수로 내장 팔레트를 찾습니다. | [팔레트 라이브러리](https://simplepixelart.com/palettes) |

결과에는 브라우저 에디터에서 이어서 작업할 수 있는 링크가 들어 있으며, SimplePixelArt에 페이지가 있는 팔레트는 미리 불러옵니다.

## 설치

MCP 클라이언트 설정에 추가하세요(Claude Desktop, Cursor 등):

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

호스팅 버전(설치 불필요): `https://mcp.simplepixelart.com/mcp` (Streamable HTTP, 인증 없음).

```bash
claude mcp add --transport http pixel-art https://mcp.simplepixelart.com/mcp
```

Node.js 18 이상이 필요합니다.

## 팔레트

PICO-8, 게임보이, CGA, EGA, 웹 안전색 등은 [pixel-art-palettes](https://github.com/comficker/pixel-art-palettes)(CC BY 4.0)에서 가져왔습니다. [Sweetie 16](https://lospec.com/palette-list/sweetie-16)은 GrafxKid, [ENDESGA 32](https://lospec.com/palette-list/endesga-32)는 ENDESGA의 작품입니다.

## SimplePixelArt 소개

[SimplePixelArt](https://simplepixelart.com)는 브라우저와 안드로이드용 무료 픽셀 아트 에디터입니다. 레이어, 애니메이션, 스프라이트 시트, Godot와 Tiled로 내보내는 타일셋, 그리고 모든 작품을 열어 리믹스할 수 있는 갤러리가 있습니다.

## 라이선스

MIT © Comficker
