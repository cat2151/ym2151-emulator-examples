# ビルド＆実行スクリプト（Windows専用）

すべてのYM2151エミュレータ実装を一括でビルドし、個別に実行できるPythonスクリプトです。

## 目的

物理スピーカーでの人力テストを効率化するために作成されました。これまでは各言語版のREADMEを読んで、それぞれビルドと実行をする必要がありましたが、このスクリプトを使用することで：

- ✅ すべてのアプリを一度にビルド
- ✅ メニューから実行したいアプリを選択
- ✅ コンテキストスイッチの削減

## 使い方

```bash
python build_and_run.py
```

または

```bash
python3 build_and_run.py
```

## 動作

### ビルドフェーズ

スクリプトは以下の順序で各アプリケーションをビルドします：

1. **Python版** - 依存関係をチェック（sounddeviceなど）
2. **Rust版** - `cargo build --release` でビルド
3. **Go版** - `go build` でWindows用実行ファイルをビルド
4. **TypeScript/Node.js版** - `npm install` と `npm run build` でビルド

各ステップで、必要なツール（cargo、go、npmなど）が存在しない場合は警告を表示してスキップします。

### 実行フェーズ

ビルド完了後、インタラクティブなメニューが表示されます：

```
==================================================
  実行するアプリを選択してください
==================================================

Python版:
  1) main.py         - YM2151エミュレータ（Nuked-OPM + sounddevice）

Rust版:
  2) ym2151-example  - YM2151エミュレータ（Nuked-OPM + cpal）

Go版:
  3) ym2151-example  - YM2151エミュレータ（Nuked-OPM + PortAudio）

TypeScript/Node.js版:
  4) index.js        - YM2151エミュレータ（libymfm.wasm + speaker）

  0) 終了
```

数字を入力してアプリを選択し、実行します。各アプリは440HzのA4音を数秒間スピーカーから再生します。アプリが終了すると、再度メニューが表示されます。

## 必要な環境

### 共通
- Windows 10/11
- Python 3.8+

### Python版
- sounddevice、numpy（`pip install -r src/python/requirements.txt`でインストール）
- Nuked-OPM DLL（`libnukedopm.dll`）が必要
- 詳細は [src/python/README.md](src/python/README.md) を参照

### Rust版
- Rust（rustc、cargo）
- Visual Studio Build Tools または MinGW-w64
- 詳細は [src/rust/README.md](src/rust/README.md) を参照

### Go版
- Go 1.21+
- WSL2（推奨）またはMSYS2
- CGO_ENABLED=1でのクロスコンパイル環境
- PortAudioの静的ライブラリ
- **重要**: MinGW-w64のDLLには非依存のビルド設定が必要
- 詳細は [src/go/README.md](src/go/README.md) を参照

### TypeScript/Node.js版
- Node.js 20+
- npm
- 詳細は [src/typescript_deno/README.md](src/typescript_deno/README.md) を参照

## セットアップ手順

### 1. Python環境のセットアップ

```bash
# 依存関係のインストール
pip install -r src/python/requirements.txt
```

### 2. Nuked-OPM DLLのビルド（Python版で必要）

**WSL2を使用（推奨）**:

```bash
# WSL2内で実行
wsl

# Nuked-OPMのクローン
cd ~
git clone https://github.com/nukeykt/Nuked-OPM.git
cd Nuked-OPM

# DLLをビルド（MinGW DLLに非依存）
x86_64-w64-mingw32-gcc -shared -static-libgcc -O2 -o libnukedopm.dll opm.c

# Windows側のプロジェクトディレクトリにコピー
cp libnukedopm.dll /mnt/c/path/to/ym2151-emulator-examples/src/python/
```

詳細は [src/python/README.md](src/python/README.md) の「Nuked-OPM DLLのビルド」セクションを参照してください。

### 3. Go版のビルド環境セットアップ（Go版で必要）

**WSL2を使用（推奨）**:

```bash
# WSL2内で必要なパッケージをインストール
sudo apt update
sudo apt install -y build-essential gcc-mingw-w64-x86-64 g++-mingw-w64-x86-64

# PortAudioのビルドと配置
# 詳細は src/go/README.md の手順を参照
```

**重要**: Go版は**MinGW-w64のDLLには非依存**のスタンドアロン実行ファイルとしてビルドする必要があります。詳細な手順は [src/go/README.md](src/go/README.md) を参照してください。

## トラブルシューティング

### ビルドエラーが発生する

各言語版の個別のREADMEを参照してください：

- [Python版 README](src/python/README.md)
- [Rust版 README](src/rust/README.md)
- [Go版 README](src/go/README.md)
- [TypeScript/Node.js版 README](src/typescript_deno/README.md)

### 特定の言語版がスキップされる

必要なツール（cargo、go、npmなど）がインストールされていない可能性があります。上記の「必要な環境」セクションを確認してください。

### 実行時にエラーが発生する

- **Python版**: `libnukedopm.dll`が`src/python/`ディレクトリにあることを確認
- **Rust版**: オーディオデバイスの設定確認
- **Go版**: WSL2でビルドしたexeファイルをWindows側で実行していることを確認
- **TypeScript版**: `npm run build`が正常に完了していることを確認

### Python版で「Nuked-OPM library not found」エラー

`libnukedopm.dll`が見つかりません。上記の「2. Nuked-OPM DLLのビルド」セクションを参照してビルドとコピーを行ってください。

### Go版で実行ファイルが起動しない

- WSL2でビルドしたexeファイルは、Windows側で実行する必要があります
- MinGW DLLへの依存がないか確認：
  ```bash
  # WSL2内で実行
  x86_64-w64-mingw32-objdump -p src/go/ym2151-example.exe | grep "DLL Name"
  # libgcc_s_seh-1.dll や libstdc++-6.dll が表示されないこと
  ```

## 使用例

### すべてをビルドして、各実装を比較したい場合

```bash
python build_and_run.py

# メニューで1を選択してPython版を実行
# メニューで2を選択してRust版を実行
# メニューで3を選択してGo版を実行
# メニューで4を選択してTypeScript版を実行
# メニューで0を選択して終了
```

### 特定の実装だけをテストしたい場合

```bash
python build_and_run.py

# メニューで目的の番号を選択
# テスト完了後、0を選択して終了
```

## 注意事項

- **Windows専用**: このスクリプトはWindows環境専用です
- スクリプトはリポジトリのルートディレクトリから実行する必要があります
- ビルドには時間がかかることがあります（特に初回）
- 各アプリは自動的に終了します（3秒程度の音声再生後）
- Windows 10/11で動作確認済み
- **MinGW DLL依存の禁止**: Go版とPython版（Nuked-OPM DLL）は、MinGW-w64のランタイムDLLに依存しない静的リンクビルドが必須です

## ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。
