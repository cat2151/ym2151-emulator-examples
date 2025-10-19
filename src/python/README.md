# Python版 YM2151エミュレータ実装

## 概要
Pythonを使用したYM2151エミュレータの実装例です。Nuked-OPM（サイクル精度の高いYM2151エミュレータ）をctypesでラップして使用しています。

## 構成

### ファイル
- `nuked_opm.py` - Nuked-OPMライブラリのPythonラッパー
- `main.py` - YM2151音声生成のメインプログラム
- `simple_demo.py` - オーディオシステムの動作確認用デモ
- `libnukedopm.so` - Nuked-OPMの共有ライブラリ (Linux x86_64)
- `requirements.txt` - Python依存パッケージ

### 使用ライブラリ
- **Nuked-OPM** + ctypes: サイクル精度の高いYM2151エミュレータ
- **sounddevice**: オーディオ出力ライブラリ
- **numpy**: 数値計算ライブラリ

## セットアップ

### 必要な環境
- Python 3.8以上
- PortAudio (sounddeviceの依存ライブラリ)

### Linuxでの環境構築

```bash
# PortAudioのインストール（Ubuntu/Debian）
sudo apt-get install libportaudio2 portaudio19-dev

# PortAudioのインストール（Fedora/RHEL）
sudo dnf install portaudio portaudio-devel

# Python仮想環境の作成（推奨）
python3 -m venv venv

# 仮想環境の有効化
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt
```

### macOSでの環境構築

```bash
# PortAudioのインストール
brew install portaudio

# Python仮想環境の作成（推奨）
python3 -m venv venv

# 仮想環境の有効化
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt

# 注意: libnukedopm.soはLinux用です
# macOS用には以下のコマンドでビルドしてください:
# cd /tmp && git clone https://github.com/nukeykt/Nuked-OPM.git
# cd Nuked-OPM && gcc -shared -fPIC -O2 -o libnukedopm.dylib opm.c
# cp libnukedopm.dylib /path/to/ym2151-emulator-examples/src/python/
```

### Windowsでの環境構築

```bash
# Python仮想環境の作成
python -m venv venv

# 仮想環境の有効化
venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 注意: libnukedopm.soはLinux用です
# Windows用にはMSYS2などでビルドしてlibnukedopm.dllを作成してください
```

## 実行方法

### YM2151エミュレータの実行

```bash
# 基本的な音声生成
python main.py
```

### デモプログラムの実行

```bash
# オーディオシステムの動作確認（テスト用正弦波）
python simple_demo.py
```

## ライブラリについて

### Nuked-OPM
Nuked-OPMは、YM2151 (OPM) チップのサイクル精度エミュレータです。

- **リポジトリ**: https://github.com/nukeykt/Nuked-OPM
- **ライセンス**: LGPL-2.1
- **特徴**: ハードウェアと同等の精度でエミュレート

### ビルド方法（参考）

```bash
# Nuked-OPMのクローン
git clone https://github.com/nukeykt/Nuked-OPM.git
cd Nuked-OPM

# Linux/macOS向け共有ライブラリのビルド
gcc -shared -fPIC -O2 -o libnukedopm.so opm.c  # Linux
gcc -shared -fPIC -O2 -o libnukedopm.dylib opm.c  # macOS

# ビルドしたライブラリをコピー
cp libnukedopm.so /path/to/ym2151-emulator-examples/src/python/
```

## トラブルシューティング

### PortAudioが見つからない

```
OSError: PortAudio library not found
```

→ PortAudioをインストールしてください（上記のセットアップを参照）

### 共有ライブラリが見つからない

```
FileNotFoundError: Nuked-OPM library not found
```

→ `libnukedopm.so`（またはOS対応のライブラリ）が`src/python/`ディレクトリにあることを確認してください

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

### 今後の改善予定
- 🔄 YM2151レジスタ設定の最適化（音声出力の改善）
- 🔄 より多様な音色のサンプル追加
- 🔄 VGMファイル再生機能の追加（将来的に）
