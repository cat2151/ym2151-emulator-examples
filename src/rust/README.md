# Rust版 YM2151エミュレータ実装

## 概要
Rustを使用した、実際のYM2151エミュレータライブラリ（Nuked-OPM）を組み込んだ音声再生サンプルです。

このプロジェクトは、サイクル精度の高いNuked-OPMエミュレータをRustのFFI（Foreign Function Interface）経由で使用し、本物のYM2151チップと同等の音声を生成します。

## 特徴
- ✅ 本物のYM2151エミュレータ（Nuked-OPM）を使用
- ✅ サイクル精度の高いエミュレーション
- ✅ RustのFFIバインディングで安全にラップ
- ✅ **Windows専用**（ネイティブビルド）
- ✅ 440Hz（A4音）のFM音源サウンドを生成
- ✅ Nuked-OPM（C言語）を静的リンクでビルド

## 使用ライブラリ
- **Nuked-OPM**: サイクル精度の高いYM2151エミュレータ（C言語）
- **cpal**: クロスプラットフォームオーディオ出力ライブラリ（Rust）
- **cc**: Cコードコンパイル用のビルドツール（Rust）
  - ビルド時に **Nuked-OPM（C言語ライブラリ）** をコンパイルして静的リンクします

## 必要な環境
- **Windows 10/11専用**
- Rust 1.70以降
- MSYS2（Cコンパイラ - Nuked-OPMのコンパイルに必要）

## セットアップと実行

### 1. Rustのインストール

PowerShellで以下を実行：

```powershell
# Rustのインストール
winget install --id Rustlang.Rustup
```

または、[Rust公式サイト](https://www.rust-lang.org/ja/tools/install)から `rustup-init.exe` をダウンロードして実行することもできます。

インストール完了後、**新しいPowerShellウィンドウ**を開いてください。

### 2. MSYS2のインストール

MSYS2は、Nuked-OPM（C言語ライブラリ）をコンパイルするために必要です。

1. [MSYS2公式サイト](https://www.msys2.org/) からインストーラーをダウンロード
2. インストーラーを実行してデフォルト設定でインストール（`C:\msys64`）
3. MSYS2 MINGW64ターミナルを開く
4. 以下のコマンドでGCCをインストール：

```bash
pacman -S mingw-w64-x86_64-gcc
```

### 3. Rust toolchainの設定

PowerShellで以下を実行：

```powershell
# x86_64-pc-windows-gnu toolchainを追加
rustup target add x86_64-pc-windows-gnu

# デフォルトのtoolchainをGNUに設定（このプロジェクト用）
rustup default stable-x86_64-pc-windows-gnu
```

### 4. 環境変数の設定

PowerShellで以下を実行して、現在のセッションでMSYS2のPATHを追加：

```powershell
$env:PATH = "C:\msys64\mingw64\bin;$env:PATH"
```

**または**、システム環境変数に恒久的に追加：

1. Windowsの設定 → システム → バージョン情報 → システムの詳細設定
2. 環境変数をクリック
3. ユーザー環境変数のPathを編集
4. 新規で `C:\msys64\mingw64\bin` を追加

### 5. ビルドと実行

プロジェクトディレクトリに移動してビルド：

```powershell
# プロジェクトディレクトリに移動
cd <プロジェクトのパス>\ym2151-emulator-examples\src\rust

# ビルドと実行を一度に
cargo run --release
```

または、ビルドと実行を分けて行う：

```powershell
# ビルドのみ
cargo build --release

# 実行のみ
.\target\release\ym2151-example.exe
```

実行すると、スピーカーから2秒間の440Hz（A4音）のFM音源サウンドが再生されます。

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

MSYS2のGCCが正しくインストールされていないか、PATHに追加されていない可能性があります。

```powershell
# MSYS2 MINGW64ターミナルでGCCを再インストール
pacman -S mingw-w64-x86_64-gcc

# PowerShellでPATHを確認
$env:PATH

# PATHにC:\msys64\mingw64\binが含まれていない場合は追加
$env:PATH = "C:\msys64\mingw64\bin;$env:PATH"
```

### ビルドエラー: "error: linker `link.exe` not found"

Rustのデフォルトtoolchainが`msvc`になっている可能性があります。`gnu`に変更してください：

```powershell
# 現在のtoolchainを確認
rustup show

# gnuに変更
rustup default stable-x86_64-pc-windows-gnu

# または、このプロジェクトのディレクトリでのみgnu toolchainを使用
rustup override set stable-x86_64-pc-windows-gnu
```

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
