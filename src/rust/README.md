# Rust版 YM2151エミュレータ実装

## 概要
Rustを使用した、実際のYM2151エミュレータライブラリ（Nuked-OPM）を組み込んだ音声再生サンプルです。

このプロジェクトは、サイクル精度の高いNuked-OPMエミュレータをRustのFFI（Foreign Function Interface）経由で使用し、本物のYM2151チップと同等の音声を生成します。

## 特徴
- ✅ 本物のYM2151エミュレータ（Nuked-OPM）を使用
- ✅ サイクル精度の高いエミュレーション
- ✅ RustのFFIバインディングで安全にラップ
- ✅ Windows環境で動作
- ✅ 440Hz（A4音）のFM音源サウンドを生成

## 使用ライブラリ
- **Nuked-OPM**: サイクル精度の高いYM2151エミュレータ（C言語）
- **cpal**: クロスプラットフォームオーディオ出力ライブラリ（Rust）
- **cc**: Cコードコンパイル用のビルドツール（Rust）

## 必要な環境
- Rust 1.70以降
- Visual Studio Build Tools または MinGW-w64（Cコンパイラ）

## セットアップと実行

### 1. Visual Studio Build Toolsのインストール

以下のいずれかの方法でCコンパイラをインストールしてください：

#### 方法A: Visual Studio Build Tools（推奨）
1. [Visual Studio Build Tools](https://visualstudio.microsoft.com/ja/downloads/) からインストーラーをダウンロード
2. インストーラーを実行し、「C++によるデスクトップ開発」を選択してインストール

#### 方法B: MinGW-w64
1. [MinGW-w64](https://www.mingw-w64.org/) をインストール
2. 環境変数PATHにMinGW-w64のbinディレクトリを追加

### 2. Rustのインストール（まだインストールされていない場合）

1. [Rust公式サイト](https://www.rust-lang.org/ja/tools/install) から `rustup-init.exe` をダウンロード
2. ダウンロードした `rustup-init.exe` を実行してインストール

または、PowerShellで以下のコマンドを実行：
```powershell
# PowerShellで実行
Invoke-WebRequest -Uri https://win.rustup.rs -OutFile rustup-init.exe
.\rustup-init.exe
```

### 3. ビルド

コマンドプロンプトまたはPowerShellで以下を実行：
```powershell
# プロジェクトのビルド
cargo build --release
```

### 4. 実行
```powershell
# 実行
cargo run --release
```

実行すると、スピーカーから2秒間の440Hz（A4音）のFM音源サウンドが再生されます。

### ワンステップで実行
```powershell
# ビルドと実行を一度に行う
cargo run --release
```

## 実装の詳細

### アーキテクチャ
このプロジェクトは以下の構成で動作します：

1. **Nuked-OPM（C言語）**: YM2151チップの忠実なエミュレーション
2. **FFIバインディング（Rust）**: Rustから安全にCライブラリを呼び出す
3. **オーディオ出力（cpal）**: 生成されたサンプルを実際のオーディオデバイスに出力

### ビルドプロセス
`build.rs`スクリプトが以下を自動的に実行します：
- Nuked-OPMのCソースコード（`opm.c`）をコンパイル
- 静的ライブラリとしてリンク

### YM2151レジスタ設定
プログラムは起動時に以下の設定を行います：
- チャンネル0を使用
- 440Hz（A4音）の周波数設定
- シンプルなアルゴリズム（1オペレータ）
- 高速アタック、中程度の音量

## ファイル構成

```
src/rust/
├── Cargo.toml          # プロジェクト設定
├── Cargo.lock          # 依存関係のロックファイル
├── build.rs            # Nuked-OPMビルドスクリプト
├── src/
│   └── main.rs         # メイン実装（FFIバインディング含む）
├── nuked-opm/          # Nuked-OPMライブラリ（vendored）
│   ├── opm.c
│   └── opm.h
└── README.md           # このファイル
```

## カスタマイズ

音を変更したい場合は、`src/main.rs`の`init_simple_tone()`関数内のレジスタ設定を変更してください：

```rust
// 周波数の変更（KCレジスタ）
self.write(0x28, 0x4A); // 0x4A = 440Hz付近

// 音量の変更（TLレジスタ）
self.write(0x60 + op, 0x18); // 0x00-0x7F (小さいほど大きい音)

// エンベロープの変更
self.write(0x80 + op, 0x1F); // AR (Attack Rate)
self.write(0xE0 + op, 0x0F); // RR (Release Rate)
```

## トラブルシューティング

### ビルドエラー: "C compiler not found"
Cコンパイラがインストールされているか確認してください。
- Visual Studio Build Tools または MinGW-w64をインストールしてください
- インストール後、新しいコマンドプロンプト/PowerShellを開いて再試行してください

### ビルドエラー: "link.exe not found"
Visual Studio Build Toolsが正しくインストールされていない可能性があります。
1. Visual Studio Installerを起動
2. 「C++によるデスクトップ開発」がインストールされているか確認
3. インストールされていない場合は追加でインストール

### オーディオデバイスが見つからない
実際のオーディオデバイスが接続されているか確認してください。
CI/CD環境など、オーディオデバイスがない環境では実行できません。

## ライセンス
- このプロジェクト: [MIT License](../../LICENSE)
- Nuked-OPM: LGPL-2.1（`nuked-opm/LICENSE`を参照）

## 参考リンク
- [YM2151 Wikipedia](https://en.wikipedia.org/wiki/Yamaha_YM2151)
- [Nuked-OPM GitHub](https://github.com/nukeykt/Nuked-OPM)
- [cpal (Cross-Platform Audio Library)](https://github.com/RustAudio/cpal)

## ステータス
✅ **実装完了** - Nuked-OPMを使用した本格的なYM2151エミュレーションが完成しました。
