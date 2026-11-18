# ドット絵 MCP サーバー — Claude・Cursor・VS Code で画像をドット絵に変換

[English](README.md) · [简体中文](README.zh.md) · [Español](README.es.md) · [Português](README.pt.md) · [Русский](README.ru.md) · [한국어](README.ko.md) · **日本語**

AI アシスタント（Claude、Cursor、Windsurf、VS Code…）に本物のドット絵ツールを提供する [MCP](https://modelcontextprotocol.io) サーバーです。画像をドット絵に変換し、パレットを抽出し、スプライトを PICO-8 やゲームボーイの色に塗り替え、ぼかさずに拡大します。ローカルで動作し、PNG/JPEG ファイルや画像 URL に対応、API キーは不要です。

## ツール

| ツール | できること | ブラウザ版 |
|---|---|---|
| `pixelate_image` | 画像 → ドット絵：ピクセルグリッドに縮小し、メディアンカットで減色するか指定パレットに合わせて PNG で保存します。 | [画像をドット絵に変換](https://simplepixelart.com/converter) |
| `extract_palette` | 画像の主要な色を hex コードと GIMP/Aseprite 用 `.gpl` パレットで返します。 | [画像からパレット抽出](https://simplepixelart.com/palettes/color-palette-from-image) |
| `remap_palette` | ドット絵をパレットの色で塗り替えます（PICO-8、ゲームボーイ、CGA、EGA、Sweetie 16、または任意の色）。 | [ドット絵エディタ](https://simplepixelart.com/editor) |
| `upscale_pixel_art` | 整数倍のニアレストネイバーで拡大し、ピクセルをくっきり保ちます。 | [ドット絵リサイズツール](https://simplepixelart.com/pixel-art-resizer) |
| `list_palettes` | 内蔵パレットの一覧を表示します。 | [パレットライブラリ](https://simplepixelart.com/palettes) |
| `get_palette` | パレットを hex コードまたは `.gpl` ファイルで返します。 | [パレットライブラリ](https://simplepixelart.com/palettes) |
| `search_palettes` | 名前や色数で内蔵パレットを探します。 | [パレットライブラリ](https://simplepixelart.com/palettes) |

結果にはブラウザのエディタで続きを編集できるリンクが付き、SimplePixelArt にページがあるパレットは読み込んだ状態で開きます。

## インストール

MCP クライアントの設定に追加します（Claude Desktop、Cursor など）：

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

ホスト版（インストール不要）：`https://mcp.simplepixelart.com/mcp`（Streamable HTTP、認証なし）。

```bash
claude mcp add --transport http pixel-art https://mcp.simplepixelart.com/mcp
```

Node.js 18 以上が必要です。

## パレット

PICO-8、ゲームボーイ、CGA、EGA、Web セーフカラーなどは [pixel-art-palettes](https://github.com/comficker/pixel-art-palettes)（CC BY 4.0）から。[Sweetie 16](https://lospec.com/palette-list/sweetie-16) は GrafxKid、[ENDESGA 32](https://lospec.com/palette-list/endesga-32) は ENDESGA の作品です。

## SimplePixelArt について

[SimplePixelArt](https://simplepixelart.com) はブラウザと Android で使える無料のドット絵エディタです。レイヤー、アニメーション、スプライトシート、Godot・Tiled へ書き出せるタイルセット、そしてどの作品も開いてリミックスできるギャラリーがあります。

## ライセンス

MIT © Comficker
