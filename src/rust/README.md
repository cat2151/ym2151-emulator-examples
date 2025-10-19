# Rust版 YM2151エミュレータ実装

## 概要
Rustを使用したYM2151風FM音源の最小実装例です。

このプロジェクトは、YM2151（OPM）のFM合成方式を模倣したシンプルな音声再生デモを提供します。

## 特徴
- ✅ Pure Rust実装（外部C/C++ライブラリ不要）
- ✅ クロスプラットフォーム対応（Windows/macOS/Linux）
- ✅ FM合成による440Hz（A4音）の音声生成
- ✅ エンベロープ（Attack/Sustain/Release）の実装

## 使用ライブラリ
- **cpal**: クロスプラットフォームオーディオ出力ライブラリ

## セットアップ

### 必要な環境

#### Linux (Ubuntu/Debian)
```bash
# ALSA開発ライブラリのインストール
sudo apt-get install libasound2-dev
```

#### macOS
```bash
# 追加のライブラリは不要
```

#### Windows
```bash
# 追加のライブラリは不要
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

### FM合成の仕組み
この実装では、YM2151のFM（Frequency Modulation）合成方式を単純化して実装しています：

1. **キャリア周波数**: 440Hz（A4音）
2. **モジュレータ周波数**: 880Hz（1オクターブ上）
3. **変調指数**: 2.0

### 音声生成フロー
```
モジュレータ(880Hz) → FM変調 → キャリア(440Hz) → エンベロープ → 出力
```

### エンベロープ
- **Attack**: 0.1秒かけてフェードイン
- **Sustain**: 一定の音量を維持
- **Release**: 0.5秒かけてフェードアウト
- **合計時間**: 3秒

## カスタマイズ

音を変更したい場合は、`src/main.rs`の以下のパラメータを調整してください：

```rust
// 周波数の変更
let carrier_freq = 440.0;      // キャリア周波数（Hz）
let modulator_freq = 880.0;    // モジュレータ周波数（Hz）
let modulation_index = 2.0;    // 変調指数

// 音量の変更
output * envelope * 0.3  // 0.3 = 30%の音量
```

## トラブルシューティング

### Linux: "libasound2-dev not found"
```bash
sudo apt-get update
sudo apt-get install libasound2-dev
```

### オーディオデバイスが見つからない
実際のオーディオデバイスが接続されているか確認してください。
CI/CD環境など、オーディオデバイスがない環境では実行できません。

## ライセンス
このプロジェクトは [MIT License](../../LICENSE) の下で公開されています。

## 参考リンク
- [YM2151 Wikipedia](https://en.wikipedia.org/wiki/Yamaha_YM2151)
- [cpal (Cross-Platform Audio Library)](https://github.com/RustAudio/cpal)
- [FM synthesis](https://en.wikipedia.org/wiki/Frequency_modulation_synthesis)

## ステータス
✅ **実装完了** - 基本的なFM音源の実装が完了しました。
