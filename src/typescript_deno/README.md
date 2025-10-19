# TypeScript/Deno版 YM2151エミュレータ実装

## 概要
TypeScriptとDenoを使用したYM2151エミュレータの最小実装例です。

## 推奨ライブラリ
- **libymfm.wasm**: WebAssembly版のymfmライブラリ（最推奨）
- **Web Audio API**: ブラウザでのオーディオ出力

## 実装予定
詳細は[実装計画書](../../IMPLEMENTATION_PLAN.md#3-typescriptdeno版-)を参照してください。

## セットアップ (Deno)
```bash
# Denoのインストール（未インストールの場合）
curl -fsSL https://deno.land/install.sh | sh

# 実行
deno run --allow-all main.ts
```

## セットアップ (Node.js)
```bash
# Node.jsのインストール（未インストールの場合）
# https://nodejs.org/

# 依存関係のインストール
npm install

# 実行
npm start
```

## ステータス
🚧 **実装予定** - このディレクトリはまだ実装されていません。
