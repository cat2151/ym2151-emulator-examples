# Rust版 YM2151エミュレータ実装

## 概要
Rustを使用したYM2151エミュレータの最小実装例です。

## 推奨ライブラリ
- **libymfm.wasm**: WebAssembly版のymfmライブラリ（最推奨）
- **cpal**: クロスプラットフォームオーディオ出力

## 実装予定
詳細は[実装計画書](../../IMPLEMENTATION_PLAN.md#1-rust版-)を参照してください。

## セットアップ
```bash
# Rustのインストール（未インストールの場合）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# プロジェクトのビルド
cargo build

# 実行
cargo run
```

## ステータス
🚧 **実装予定** - このディレクトリはまだ実装されていません。
