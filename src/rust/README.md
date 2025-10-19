# Rust版 YM2151エミュレータ実装

## 概要
Rustを使用した、実際のYM2151エミュレータライブラリ（Nuked-OPM）を組み込んだ音声再生サンプルです。

このプロジェクトは、サイクル精度の高いNuked-OPMエミュレータをRustのFFI（Foreign Function Interface）経由で使用し、本物のYM2151チップと同等の音声を生成します。

## 特徴
- ✅ 本物のYM2151エミュレータ（Nuked-OPM）を使用
- ✅ サイクル精度の高いエミュレーション
- ✅ RustのFFIバインディングで安全にラップ
- ✅ クロスプラットフォーム対応（Windows/macOS/Linux）
- ✅ 440Hz（A4音）のFM音源サウンドを生成

## 使用ライブラリ
- **Nuked-OPM**: サイクル精度の高いYM2151エミュレータ（C言語）
- **cpal**: クロスプラットフォームオーディオ出力ライブラリ（Rust）
- **cc**: Cコードコンパイル用のビルドツール（Rust）

## セットアップ

### 必要な環境

#### Linux (Ubuntu/Debian)
```bash
# ALSA開発ライブラリとCコンパイラのインストール
sudo apt-get install libasound2-dev build-essential
```

#### macOS
```bash
# Xcodeコマンドラインツールのインストール（Cコンパイラ）
xcode-select --install
```

#### Windows
```bash
# Visual Studio Build Tools または MinGW-w64が必要
# https://visualstudio.microsoft.com/ja/downloads/
```

### Rustのインストール
```bash
# Rustがまだインストールされていない場合
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## ビルドと実行

```bash
# プロジェクトのビルド
cargo build --release

# 実行
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

### Linux: "libasound2-dev not found"
```bash
sudo apt-get update
sudo apt-get install libasound2-dev
```

### ビルドエラー: "C compiler not found"
Cコンパイラがインストールされているか確認してください。
- Linux: `sudo apt-get install build-essential`
- macOS: `xcode-select --install`
- Windows: Visual Studio Build Toolsをインストール

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
