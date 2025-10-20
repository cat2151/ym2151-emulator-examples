# TypeScript/Node.js版 YM2151エミュレータ実装

> **注意**: このディレクトリ名は`typescript_deno`ですが、実装は**Node.js**です。
> Denoでの直接オーディオ再生は技術的に実現不可能なため、Node.jsを使用しています。
> 詳細は [DENO_INVESTIGATION.md](./DENO_INVESTIGATION.md) を参照してください。

## 概要
TypeScriptとNode.jsを使用したYM2151エミュレータの最小実装例です。

libymfm.wasmライブラリを使用して、YM2151 (OPM) チップをエミュレートし、440HzのA4音を直接スピーカーから再生するシンプルなサンプルプログラムを提供します。

## 使用ライブラリ
- **libymfm.wasm**: WebAssembly版のymfmライブラリ（BSD-3-Clause）
  - リポジトリ: https://github.com/h1romas4/libymfm.wasm
  - YM2151を含む複数のYamaha FMチップをサポート
- **speaker**: Node.js用のPCMオーディオ出力ライブラリ（MIT & LGPL-2.1）
  - リポジトリ: https://github.com/TooTallNate/node-speaker
  - PortAudio、CoreAudio、ALSAなどのバックエンドをサポート

## 必要な環境
- **Windows 10/11専用**
- Node.js 20.x以上
- npm または yarn

**注意**: speakerライブラリのビルドにMSYS2が必要な場合があります。

## セットアップ

### 1. Node.jsのインストール

[Node.js公式サイト](https://nodejs.org/)から最新のLTS版をダウンロードしてインストールしてください。

### 2. 依存関係のインストール

```powershell
npm install
```

**注意**: `speaker`ライブラリのネイティブビルドに失敗する場合があります。

失敗した場合の対処法：

1. エラーメッセージを確認し、MSYS2のインストールが必要か確認
2. または、[ym2151-emu-win-bin](https://github.com/cat2151/ym2151-emu-win-bin) リポジトリをチェック：
   - リポジトリの `binaries/typescript/` ディレクトリに `binding.node` があるか確認
   - ある場合は、`node_modules/speaker/build/Release/` にコピー

MSYS2を使ってビルドする場合：
1. [MSYS2](https://www.msys2.org/) をインストール
2. MSYS2 MINGW64ターミナルで `pacman -S mingw-w64-x86_64-gcc` を実行
3. PowerShellで `npm install` を再実行

### 3. ビルド

```powershell
npm run build
```

### 4. 実行

```powershell
npm start
```

## 動作
プログラムを実行すると、3秒間の440Hz（A4音）がスピーカーから直接再生されます。

音声は`speaker`ライブラリを使用してリアルタイムにストリーミング再生されます。

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
4. **リアルタイム再生**: 60Hzのティックレートでチップを駆動し、オーディオサンプルを生成・ストリーミング再生

### オーディオ出力
`speaker`ライブラリを使用して、生成されたPCMオーディオデータを直接スピーカーに出力します：

- **リアルタイムストリーミング**: バッファリングされたチャンクをリアルタイムで再生
- **クロスプラットフォーム**: Linux (ALSA)、macOS (CoreAudio)、Windows (WASAPI) をサポート
- **低レイテンシ**: チップエミュレーションと並行して再生

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

## ライセンスとセキュリティ
このプロジェクト自体はMITライセンスです。

使用しているライブラリ：
- **libymfm.wasm**: BSD-3-Clauseライセンス
- **speaker**: MIT & LGPL-2.1ライセンス

### セキュリティに関する注意事項
`speaker`ライブラリには既知のDoS脆弱性（CVE-2024-21526）が存在します。この脆弱性は、`channels`プロパティに不正な型の値を渡した場合にプロセスがクラッシュする可能性があります。

本実装では：
- `channels`プロパティには常に数値`2`（ステレオ）を設定しており、脆弱性の影響を受けません
- ユーザー入力を`channels`プロパティに渡すことはありません
- このサンプルプログラムはローカル環境での実行を想定しており、外部からの攻撃対象にはなりません

本番環境でより安全なオーディオ出力が必要な場合は、代替ライブラリ（`naudiodon2`など）の使用を検討してください。
