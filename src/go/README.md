# Go版 YM2151エミュレータ実装

## 概要
Goを使用したYM2151エミュレータの最小実装例です。

この実装は **Nuked-OPM** をCGO経由で使用し、**PortAudio** を通じて440HzのA音を直接再生します。

## 使用ライブラリ
- **Nuked-OPM** (v0.9.2): サイクル精度の高いYM2151エミュレータ (LGPL-2.1)
- **PortAudio**: クロスプラットフォームのオーディオI/Oライブラリ
- **CGO**: Go言語からCライブラリを呼び出すためのインターフェース

## 必要な環境（Windows）
- Go 1.21以降
- MSYS2 (MinGW-w64環境)
- Git

## MinGWの使用について

### MinGWが必要な理由
このプロジェクトでは、以下の理由でMinGW（MSYS2環境内のMinGW-w64）が必要です：

1. **ビルド時**: CGO（GoからCコードを呼び出す仕組み）を使用するため、Cコンパイラ（GCC）が必要
   - Nuked-OPMのCコードをコンパイルするため
   - PortAudioライブラリとリンクするため

2. **実行時の依存関係**: 
   - **libportaudio-2.dll**: PortAudioのDLL（音声出力に必須）
   - **MinGW関連のDLL**: libgcc_s_seh-1.dll、libstdc++-6.dll など（MinGWのGCCでビルドした場合に必要。動的リンクの場合は必須、静的リンクの場合は不要）

### ⚠️ 重要な制約：DLL依存関係

**現状の実装では、ビルドされた実行ファイル（.exe）は以下のDLLに依存します：**

- `libportaudio-2.dll` - 音声出力に必須
- MinGWランタイムDLL（ビルド設定による）

これは、**MinGW環境外では実行ファイルが動作しない可能性がある**ことを意味します。

### DLL依存を回避する方法の検討

完全に独立した実行ファイルを作成するには、以下の対応が必要ですが、複雑で困難です：

1. **PortAudioの静的リンク**: PortAudioを静的ライブラリとしてビルドし、実行ファイルに埋め込む
2. **MinGWランタイムの静的リンク**: `-static` フラグを使用してMinGWランタイムも静的リンク
3. **Windows APIの直接使用**: PortAudioを使わず、WASAPIやDirectSoundを直接使用（大幅な実装変更が必要）

**結論**: 現状のアプローチ（CGO + PortAudio）では、WindowsでカジュアルにCLIから音を鳴らすという要件を、DLL依存なしで実現することは困難です。

実行ファイルを配布する場合は、必要なDLLも同梱するか、MSYS2環境内での実行を前提とする必要があります。

## セットアップと実行

### 0. 初回のみ：サブモジュールの初期化
```bash
# リポジトリのクローン後、サブモジュールを初期化
git submodule update --init --recursive
```

### 1. MSYS2のインストール

1. [MSYS2公式サイト](https://www.msys2.org/)から最新版をダウンロード
2. インストーラーを実行してデフォルト設定でインストール
3. インストール完了後、「MSYS2 MINGW64」を起動

### 2. 必要なパッケージのインストール

MSYS2 MINGW64シェル内で以下を実行：

```bash
# システムの更新
pacman -Syu
# シェルを再起動後、再度更新
pacman -Su

# MinGW-w64ツールチェーン（GCC等）のインストール
pacman -S mingw-w64-x86_64-toolchain

# PortAudioのインストール
pacman -S mingw-w64-x86_64-portaudio

# pkg-configのインストール（ビルド時にライブラリの場所を検出するために必要）
pacman -S mingw-w64-x86_64-pkg-config
```

### 3. Goのセットアップ

Windows用のGoをインストールしていない場合：
1. [Go公式サイト](https://golang.org/dl/)からWindows版をダウンロード
2. インストーラーを実行
3. MSYS2シェルで `go version` が動作することを確認

### 4. 環境変数の設定

MSYS2 MINGW64シェル内で以下を設定（毎回シェル起動時に必要）：

```bash
# MinGWのツールとライブラリへのパスを設定
export PATH=/mingw64/bin:$PATH
export PKG_CONFIG_PATH=/mingw64/lib/pkgconfig
```

これらを毎回設定するのが面倒な場合は、`~/.bashrc`に追加してください。

### 5. ビルド

プロジェクトディレクトリ（`src/go/`）で以下を実行：

```bash
# CGOを有効化してビルド
CGO_ENABLED=1 go build -o ym2151-example.exe main.go
```

### 6. 実行

```bash
# プログラムを実行
./ym2151-example.exe
```

実行すると、スピーカーから2秒間の440Hz A音が再生されます。

### ワンステップで実行

```bash
# ビルドと実行を一度に行う
CGO_ENABLED=1 go run main.go
```

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

### `gcc: command not found`
MSYS2のMinGW-w64ツールチェーンがインストールされていません：
```bash
# MSYS2 MINGW64シェル内で実行
pacman -S mingw-w64-x86_64-toolchain
```

また、PATHが正しく設定されているか確認してください：
```bash
export PATH=/mingw64/bin:$PATH
```

### `portaudio.h: No such file or directory`
PortAudioがインストールされていません：
```bash
# MSYS2 MINGW64シェル内で実行
pacman -S mingw-w64-x86_64-portaudio
pacman -S mingw-w64-x86_64-pkg-config
```

`PKG_CONFIG_PATH`も設定してください：
```bash
export PKG_CONFIG_PATH=/mingw64/lib/pkgconfig
```

### `CGO_ENABLED=1` が必要
GoでCGOを使用するには、明示的に有効化する必要があります。
必ず `CGO_ENABLED=1` を設定してビルドしてください。

### `Error opening audio stream: no default output device`
オーディオデバイスが見つかりません。以下を確認してください：
- オーディオデバイスが正しく接続されているか
- システムのオーディオ設定が正しいか
- 他のアプリケーションがオーディオデバイスを占有していないか

### DLLが見つからないエラー
MSYS2環境外で実行した場合、DLLが見つからないエラーが発生することがあります：
```
The code execution cannot proceed because libportaudio-2.dll was not found.
```

**対処方法**:
1. MSYS2 MINGW64シェル内で実行する（推奨）
2. または、必要なDLLを実行ファイルと同じディレクトリにコピーする：
   - `libportaudio-2.dll` (通常MSYS2インストールディレクトリの `mingw64\bin\` にあります。デフォルトでは `C:\msys64\mingw64\bin\`)
   - その他のMinGW関連DLL（エラーメッセージに表示されたもの）

## ステータス
✅ **実装完了** - リアルタイムオーディオ再生が動作しています。
