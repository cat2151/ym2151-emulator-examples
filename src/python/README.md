# Python版 YM2151エミュレータ実装

## 概要
Pythonを使用したYM2151エミュレータの最小実装例です。

## 推奨ライブラリ
- **Nuked-OPM** + ctypes: サイクル精度の高いYM2151エミュレータ
- **sounddevice**: オーディオ出力
- **numpy**: 数値計算

## 実装予定
詳細は[実装計画書](../../IMPLEMENTATION_PLAN.md#4-python版-)を参照してください。

## セットアップ
```bash
# Python 3.8以上が必要

# 仮想環境の作成（推奨）
python -m venv venv

# 仮想環境の有効化
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt

# 実行
python main.py
```

## ステータス
🚧 **実装予定** - このディレクトリはまだ実装されていません。
