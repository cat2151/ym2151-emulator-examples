# Rust版 YM2151エミュレータ実装

## 概要
Rustを使用した、実際のYM2151エミュレータライブラリ（Nuked-OPM）を組み込んだ音声再生サンプルです。

このプロジェクトは、サイクル精度の高いNuked-OPMエミュレータをRustのFFI（Foreign Function Interface）経由で使用し、本物のYM2151チップと同等の音声を生成します。

## 特徴
- ✅ 本物のYM2151エミュレータ（Nuked-OPM）を使用
- ✅ サイクル精度の高いエミュレーション
- ✅ RustのFFIバインディングで安全にラップ
- ✅ Windows（WSL2）環境で動作
- ✅ 440Hz（A4音）のFM音源サウンドを生成
- ✅ Nuked-OPM（C言語）を静的リンクでビルド

## 使用ライブラリ
- **Nuked-OPM**: サイクル精度の高いYM2151エミュレータ（C言語）
- **cpal**: クロスプラットフォームオーディオ出力ライブラリ（Rust）
- **cc**: Cコードコンパイル用のビルドツール（Rust）
  - ビルド時に **Nuked-OPM（C言語ライブラリ）** をコンパイルして静的リンクします

## 必要な環境
- Windows 10/11 with WSL2（Ubuntu推奨）
- Rust 1.70以降
- GCC（Cコンパイラ - Nuked-OPM（C言語）のコンパイルに必要）

## セットアップと実行

### 1. WSL2（Ubuntu）のインストール

PowerShellを管理者権限で開き、以下を実行：
```powershell
# WSL2とUbuntuのインストール
wsl --install
```

インストール完了後、PCを再起動してください。

再起動後、スタートメニューから「Ubuntu」を起動し、初回セットアップ（ユーザー名とパスワードの設定）を完了してください。

### 2. Ubuntu（WSL2）での環境構築

Ubuntuターミナルで以下を実行：

```bash
# パッケージリストの更新
sudo apt update

# GCC（Cコンパイラ）とビルドツールのインストール
# これにより Nuked-OPM（C言語ライブラリ）がビルドできます
sudo apt install build-essential -y

# Rustのインストール
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 環境変数の再読み込み
source $HOME/.cargo/env
```

### 3. プロジェクトディレクトリへの移動

WSL2からWindowsのファイルシステムにアクセスします：
```bash
# Windowsのドライブは /mnt/ 以下にマウントされています
# 例: C:\Users\YourName\Documents\ym2151-emulator-examples の場合
cd /mnt/c/Users/YourName/Documents/ym2151-emulator-examples/src/rust
```

### 4. ビルドと実行

```bash
# ビルドと実行を一度に行う
cargo run --release
```

実行すると、Windowsのスピーカーから2秒間の440Hz（A4音）のFM音源サウンドが再生されます。

※ ビルドのみ行う場合：
```bash
cargo build --release
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

### WSL2がインストールできない
Windows 10（バージョン1903以降）または Windows 11 が必要です。
```powershell
# Windows バージョンの確認
winver
```

### ビルドエラー: "C compiler not found" または "cc: not found"
GCC（Cコンパイラ）がインストールされているか確認してください。
```bash
# WSL2 Ubuntu内で実行
sudo apt update
sudo apt install build-essential -y
```

### オーディオデバイスが見つからない
WSL2からWindowsのオーディオデバイスに接続できない場合があります。
- WSLg（WSL2のGUI対応）が有効になっているか確認してください
- Windows 11では標準で有効です
- Windows 10では最新のWSL2に更新してください：
  ```powershell
  wsl --update
  ```

## ライセンス
- このプロジェクト: [MIT License](../../LICENSE)
- Nuked-OPM: LGPL-2.1（`nuked-opm/LICENSE`を参照）

## 参考リンク
- [YM2151 Wikipedia](https://en.wikipedia.org/wiki/Yamaha_YM2151)
- [Nuked-OPM GitHub](https://github.com/nukeykt/Nuked-OPM)
- [cpal (Cross-Platform Audio Library)](https://github.com/RustAudio/cpal)

## ステータス
✅ **実装完了** - Nuked-OPMを使用した本格的なYM2151エミュレーションが完成しました。
