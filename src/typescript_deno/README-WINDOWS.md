# TypeScript/Node.js版 YM2151エミュレータ実装（Windows専用）

> **注意**: この実装は**Windows専用**です。

## 概要
TypeScriptとNode.jsを使用したYM2151エミュレータの実装例です。

libymfm.wasmライブラリを使用して、複数のYamahaチップ（YM2151, YM2149, YM2413など）をエミュレートし、440HzのA4音をリアルタイムでスピーカーから再生します。

## 実装バージョン

このディレクトリには以下の実装が含まれています：

1. **index.ts** - 基本的なYM2151実装（3秒間440Hzトーンを再生）
2. **index-keytoggle.ts** - 0.5秒ごとにキーON/OFFを切り替える版（3秒間）
3. **index-random.ts** - CTRL+Cまで0.5秒ごとにランダムパラメータで再生
4. **index-ym2149.ts** - YM2149（PSG）の実装例（比較用）
5. **index-ym2413.ts** - YM2413（OPLL）の実装例（比較用）

## 使用ライブラリ
- **libymfm.wasm**: WebAssembly版のymfmライブラリ（BSD-3-Clause）
  - リポジトリ: https://github.com/h1romas4/libymfm.wasm
  - YM2151を含む複数のYamaha FMチップをサポート
- **speaker**: Node.js用のPCMオーディオ出力ライブラリ（MIT & LGPL-2.1）
  - リポジトリ: https://github.com/TooTallNate/node-speaker
  - WASAPIバックエンドを使用（Windows標準）
  - **ネイティブモジュール**: C++で書かれており、npm installで自動コンパイル

## 必要な環境
- **Windows 10/11**
- **Node.js 20.x以上**
- **npm**

## セットアップ手順

### 1. Node.jsのインストール

1. [Node.js公式サイト](https://nodejs.org/)から最新のLTS版をダウンロード
2. インストーラを実行してインストール
3. インストール確認：
   ```powershell
   node --version
   npm --version
   ```

### 2. プロジェクトのセットアップ

Windows PowerShellまたはコマンドプロンプトで：

```powershell
# プロジェクトディレクトリに移動
cd C:\path\to\ym2151-emulator-examples\src\typescript_deno

# 依存関係のインストール（speakerは自動的にコンパイルされます）
npm install

# TypeScriptのビルド
npm run build
```

**注意**: `npm install`の実行時、`speaker`パッケージが自動的にWindows用にネイティブコンパイルされます。これには数分かかる場合があります。

## 実行方法

Windows PowerShellまたはコマンドプロンプトで：

### 基本版（YM2151、3秒間440Hz再生）
```powershell
npm start
```

### キートグル版（0.5秒ごとにON/OFF、3秒間）
```powershell
npm run start:keytoggle
```

### ランダムパラメータ版（CTRL+Cまで無限ループ）
```powershell
npm run start:random
```

### YM2149版（PSGチップ、比較用）
```powershell
npm run start:ym2149
```

### YM2413版（OPLLチップ、比較用）
```powershell
npm run start:ym2413
```

## 動作説明

### 基本版（index.ts）
- 3秒間の440Hz（A4音）をスピーカーから直接再生
- 演奏終了時にバッファがすべて0かチェック（0ならエラー）

### キートグル版（index-keytoggle.ts）
- 3秒間、0.5秒ごとにkey onとkey offを切り替え
- ADSRは最大速度でattack（AR=31）、最小速度でdecay（D1R=0, D2R=0）
- TLはすべて最小値（0 = 最大音量）

### ランダムパラメータ版（index-random.ts）
- CTRL+Cを押すまで無限ループ
- 0.5秒ごとにkey onとkey offを切り替え
- key on時にADSR、TL、その他音量関連レジスタをすべてランダム化
- 適切なkey on（全オペレータ有効）を確実に実行

### YM2149版・YM2413版
- YM2151との比較用
- YM2151固有の問題かどうかを切り分けるために使用
- 各チップの特性に合わせたシンプルな音声生成

## プロジェクト構成
```
typescript_deno/
├── src/
│   ├── index.ts              # 基本版（YM2151、3秒間）
│   ├── index-keytoggle.ts    # キートグル版（YM2151、3秒間）
│   ├── index-random.ts       # ランダムパラメータ版（YM2151、無限ループ）
│   ├── index-ym2149.ts       # YM2149版（比較用）
│   ├── index-ym2413.ts       # YM2413版（比較用）
│   └── libymfm.ts            # libymfm.wasmのTypeScriptラッパー
├── wasm/
│   └── libymfm.wasm          # WebAssemblyバイナリ
├── dist/                     # ビルド出力（npm run buildで生成）
├── package.json
├── tsconfig.json
├── README.md                 # このファイル
└── README-WINDOWS.md         # Windowsセットアップ詳細版
```

## YM2151レジスタ設定

基本版とキートグル版では、以下のような設定を行っています：

- **チャンネル0を使用**
- **アルゴリズム7（CON=7）**: 全てのオペレータがキャリア
- **パン**: 左右両方のスピーカーから出力
- **KC（Key Code）**: 0x4A（約440Hz）
- **オペレータ設定**:
  - MUL（周波数倍率）: 1x
  - AR（アタックレート）: 31（最速）
  - RR（リリースレート）: 15（高速）
  - TL（トータルレベル）: 0（最大音量）

詳細な設定は各ソースファイルの `initializeYM2151()` 関数を参照してください。

## 技術詳細

### libymfm.wasm API
このプロジェクトでは、libymfm.wasmの低レベルAPIを使用して直接チップを制御しています：

1. **サウンドスロットの作成**: チップとオーディオ出力の設定
2. **チップの追加**: 各チップを指定したクロック周波数で追加
3. **レジスタへの書き込み**: チップのレジスタに値を書き込んで音色を設定
4. **リアルタイム再生**: 60Hzのティックレートでチップを駆動し、オーディオサンプルを生成・ストリーミング再生

### オーディオ出力
`speaker`ライブラリを使用して、生成されたPCMオーディオデータを直接スピーカーに出力します：

- **リアルタイムストリーミング**: バッファリングされたチャンクをリアルタイムで再生
- **Windows対応**: WASAPI（Windows Audio Session API）を使用
- **低レイテンシ**: チップエミュレーションと並行して再生

### サンプリングレート
- **出力サンプリングレート**: 44100Hz
- **チャンクサイズ**: 4096サンプル
- **ティックレート**: 60Hz（サウンドドライバの更新頻度）

## バッファゼロチェック機能

すべての実装に、演奏終了時のバッファゼロチェック機能が組み込まれています：

- 生成されたすべてのバッファが0（無音）かどうかをチェック
- すべて0の場合、エラーメッセージを表示してプロセスを終了（exit code 1）
- これにより、チップが正しく音声を生成しているかを確認できます

## トラブルシューティング

### npm installでのエラー

`npm install`実行時にエラーが発生する場合：

**解決策**:
1. Node.jsのバージョンを確認（20.x以上が必要）:
   ```powershell
   node --version
   ```
2. npmのキャッシュをクリア:
   ```powershell
   npm cache clean --force
   ```
3. node_modulesを削除して再インストール:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

### 音が出ない
1. Windowsの音量設定を確認
2. デフォルトの再生デバイスが正しく設定されているか確認
3. 他のアプリケーションがオーディオデバイスを占有していないか確認
4. バッファゼロチェックのエラーメッセージを確認

### すべてのバッファが0のエラー
```
ERROR: All generated audio buffers were zero!
```

**原因の可能性**:
1. YM2151のレジスタ設定が間違っている
2. libymfm.wasmの初期化に問題がある
3. チップのクロック周波数が不適切

**デバッグ手順**:
1. YM2149版やYM2413版を試して、他のチップでも同じ問題が起きるか確認
2. レジスタ設定を再確認
3. ランダムパラメータ版で様々な設定を試す

## カスタマイズ

各 `.ts` ファイルを編集することで、以下のカスタマイズが可能です：

- **音の高さ**: KCレジスタの値を変更
- **音色**: アルゴリズム、オペレータパラメータの変更
- **音の長さ**: DURATION_SECONDS定数の変更
- **サンプリングレート**: SAMPLING_RATE定数の変更
- **トグル間隔**: TOGGLE_INTERVAL_SECONDS定数の変更（キートグル版・ランダム版）

## 参考リンク

### チップ仕様
- [YM2151 データシート](https://www.vgmpf.com/Wiki/index.php?title=YM2151)
- [YM2149 データシート](https://www.vgmpf.com/Wiki/index.php?title=YM2149)
- [YM2413 データシート](https://www.vgmpf.com/Wiki/index.php?title=YM2413)

### ライブラリ
- [libymfm.wasm リポジトリ](https://github.com/h1romas4/libymfm.wasm)
- [ymfm オリジナル](https://github.com/aaronsgiles/ymfm)
- [node-speaker リポジトリ](https://github.com/TooTallNate/node-speaker)

### ツール
- [Node.js公式サイト](https://nodejs.org/)

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
