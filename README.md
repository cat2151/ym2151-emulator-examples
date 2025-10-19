# ym2151-emulator-examples

🎵 Various YM2151 emulator libraries across programming languages with minimal sound playback code samples

## 概要

このリポジトリは、複数のプログラミング言語（Rust、Go、TypeScript/Deno、Python）で、YM2151エミュレータライブラリを使用した最小限の音声再生サンプルを提供します。

YM2151（OPM）は、1984年にヤマハが開発したFM音源チップで、アーケードゲーム機やホームコンピュータで広く使用されていました。

## プロジェクト構成

```
ym2151-emulator-examples/
├── IMPLEMENTATION_PLAN.md  # 詳細な実装計画書
├── src/
│   ├── rust/              # Rust実装
│   ├── go/                # Go実装
│   ├── typescript_deno/   # TypeScript/Deno実装
│   └── python/            # Python実装
└── README.md              # このファイル
```

## 実装ステータス

| 言語 | 推奨度 | ステータス | 推奨ライブラリ |
|------|--------|-----------|--------------|
| Rust | ⭐⭐⭐⭐⭐ | 🚧 実装予定 | libymfm.wasm |
| TypeScript/Node.js | ⭐⭐⭐⭐⭐ | ✅ 実装完了 | libymfm.wasm |
| Python | ⭐⭐⭐⭐ | 🚧 実装予定 | Nuked-OPM + ctypes |
| TypeScript/Deno | ⭐⭐⭐⭐⭐ | 🚧 実装予定 | libymfm.wasm |
| Python | ⭐⭐⭐⭐ | ✅ 実装完了 | Nuked-OPM + ctypes |
| Go | ⭐⭐⭐⭐ | 🚧 実装予定 | Nuked-OPM/ymfm + CGO |

## クイックスタート

各言語の実装については、以下のディレクトリを参照してください：

- [Rust版](src/rust/README.md)
- [Go版](src/go/README.md)
- [TypeScript/Deno版](src/typescript_deno/README.md)
- [Python版](src/python/README.md)

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
