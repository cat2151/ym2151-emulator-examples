# Go版 YM2151エミュレータ実装

## 概要
Goを使用したYM2151エミュレータの最小実装例です。

この実装は **Nuked-OPM** をCGO経由で使用し、**PortAudio** を通じて440HzのA音を直接再生します。

## 使用ライブラリ
- **Nuked-OPM** (v0.9.2): サイクル精度の高いYM2151エミュレータ (LGPL-2.1)
- **PortAudio**: クロスプラットフォームのオーディオI/Oライブラリ
- **CGO**: Go言語からCライブラリを呼び出すためのインターフェース

## 必要な環境
- Go 1.21以降
- GCC (CGOのコンパイルに必要)
- PortAudio開発ライブラリ (libportaudio-dev)
- Git

## セットアップと実行

### 0. 初回のみ：サブモジュールの初期化
```bash
# リポジトリのクローン後、サブモジュールを初期化
git submodule update --init --recursive
```

### 1. PortAudioのインストール

#### Ubuntu/Debian
```bash
sudo apt-get install portaudio19-dev
```

#### macOS
```bash
brew install portaudio
```

#### Windows
MinGW環境で以下をインストール：
```bash
pacman -S mingw-w64-x86_64-portaudio
```

### 2. ビルド
```bash
# CGOを有効化してビルド
CGO_ENABLED=1 go build -o ym2151-example main.go
```

### 3. 実行
```bash
# プログラムを実行
./ym2151-example
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
GCCがインストールされていません：
```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# macOS
xcode-select --install
```

### `portaudio.h: No such file or directory`
PortAudio開発ライブラリがインストールされていません：
```bash
# Ubuntu/Debian
sudo apt-get install portaudio19-dev

# macOS
brew install portaudio
```

### `CGO_ENABLED=1` が必要
Goのクロスコンパイル環境では、CGOがデフォルトで無効になっている場合があります。
必ず `CGO_ENABLED=1` を設定してビルドしてください。

### `Error opening audio stream: no default output device`
オーディオデバイスが見つかりません。以下を確認してください：
- オーディオデバイスが正しく接続されているか
- システムのオーディオ設定が正しいか
- 他のアプリケーションがオーディオデバイスを占有していないか

## ステータス
✅ **実装完了** - リアルタイムオーディオ再生が動作しています。
