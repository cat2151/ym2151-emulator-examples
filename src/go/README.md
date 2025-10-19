# Go版 YM2151エミュレータ実装

## 概要
Goを使用したYM2151エミュレータの最小実装例です。

この実装は **Nuked-OPM** をCGO経由で使用し、**PortAudio** を通じて440HzのA音を直接再生します。

## 使用ライブラリ
- **Nuked-OPM** (v0.9.2): サイクル精度の高いYM2151エミュレータ (LGPL-2.1)
- **PortAudio**: クロスプラットフォームのオーディオI/Oライブラリ
- **CGO**: Go言語からCライブラリを呼び出すためのインターフェース

## 必要な環境（Windows）

- Windows 10/11 with WSL2
- Ubuntu 22.04 LTS (WSL2内)
- Go 1.21以降
- Git

**注意**: MSYS2/MinGWは使用しません。理由は、MinGWランタイムDLLへの依存を避け、Windows環境のDLL汚染を防ぐためです。

## プロジェクトポリシー

このプロジェクトでは、**MinGWランタイムDLLへの動的リンクを厳重に禁止**しています。

理由：
- ユーザーにMSYS2/MinGW環境のインストールを強制する
- Windows環境全体がMinGW DLLで汚染される
- ユーザーが知らずにMinGW依存のアプリを作成・配布し、他のユーザーに迷惑をかける連鎖的トラブルが発生する

**許可される依存関係：**
- ✅ PortAudio DLLへの動的リンク（音声出力に必要なため）
- ✅ MinGWランタイムの静的リンク（DLLを必要としないため）

**禁止される依存関係：**
- ❌ MinGWランタイムDLLへの動的リンク

## 実行時の依存関係

**✅ DLLに一切依存しない完全なスタンドアロン実行ファイル**

- PortAudioが静的ライブラリとしてリンクされる
- MinGWランタイム（libgcc、libstdc++）も静的リンクされる
- Windows標準のシステムDLL（kernel32.dll等）のみに依存
- MinGW環境がインストールされていないWindows PCでも動作

## セットアップと実行（WSL2）

#### 0. 初回のみ：サブモジュールの初期化
```bash
# リポジトリのクローン後、サブモジュールを初期化
git submodule update --init --recursive
```

#### 1. WSL2のセットアップ

Windows 10/11でWSL2が未インストールの場合：

1. PowerShellを管理者権限で開く
2. 以下のコマンドを実行：
```powershell
wsl --install -d Ubuntu-22.04
```
3. インストール完了後、Ubuntuを起動してユーザー名とパスワードを設定

#### 2. WSL2内で必要なパッケージのインストール

WSL2のUbuntuターミナルで以下を実行：

```bash
# システムパッケージの更新
sudo apt update && sudo apt upgrade -y

# ビルドツールのインストール
sudo apt install -y build-essential git

# MinGW（Windows用クロスコンパイラ）のインストール
sudo apt install -y gcc-mingw-w64-x86-64 g++-mingw-w64-x86-64

# PortAudio開発ライブラリのインストール
sudo apt install -y libportaudio2 portaudio19-dev

# pkg-configのインストール
sudo apt install -y pkg-config

# Goのインストール（まだインストールしていない場合）
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
go version
```

#### 3. PortAudioのWindows用静的ライブラリをビルド

WSL2内で以下を実行：

```bash
# 作業ディレクトリの作成
mkdir -p ~/portaudio-mingw
cd ~/portaudio-mingw

# PortAudioのダウンロード
wget http://files.portaudio.com/archives/pa_stable_v190700_20210406.tgz
tar xzf pa_stable_v190700_20210406.tgz
cd portaudio

# Windows用にクロスコンパイル（静的ライブラリ）
./configure --host=x86_64-w64-mingw32 --enable-static --disable-shared \
  --with-winapi=wasapi,directsound,wmme
make

# ライブラリとヘッダーを配置
sudo mkdir -p /usr/x86_64-w64-mingw32/lib
sudo mkdir -p /usr/x86_64-w64-mingw32/include
sudo cp lib/.libs/libportaudio.a /usr/x86_64-w64-mingw32/lib/
sudo cp include/portaudio.h /usr/x86_64-w64-mingw32/include/

# pkg-config設定ファイルを作成
sudo mkdir -p /usr/x86_64-w64-mingw32/lib/pkgconfig
sudo tee /usr/x86_64-w64-mingw32/lib/pkgconfig/portaudio-2.0.pc > /dev/null << EOF
prefix=/usr/x86_64-w64-mingw32
exec_prefix=\${prefix}
libdir=\${exec_prefix}/lib
includedir=\${prefix}/include

Name: PortAudio
Description: Portable audio I/O library
Version: 19.7.0
Libs: -L\${libdir} -lportaudio -lwinmm -lole32 -luuid -lksuser
Cflags: -I\${includedir}
EOF
```

#### 4. プロジェクトディレクトリへ移動

```bash
# リポジトリのクローン（まだの場合）
cd ~
git clone https://github.com/cat2151/ym2151-emulator-examples.git
cd ym2151-emulator-examples
git submodule update --init --recursive

# Go版のディレクトリへ移動
cd src/go
```

#### 5. Windows用実行ファイルのビルド

```bash
# 環境変数の設定
export GOOS=windows
export GOARCH=amd64
export CGO_ENABLED=1
export CC=x86_64-w64-mingw32-gcc
export CXX=x86_64-w64-mingw32-g++
export PKG_CONFIG_PATH=/usr/x86_64-w64-mingw32/lib/pkgconfig

# ビルド（静的リンク）
go build -ldflags="-s -w -extldflags '-static-libgcc -static-libstdc++'" -o ym2151-example.exe main.go
```

このビルド方法では：
- MinGWランタイム（libgcc、libstdc++）が静的リンクされる
- PortAudioも静的ライブラリとしてリンクされる
- 生成される実行ファイルは**DLLに一切依存しない**完全なスタンドアロン実行ファイル

#### 6. Windows側でビルドしたバイナリを実行

WSL2内からWindowsのファイルシステムにコピー：

```bash
# Windows側のドキュメントフォルダーにコピー
cp ym2151-example.exe /mnt/c/Users/$USER/Documents/

# または、Windows側のデスクトップに配置
cp ym2151-example.exe /mnt/c/Users/$USER/Desktop/
```

Windowsのエクスプローラーから `ym2151-example.exe` をダブルクリック、またはPowerShellで実行：

```powershell
cd $HOME\Documents
.\ym2151-example.exe
```

**✅ WSL2でビルドした実行ファイルの利点：**
- DLLに一切依存しない完全なスタンドアロン実行ファイル
- MinGW環境がインストールされていないWindows PCでも動作
- 配布が容易（.exeファイル1つだけで完結）

## 出力
- **リアルタイム音声出力**: PortAudioを使用してスピーカーから直接音を再生
- **48kHz, ステレオ**: 高品質なオーディオストリーミング

## 実装の特徴

### YM2151 レジスタ設定
このプログラムは以下のYM2151レジスタを設定して音を生成します：

1. **キーコード (KC)**: 音程の設定
2. **アルゴリズム**: FM音源の変調経路 (Algorithm 7を使用)
3. **オペレータ設定**: 
   - Total Level (TL): 音量
   - Attack Rate (AR): 立ち上がり速度
   - Decay/Sustain/Release: エンベロープ設定

### リアルタイムオーディオ生成
- PortAudioのストリームコールバックを使用
- バッファサイズ: 512フレーム
- YM2151チップをリアルタイムでクロック（サンプルあたり約75サイクル）

### クロック精度
- YM2151は3.58MHzで動作
- 48kHz出力のため、サンプルあたり約75回のクロックを実行
- サイクル精度の高いエミュレーションを実現

## プロジェクト構成
```
src/go/
├── main.go           # メインプログラム (CGO + Nuked-OPM + PortAudio)
├── nuked-opm-src/    # Nuked-OPMソースコード (git submodule)
│   ├── opm.c
│   └── opm.h
├── go.mod            # Goモジュール定義
├── go.sum            # 依存関係のチェックサム
├── .gitignore        # Gitの除外設定
└── README.md         # このファイル
```

## ライセンス
- **このプロジェクト**: MIT License
- **Nuked-OPM**: LGPL-2.1 (商用利用時は注意が必要)
- **PortAudio**: MIT License

## 参考リンク
- [Nuked-OPM](https://github.com/nukeykt/Nuked-OPM)
- [PortAudio](http://www.portaudio.com/)
- [gordonklaus/portaudio (Go bindings)](https://github.com/gordonklaus/portaudio)
- [YM2151 Wikipedia](https://en.wikipedia.org/wiki/Yamaha_YM2151)
- [実装計画書](../../IMPLEMENTATION_PLAN.md#2-go版-)

## トラブルシューティング

### WSL2のインストールに失敗する
WSL2のインストールには管理者権限が必要です。PowerShellを管理者権限で実行してください。

また、Windows 10の場合はバージョン2004以降が必要です。Windows Updateで最新版に更新してください。

### `gcc: command not found` または `x86_64-w64-mingw32-gcc: command not found`
MinGWクロスコンパイラがインストールされていません：
```bash
# WSL2のUbuntuターミナルで実行
sudo apt install -y gcc-mingw-w64-x86-64 g++-mingw-w64-x86-64
```

### `portaudio.h: No such file or directory`
PortAudioがビルドされていないか、インストール場所が正しくありません。
「3. PortAudioのWindows用静的ライブラリをビルド」セクションの手順を再度実行してください。

### `CGO_ENABLED=1` が必要
GoでCGOを使用するには、明示的に有効化する必要があります。
必ず `CGO_ENABLED=1` を設定してビルドしてください。

### `Error opening audio stream: no default output device`
Windows側でオーディオデバイスが見つかりません。以下を確認してください：
- オーディオデバイスが正しく接続されているか
- Windowsのオーディオ設定が正しいか
- 他のアプリケーションがオーディオデバイスを占有していないか

### ビルドしたexeファイルが動作しない
WSL2でビルドした実行ファイルは、Windows側で実行する必要があります。
WSL2のターミナル内では実行できません。

必ず `/mnt/c/Users/$USER/Documents/` などWindows側のディレクトリにコピーしてから、
WindowsのエクスプローラーまたはPowerShellで実行してください。

### ビルド設定の確認方法

実行ファイルがどのDLLに依存しているか確認するには、WSL2シェルで以下を実行：
```bash
x86_64-w64-mingw32-objdump -p ym2151-example.exe | grep "DLL Name"
```

**推奨ビルドが成功している場合の出力例**:
```
DLL Name: KERNEL32.dll
DLL Name: msvcrt.dll
DLL Name: ADVAPI32.dll
...
（libportaudio-2.dll、libgcc_s_seh-1.dll、libstdc++-6.dll が表示されない）
```

WSL2でビルドした実行ファイルは、PortAudioも静的リンクされるため、DLLに一切依存しません。

## ステータス
✅ **実装完了** - リアルタイムオーディオ再生が動作しています。
