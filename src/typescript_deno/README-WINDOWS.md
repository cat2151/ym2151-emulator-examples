# TypeScript/Node.js版 YM2151エミュレータ実装（Windows専用）

> **注意**: この実装は**Windows専用**です。Node.jsの`speaker`ライブラリは、Windowsでネイティブコンパイルが必要なため、Visual Studio Build Toolsを使用したビルド環境が必要です。

> **重要**: WSL2では実装できません。WSL2はLinux環境のため、Windowsのオーディオデバイスに直接アクセスできません。

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
  - **ネイティブモジュール**: C++で書かれており、Windows用にコンパイルが必要

## 必要な環境
- **Windows 10/11**
- **Node.js 20.x以上**
- **Visual Studio Build Tools 2022** （ネイティブモジュールのビルドに必要）
- **Python 3.x** （node-gypに必要）

## セットアップ手順（Windows）

### 方法1: Visual Studio Build Tools（推奨）

#### 1. Visual Studio Build Toolsのインストール

1. [Visual Studio Build Tools 2022](https://visualstudio.microsoft.com/ja/downloads/)をダウンロード
   - 「すべてのダウンロード」→「Visual Studio 2022用のツール」→「Build Tools for Visual Studio 2022」
2. インストーラを実行し、「C++によるデスクトップ開発」ワークロードを選択
3. インストール完了後、Windowsを再起動

#### 2. Pythonのインストール

1. [Python公式サイト](https://www.python.org/downloads/)から最新版をダウンロード
2. インストール時に「Add Python to PATH」にチェックを入れる

#### 3. node-gypの設定

PowerShellまたはコマンドプロンプト（管理者権限）で実行：

```powershell
# Visual Studio Build Tools 2022を使用
npm config set msvs_version 2022

# node-gypをグローバルインストール
npm install -g node-gyp

# 設定確認
node-gyp --version
```

## プロジェクトのセットアップ

### 1. 依存関係のインストール

通常のコマンドプロンプトまたはPowerShellで実行：

```bash
cd src/typescript_deno
npm install
```

**トラブルシューティング**:
- `speaker`のビルドエラーが出る場合：
  - Visual Studio Build Toolsが正しくインストールされているか確認
  - `npm config get msvs_version`で設定を確認（2022と表示されるはず）
  - PowerShellを再起動して環境変数を再読み込み
- Python関連のエラーが出る場合：
  - Pythonがインストールされているか確認: `python --version`
  - PATHが正しく設定されているか確認

### 2. TypeScriptのビルド

```bash
npm run build
```

## 実行方法

### 基本版（YM2151、3秒間440Hz再生）
```bash
npm start
```

### キートグル版（0.5秒ごとにON/OFF、3秒間）
```bash
npm run start:keytoggle
```

### ランダムパラメータ版（CTRL+Cまで無限ループ）
```bash
npm run start:random
```

### YM2149版（PSGチップ、比較用）
```bash
npm run start:ym2149
```

### YM2413版（OPLLチップ、比較用）
```bash
npm run start:ym2413
```

## 実行方法

### 基本版（YM2151、3秒間440Hz再生）
```bash
npm start
```

### キートグル版（0.5秒ごとにON/OFF、3秒間）
```bash
npm run start:keytoggle
```

### ランダムパラメータ版（CTRL+Cまで無限ループ）
```bash
npm run start:random
```

### YM2149版（PSGチップ、比較用）
```bash
npm run start:ym2149
```

### YM2413版（OPLLチップ、比較用）
```bash
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

### speakerのビルドエラー
```
Error: `make` failed with exit code: 2
```

**解決策**:
1. Visual Studio Build Tools 2022が正しくインストールされているか確認
   - 「C++によるデスクトップ開発」ワークロードがインストールされているか確認
2. npm config設定を確認:
   ```powershell
   npm config get msvs_version
   # "2022" と表示されるはず
   ```
3. PowerShellを管理者権限で再起動
4. `npm install`を再実行

### Pythonが見つからないエラー
```
gyp ERR! find Python
```

**解決策**:
1. Pythonがインストールされているか確認:
   ```powershell
   python --version
   ```
2. PATHに追加されているか確認
3. PowerShellを再起動
4. `npm install`を再実行

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

## WSL2について

**WSL2では実装できません**。理由：

- WSL2はLinux環境であり、Windowsのオーディオデバイスに直接アクセスできない
- `speaker`ライブラリはネイティブのオーディオドライバ（WASAPI）を使用するため、Windows上で直接実行する必要がある
- WSL2でビルドしたバイナリはLinux用であり、Windows上では動作しない

WSL2を使用する場合は、別のアプローチ（Webサーバー + Web Audio API等）が必要になります。

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
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/ja/downloads/)
- [Python公式サイト](https://www.python.org/downloads/)
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
