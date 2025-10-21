# Python版 YM2151エミュレータ実装

## 概要
Pythonを使用したYM2151エミュレータの実装例です。Nuked-OPM（サイクル精度の高いYM2151エミュレータ）をctypesでラップして使用しています。

## 構成

### ファイル
- `nuked_opm.py` - Nuked-OPMライブラリのPythonラッパー
- `main.py` - YM2151音声生成のメインプログラム
- `simple_demo.py` - オーディオシステムの動作確認用デモ
- `ym2151.dll` - Nuked-OPMの共有ライブラリ (Windows用、ダウンロードまたはビルドが必要)
- `requirements.txt` - Python依存パッケージ

### 使用ライブラリ
- **Nuked-OPM** + ctypes: サイクル精度の高いYM2151エミュレータ
- **sounddevice**: オーディオ出力ライブラリ
- **numpy**: 数値計算ライブラリ

## セットアップ

### 必要な環境
- **Windows 10/11専用**
- Python 3.8以上

### 1. Python環境のセットアップ

```powershell
# Python仮想環境の作成
python -m venv venv

# 仮想環境の有効化
venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt
```

### 2. YM2151エミュレータDLLの取得

プロジェクトルートから以下を実行：

```powershell
# すべての言語のライブラリをダウンロード
python scripts\download_libs.py

# Python版のみダウンロード
python scripts\download_libs.py python
```

ライブラリは [ym2151-emu-win-bin](https://github.com/cat2151/ym2151-emu-win-bin) リポジトリから取得されます。

## 実行方法

### YM2151エミュレータの実行

```powershell
# 基本的な音声生成
python main.py
```

### デモプログラムの実行

```powershell
# オーディオシステムの動作確認（テスト用正弦波）
python simple_demo.py
```

## ライブラリについて

### Nuked-OPM
Nuked-OPMは、YM2151 (OPM) チップのサイクル精度エミュレータです。

- **リポジトリ**: https://github.com/nukeykt/Nuked-OPM
- **ライセンス**: LGPL-2.1
- **特徴**: ハードウェアと同等の精度でエミュレート

ビルド済みバイナリは [ym2151-emu-win-bin](https://github.com/cat2151/ym2151-emu-win-bin) から取得できます。

## トラブルシューティング

### PortAudioが見つからない

```
OSError: PortAudio library not found
```

→ `pip install sounddevice` でインストールされるPortAudioのバイナリが正しく動作していない可能性があります。Python環境を再作成してみてください。

### 共有ライブラリが見つからない

```
FileNotFoundError: Nuked-OPM library not found
```

→ `ym2151.dll`が`src/python/`ディレクトリにあることを確認してください。以下を実行してください：

```powershell
# ダウンロード
python scripts\download_libs.py python
```

### オーディオデバイスがない

ヘッドレス環境（サーバーなど）では、sounddeviceが動作しません。その場合は、オーディオデータをWAVファイルとして保存するように実装を変更してください。

## 実装の詳細

詳細な実装計画と推奨アプローチについては、[実装計画書](../../IMPLEMENTATION_PLAN.md#4-python版-)を参照してください。

## ステータス
✅ **実装完了** - 基本的な実装が完了しています。

### 完了した機能
- ✅ Nuked-OPMのctypesラッパー
- ✅ YM2151レジスタ設定
- ✅ オーディオ生成フレームワーク
- ✅ 基本的なCLIインターフェース
- ✅ 簡易ライブラリダウンロード/ビルドスクリプト

### 今後の改善予定
- 🔄 YM2151レジスタ設定の最適化（音声出力の改善）
- 🔄 より多様な音色のサンプル追加
- 🔄 VGMファイル再生機能の追加（将来的に）
