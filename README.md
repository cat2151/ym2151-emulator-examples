# ym2151-emulator-examples

🎵 Various YM2151 emulator libraries across programming languages with minimal sound playback code samples

## 状況

YM2151エミュレータライブラリは、[ym2151-emu-win-bin](https://github.com/cat2151/ym2151-emu-win-bin) リポジトリから取得できます。

各言語版の実装は、このリポジトリからビルド済みバイナリをダウンロードして使用します。

### ライブラリの取得方法

```powershell
# すべての言語のライブラリをダウンロード
python scripts\download_libs.py

# 特定の言語のみ（python, rust, go, typescriptから選択）
python scripts\download_libs.py python
```

## 概要

このリポジトリは、複数のプログラミング言語（Rust、Go、TypeScript/Deno、Python）で、YM2151エミュレータライブラリを使用した最小限の音声再生サンプルを提供します。

YM2151（OPM）は、1984年にヤマハが開発したFM音源チップで、アーケードゲーム機やホームコンピュータで広く使用されていました。

## 新機能（Issue #16対応）

TypeScript/Node.js版に以下の機能が追加されました：

- ✅ **バッファゼロチェック**: 音声生成の検証機能
- ✅ **複数チップ対応**: YM2149（PSG）、YM2413（OPLL）の実装例を追加
- ✅ **キートグル版**: 0.5秒ごとにキーON/OFFを切り替える版
- ✅ **ランダムパラメータ版**: CTRL+Cまで無限ループでランダムパラメータを試行
- ✅ **Windows専用ドキュメント**: MSYS2を使用した詳細なセットアップ手順

詳細は [issue-notes/16_IMPLEMENTATION_REPORT.md](issue-notes/16_IMPLEMENTATION_REPORT.md) を参照してください。

## プロジェクト構成

```
ym2151-emulator-examples/
├── IMPLEMENTATION_PLAN.md  # 詳細な実装計画書
├── build_and_run.py        # 一括ビルド＆実行スクリプト（Windows専用）
├── issue-notes/            # Issue関連ドキュメント
├── src/
│   ├── rust/              # Rust実装
│   ├── go/                # Go実装
│   ├── typescript_deno/   # TypeScript/Deno実装
│   └── python/            # Python実装
└── README.md              # このファイル
```

## 実装ステータス

| 言語 | ライブラリ取得 | ステータス | 実装アプローチ |
|------|--------------|-----------|--------------|
| Python | ym2151-emu-win-bin | ✅ 動作可能 | Nuked-OPM + ctypes + speaker |
| Rust | ソースビルド | ✅ 動作可能 | Nuked-OPM + FFI + cpal |
| TypeScript/Node.js | libymfm.wasm | ✅ 動作可能 | libymfm.wasm + speaker |
| Go | ym2151-emu-win-bin | 🚧 準備中 | Nuked-OPM + CGO + PortAudio |

### 注意事項

**Python版**が最もシンプルで、すぐに動作します。
**Rust版**と**TypeScript/Node.js版**も動作しますが、セットアップがやや複雑です。
**Go版**は現在準備中です。

## クイックスタート

**初めての方へ**: [issue-notes/22_QUICKSTART.md](issue-notes/22_QUICKSTART.md) で最も簡単な始め方を確認できます。

### ライブラリの取得

```powershell
# すべての言語のライブラリをダウンロード
python scripts\download_libs.py

# 特定の言語のみ（python, rust, go, typescriptから選択）
python scripts\download_libs.py python
```

### 個別の実装

各言語の実装については、以下のディレクトリを参照してください：

- [Python版](src/python/README.md) - **推奨**: 最も簡単にセットアップできます
- [Rust版](src/rust/README.md) - 高性能、MSYS2が必要
- [TypeScript/Node.js版](src/typescript_deno/README.md) - WebAssembly版エミュレータ
- [Go版](src/go/README.md) - 準備中

## 実装計画

- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** - 詳細な実装計画、推奨アプローチ、想定実装時間
- **[LIBRARY_COMPARISON.md](LIBRARY_COMPARISON.md)** - ライブラリの詳細な比較表、ライセンス情報、言語別適合度

## 参考リンク

### YM2151エミュレータライブラリ
- [Nuked-OPM](https://github.com/nukeykt/Nuked-OPM) - サイクル精度の高いYM2151エミュレータ (C)
- [ymfm](https://github.com/aaronsgiles/ymfm) - Yamaha FM音源コアライブラリ (C++)
- [libymfm.wasm](https://github.com/h1romas4/libymfm.wasm) - ymfmのWebAssemblyビルド (Rust)

### 参考プロジェクト
- [cat-oscillator-sync](https://github.com/cat2151/cat-oscillator-sync) - マルチ言語でのオーディオ合成実装例

## ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

各YM2151エミュレータライブラリのライセンスについては、それぞれのリポジトリを参照してください：
- Nuked-OPM: LGPL-2.1
- ymfm: BSD-3-Clause
- libymfm.wasm: BSD-3-Clause
