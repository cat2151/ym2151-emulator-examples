# Windows専用セットアップガイド

このプロジェクトは**Windows専用**です。各言語版のYM2151エミュレータサンプルを実行するための手順を説明します。

## 前提条件

- Windows 10/11
- Python 3.8以上（ライブラリダウンロード/ビルドスクリプトの実行に必要）

## クイックスタート

### 1. ライブラリの取得

プロジェクトルートで以下を実行：

```powershell
# すべての言語のライブラリをダウンロード
python scripts\download_libs.py
```

個別の言語のみ取得する場合：

```powershell
python scripts\download_libs.py python   # Python版のみ
python scripts\download_libs.py rust     # Rust版のみ
python scripts\download_libs.py go       # Go版のみ
python scripts\download_libs.py typescript # TypeScript版のみ
```

### 2. 各言語版の実行

各言語のREADMEを参照してください：

- [Python版](src/python/README.md)
- [Rust版](src/rust/README.md)
- [Go版](src/go/README.md)
- [TypeScript/Node.js版](src/typescript_deno/README.md)

## YM2151エミュレータライブラリについて

このプロジェクトで使用するYM2151エミュレータライブラリは、[ym2151-emu-win-bin](https://github.com/cat2151/ym2151-emu-win-bin) リポジトリで管理されています。

### 提供されるライブラリ

| 言語 | ライブラリファイル | エミュレータ | 説明 |
|------|------------------|------------|------|
| Python | `ym2151.dll` | Nuked-OPM | ctypes経由で利用 |
| Rust | `libym2151.a` | Nuked-OPM | 静的ライブラリ |
| Go | `libym2151.a` | Nuked-OPM | CGO経由で利用 |
| TypeScript/Node.js | `libymfm.wasm` | libymfm | WebAssembly (既に含まれています) |

### 重要なポイント

- **MinGW DLL非依存**: すべてのライブラリはMinGW DLLに依存しません（静的リンク）
- **Windows専用**: すべてのライブラリはWindows環境向けにビルドされています
- **MSYS2不要**: ライブラリをダウンロードして使用する限り、MSYS2のインストールは不要です

## ローカルビルド（オプション）

ライブラリをローカルでビルドしたい場合は、MSYS2環境が必要です。

### MSYS2のセットアップ

1. [MSYS2](https://www.msys2.org/) をダウンロードしてインストール
2. MSYS2 MINGW64ターミナルを開く
3. GCCをインストール：
   ```bash
   pacman -S mingw-w64-x86_64-gcc
   ```

### ビルド実行

```powershell
python scripts\build_libs.py
```

**注意**: ビルドスクリプトは、MSYS2がデフォルトの場所（`C:\msys64`）にインストールされていることを前提としています。

## トラブルシューティング

### ライブラリのダウンロードに失敗する

```
✗ Failed to download: HTTP Error 404
```

→ ym2151-emu-win-binリポジトリにまだバイナリがコミットされていない可能性があります。その場合は、ローカルビルドを試してください：

```powershell
python scripts\build_libs.py
```

### MSYS2が見つからない（ローカルビルド時）

```
✗ MSYS2 が見つかりません
```

→ [MSYS2](https://www.msys2.org/) をインストールし、MINGW64環境でGCCをインストールしてください：

```bash
pacman -S mingw-w64-x86_64-gcc
```

### Pythonが見つからない

```
'python' is not recognized as an internal or external command
```

→ Python 3.8以上をインストールしてください。[Python公式サイト](https://www.python.org/downloads/)からダウンロードできます。

## 各言語版の詳細

各言語版の詳しいセットアップ手順と実行方法は、それぞれのREADMEを参照してください：

- [Python版 README](src/python/README.md)
- [Rust版 README](src/rust/README.md)
- [Go版 README](src/go/README.md)
- [TypeScript/Node.js版 README](src/typescript_deno/README.md)

## 参考リンク

- [YM2151エミュレータライブラリビルドリポジトリ](https://github.com/cat2151/ym2151-emu-win-bin)
- [Nuked-OPM](https://github.com/nukeykt/Nuked-OPM) - サイクル精度の高いYM2151エミュレータ
- [libymfm.wasm](https://github.com/h1romas4/libymfm.wasm) - ymfmのWebAssemblyビルド
