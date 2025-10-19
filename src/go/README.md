# Go版 YM2151エミュレータ実装

## 概要
Goを使用したYM2151エミュレータの最小実装例です。

## 推奨ライブラリ
- **Nuked-OPM** + CGO: サイクル精度の高いYM2151エミュレータ
- **PortAudio**: オーディオ出力

## 実装予定
詳細は[実装計画書](../../IMPLEMENTATION_PLAN.md#2-go版-)を参照してください。

## セットアップ
```bash
# Goのインストール（未インストールの場合）
# https://go.dev/dl/

# CGOの有効化
export CGO_ENABLED=1

# 依存関係の取得
go mod download

# ビルド
go build

# 実行
go run main.go
```

## ステータス
🚧 **実装予定** - このディレクトリはまだ実装されていません。
