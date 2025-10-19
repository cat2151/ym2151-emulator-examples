# Python版 YM2151エミュレータ実装

## 概要
Pythonを使用したYM2151エミュレータの実装例です。Nuked-OPM（サイクル精度の高いYM2151エミュレータ）をctypesでラップして使用しています。

## 構成

### ファイル
- `nuked_opm.py` - Nuked-OPMライブラリのPythonラッパー
- `main.py` - YM2151音声生成のメインプログラム
- `simple_demo.py` - オーディオシステムの動作確認用デモ
- `libnukedopm.dll` - Nuked-OPMの共有ライブラリ (Windows用、要ビルド)
- `requirements.txt` - Python依存パッケージ

### 使用ライブラリ
- **Nuked-OPM** + ctypes: サイクル精度の高いYM2151エミュレータ
- **sounddevice**: オーディオ出力ライブラリ
- **numpy**: 数値計算ライブラリ

## セットアップ

### 必要な環境
- Windows 10/11
- Python 3.8以上
- WSL2（推奨）またはMSYS2 (MinGW-w64環境)

### Windowsでの環境構築

#### 1. Python環境のセットアップ

```bash
# Python仮想環境の作成
python -m venv venv

# 仮想環境の有効化
venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt
```

#### 2. Nuked-OPM DLLのビルド

Windows用の `libnukedopm.dll` をビルドする必要があります。

**依存関係について：**
- Nuked-OPMは外部ライブラリに依存せず、標準Cライブラリのみを使用します
- 静的リンクすることでランタイム依存を排除できます
- MinGW DLLへの依存を避けるため、必ず静的リンクオプションを使用してください

##### 方法1: WSL2を使用（推奨）

WSL2（Windows Subsystem for Linux 2）を使用する方法が最もシンプルで推奨されます。

1. **WSL2環境を起動**
   ```bash
   # PowerShellまたはコマンドプロンプトから
   wsl
   ```

2. **必要なパッケージのインストール**（初回のみ）
   ```bash
   sudo apt update
   sudo apt install gcc git mingw-w64
   ```

3. **Nuked-OPMのクローンとビルド**
   ```bash
   # 作業ディレクトリに移動
   cd ~
   
   # Nuked-OPMをクローン
   git clone https://github.com/nukeykt/Nuked-OPM.git
   cd Nuked-OPM
   
   # Windows用DLLをビルド（静的リンク）
   x86_64-w64-mingw32-gcc -shared -static-libgcc -O2 -o libnukedopm.dll opm.c
   ```

4. **DLLのコピー**
   ```bash
   # WSL2からWindowsファイルシステムにコピー
   # 例: Cドライブのプロジェクトディレクトリにコピー
   cp libnukedopm.dll /mnt/c/path/to/ym2151-emulator-examples/src/python/
   ```

##### 方法2: MSYS2を使用（代替手段）

MSYS2を使用する場合も静的リンクを行います。

1. **MSYS2 MINGW64環境を起動**
   - スタートメニューから「MSYS2 MINGW64」を起動してください

2. **必要なパッケージのインストール**（初回のみ）
   ```bash
   pacman -S mingw-w64-x86_64-gcc git
   ```

3. **Nuked-OPMのクローンとビルド**
   ```bash
   # 作業ディレクトリに移動
   cd ~
   
   # Nuked-OPMをクローン
   git clone https://github.com/nukeykt/Nuked-OPM.git
   cd Nuked-OPM
   
   # DLLをビルド（静的リンク）
   gcc -shared -static-libgcc -O2 -o libnukedopm.dll opm.c
   ```

4. **DLLのコピー**
   ```bash
   # PowerShell/コマンドプロンプト、またはWindowsエクスプローラーでコピー
   # コピー元: C:\msys64\home\<ユーザー名>\Nuked-OPM\libnukedopm.dll
   # コピー先: ym2151-emulator-examples\src\python\libnukedopm.dll
   ```

**ビルドしたDLLの依存関係確認：**

ビルド後、DLLが外部DLLに依存していないことを確認できます：
```bash
# WSL2の場合
objdump -p libnukedopm.dll | grep "DLL Name"

# 期待される出力: msvcrt.dll, kernel32.dll などの標準Windowsライブラリのみ
# mingw関連のDLL（libgcc_s_seh-1.dll など）が表示されないこと
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

ビルド手順については上記の「2. Nuked-OPM DLLのビルド」セクションを参照してください。

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

→ `libnukedopm.dll`が`src/python/`ディレクトリにあることを確認してください。上記の「2. Nuked-OPM DLLのビルド」セクションに従ってビルドしてください。

### DLLのビルドに失敗する

- **WSL2の場合**: mingw-w64パッケージがインストールされているか確認: `x86_64-w64-mingw32-gcc --version`
- **MSYS2の場合**: MSYS2 MINGW64環境で実行していることを確認してください（MSYS2 MSYSやMINGW32ではありません）
- gccがインストールされているか確認: `gcc --version`
- 必要に応じて再インストール: 
  - WSL2: `sudo apt install mingw-w64`
  - MSYS2: `pacman -S mingw-w64-x86_64-gcc`

### DLLが外部DLLに依存している

ビルド時に `-static-libgcc` オプションを付け忘れた場合、MinGW DLLに依存してしまいます。
```bash
# 依存関係を確認（WSL2/MSYS2両方で使用可能）
objdump -p libnukedopm.dll | grep "DLL Name"

# mingw関連のDLL（libgcc_s_seh-1.dll など）が表示される場合は再ビルド
```

再ビルド時は必ず `-static-libgcc` オプションを含めてください。

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
