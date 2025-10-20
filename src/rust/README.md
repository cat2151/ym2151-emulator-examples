# Rust版 YM2151エミュレータ実装

## 概要
Rustを使用した、実際のYM2151エミュレータライブラリ（Nuked-OPM）を組み込んだ音声再生サンプルです。

このプロジェクトは、サイクル精度の高いNuked-OPMエミュレータをRustのFFI（Foreign Function Interface）経由で使用し、本物のYM2151チップと同等の音声を生成します。

## 特徴
- ✅ 本物のYM2151エミュレータ（Nuked-OPM）を使用
- ✅ サイクル精度の高いエミュレーション
- ✅ RustのFFIバインディングで安全にラップ
- ✅ Windows環境で動作（ネイティブビルド）
- ✅ 440Hz（A4音）のFM音源サウンドを生成
- ✅ Nuked-OPM（C言語）を静的リンクでビルド

## 使用ライブラリ
- **Nuked-OPM**: サイクル精度の高いYM2151エミュレータ（C言語）
- **cpal**: クロスプラットフォームオーディオ出力ライブラリ（Rust）
- **cc**: Cコードコンパイル用のビルドツール（Rust）
  - ビルド時に **Nuked-OPM（C言語ライブラリ）** をコンパイルして静的リンクします

## 必要な環境
- Windows 10/11
- Rust 1.70以降
- Visual Studio Build Tools 2022（C++コンパイラ - Nuked-OPM（C言語）のコンパイルに必要）

## セットアップと実行

### 1. Visual Studio Build Tools 2022のインストール

PowerShellを管理者権限で開き、以下を実行：

```powershell
# wingetを使用してVisual Studio Build Tools 2022をインストール
winget install --id Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

インストール完了後、新しいPowerShellウィンドウを開いてください（環境変数を反映させるため）。

> **注**: Visual Studio Build Toolsは、Nuked-OPM（C言語ライブラリ）をWindowsネイティブビルドでコンパイルするために必要です。WSL2を使用する方法に比べて、ビルドプロセスがシンプルで安定性が高くなります。

### 2. Rustのインストール

新しいPowerShellで以下を実行：

```powershell
# Rustのインストール
winget install --id Rustlang.Rustup
```

または、[Rust公式サイト](https://www.rust-lang.org/ja/tools/install)から `rustup-init.exe` をダウンロードして実行することもできます。

インストール完了後、新しいPowerShellウィンドウを開いてください。

### 3. ビルド

プロジェクトディレクトリに移動してビルド：

```powershell
# プロジェクトディレクトリに移動
cd C:\path\to\ym2151-emulator-examples\src\rust

# ビルド
cargo build --release
```

### 4. 実行

```powershell
# 実行
cargo run --release
```

実行すると、スピーカーから2秒間の440Hz（A4音）のFM音源サウンドが再生されます。

> **ヒント**: `cargo run --release` でビルドと実行を一度に行うことができます。

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

### ビルドエラー: "C compiler not found" または "link.exe not found"

Visual Studio Build Toolsが正しくインストールされていない可能性があります。

```powershell
# Visual Studio Build Toolsの再インストール
winget install --id Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

インストール後、**新しいPowerShellウィンドウを開いて**再試行してください。

### wingetコマンドが見つからない

Windows 10の古いバージョンを使用している場合、wingetが利用できない可能性があります。

- Windows 11では標準で利用可能です
- Windows 10では、Microsoft Storeから「アプリ インストーラー」をインストールしてください
- または、[Visual Studio公式サイト](https://visualstudio.microsoft.com/ja/downloads/)から手動でBuild Toolsをダウンロードしてインストールできます

### オーディオデバイスが見つからない

実際のオーディオデバイスが接続されているか確認してください。
- スピーカーまたはヘッドフォンが接続されているか確認
- Windowsのサウンド設定で既定のデバイスが設定されているか確認

## ライセンス
- このプロジェクト: [MIT License](../../LICENSE)
- Nuked-OPM: LGPL-2.1（`nuked-opm/LICENSE`を参照）

## 参考リンク
- [YM2151 Wikipedia](https://en.wikipedia.org/wiki/Yamaha_YM2151)
- [Nuked-OPM GitHub](https://github.com/nukeykt/Nuked-OPM)
- [cpal (Cross-Platform Audio Library)](https://github.com/RustAudio/cpal)

## ステータス
✅ **実装完了** - Nuked-OPMを使用した本格的なYM2151エミュレーションが完成しました。
