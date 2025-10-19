# TypeScript/Node.js版 YM2151エミュレータ実装

## 概要
TypeScriptとNode.jsを使用したYM2151エミュレータの最小実装例です。

libymfm.wasmライブラリを使用して、YM2151 (OPM) チップをエミュレートし、440HzのA4音を生成するシンプルなサンプルプログラムを提供します。

## 使用ライブラリ
- **libymfm.wasm**: WebAssembly版のymfmライブラリ（BSD-3-Clause）
  - リポジトリ: https://github.com/h1romas4/libymfm.wasm
  - YM2151を含む複数のYamaha FMチップをサポート

## 必要な環境
- Node.js 20.x以上
- npm または yarn

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. ビルド
```bash
npm run build
```

### 3. 実行
```bash
npm start
```

## 出力
プログラムを実行すると、`output.pcm` ファイルが生成されます。これは3秒間の440Hz（A4音）のオーディオデータです。

### PCMファイルの再生方法

#### ffplayを使用（推奨）
```bash
ffplay -f s16le -ar 44100 -ac 2 output.pcm
```

#### aplayを使用（Linuxの場合）
```bash
aplay -f S16_LE -r 44100 -c 2 output.pcm
```

#### WAVファイルに変換
```bash
ffmpeg -f s16le -ar 44100 -ac 2 -i output.pcm output.wav
```

## プロジェクト構成
```
typescript_deno/
├── src/
│   ├── index.ts        # メインプログラム（YM2151の設定と音声生成）
│   └── libymfm.ts      # libymfm.wasmのTypeScriptラッパー
├── wasm/
│   └── libymfm.wasm    # WebAssemblyバイナリ
├── dist/               # ビルド出力（npm run buildで生成）
├── package.json
├── tsconfig.json
└── README.md
```

## YM2151レジスタ設定
このサンプルでは、以下のような基本的なFM音源の設定を行っています：

- **チャンネル0を使用**
- **アルゴリズム7（CON=7）**: 全てのオペレータがキャリア
- **パン**: 左右両方のスピーカーから出力
- **KC（Key Code）**: 0x4A（約440Hz）
- **オペレータ設定**:
  - MUL（周波数倍率）: 1x
  - AR（アタックレート）: 31（最速）
  - RR（リリースレート）: 15（高速）
  - TL（トータルレベル）: 0（最大音量）

詳細な設定は `src/index.ts` の `initializeYM2151()` 関数を参照してください。

## 技術詳細

### libymfm.wasm API
このプロジェクトでは、libymfm.wasmの低レベルAPIを使用して直接YM2151チップを制御しています：

1. **サウンドスロットの作成**: チップとオーディオ出力の設定
2. **チップの追加**: YM2151チップを指定したクロック周波数で追加
3. **レジスタへの書き込み**: YM2151のレジスタに値を書き込んで音色を設定
4. **サンプル生成**: 60Hzのティックレートでチップを駆動し、オーディオサンプルを生成

### サンプリングレート
- **出力サンプリングレート**: 44100Hz
- **チャンクサイズ**: 4096サンプル
- **ティックレート**: 60Hz（サウンドドライバの更新頻度）

## カスタマイズ
`src/index.ts` を編集することで、以下のカスタマイズが可能です：

- 音の高さ（KCレジスタの値を変更）
- 音色（アルゴリズム、オペレータパラメータの変更）
- 音の長さ（DURATION_SECONDS定数の変更）
- サンプリングレート（SAMPLING_RATE定数の変更）

## 参考リンク
- [YM2151 データシート](https://www.vgmpf.com/Wiki/index.php?title=YM2151)
- [libymfm.wasm リポジトリ](https://github.com/h1romas4/libymfm.wasm)
- [ymfm オリジナル](https://github.com/aaronsgiles/ymfm)

## ライセンス
このプロジェクト自体はMITライセンスです。

使用しているlibymfm.wasmはBSD-3-Clauseライセンスです。
