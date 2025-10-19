# Go版 YM2151エミュレータ実装

## 概要
Goを使用したYM2151エミュレータの最小実装例です。

この実装は **Nuked-OPM** をCGO経由で使用し、440HzのA音を生成してWAVファイルに保存します。

## 使用ライブラリ
- **Nuked-OPM** (v0.9.2): サイクル精度の高いYM2151エミュレータ (LGPL-2.1)
- **CGO**: Go言語からCライブラリを呼び出すためのインターフェース

## 必要な環境
- Go 1.21以降
- GCC (CGOのコンパイルに必要)
- Git

## セットアップと実行

### 0. 初回のみ：サブモジュールの初期化
```bash
# リポジトリのクローン後、サブモジュールを初期化
git submodule update --init --recursive
```

### 1. ビルド
```bash
# CGOを有効化してビルド
CGO_ENABLED=1 go build -o ym2151-example main.go
```

### 2. 実行
```bash
# プログラムを実行
./ym2151-example
```

実行すると、2秒間の440Hz A音を含む `output.wav` ファイルが生成されます。

### ワンステップで実行
```bash
# ビルドと実行を一度に行う
CGO_ENABLED=1 go run main.go
```

## 出力
- **output.wav**: 48kHz, 16-bit, ステレオのWAVファイル
- 約376KB (2秒間の音声)

## 実装の特徴

### YM2151 レジスタ設定
このプログラムは以下のYM2151レジスタを設定して音を生成します：

1. **キーコード (KC)**: 音程の設定
2. **アルゴリズム**: FM音源の変調経路 (Algorithm 7を使用)
3. **オペレータ設定**: 
   - Total Level (TL): 音量
   - Attack Rate (AR): 立ち上がり速度
   - Decay/Sustain/Release: エンベロープ設定

### クロック精度
- YM2151は3.58MHzで動作
- 48kHz出力のため、サンプルあたり約75回のクロックを実行
- サイクル精度の高いエミュレーションを実現

## プロジェクト構成
```
src/go/
├── main.go           # メインプログラム (CGO + Nuked-OPM)
├── nuked-opm-src/    # Nuked-OPMソースコード (git clone)
│   ├── opm.c
│   └── opm.h
├── go.mod            # Goモジュール定義
├── .gitignore        # Gitの除外設定
└── README.md         # このファイル
```

## ライセンス
- **このプロジェクト**: MIT License
- **Nuked-OPM**: LGPL-2.1 (商用利用時は注意が必要)

## 参考リンク
- [Nuked-OPM](https://github.com/nukeykt/Nuked-OPM)
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

### `CGO_ENABLED=1` が必要
Goのクロスコンパイル環境では、CGOがデフォルトで無効になっている場合があります。
必ず `CGO_ENABLED=1` を設定してビルドしてください。

## ステータス
✅ **実装完了** - 基本的な音声生成が動作しています。
