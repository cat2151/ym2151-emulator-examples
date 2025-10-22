# Deno実装の調査結果

## 結論

**Denoでの直接オーディオ再生は実現不可能**と判断しました。

## 調査内容

### 1. Denoのオーディオ機能

Denoには以下の制約があります：

- **Web Audio APIはブラウザ専用**: Deno CLIでは利用不可
- **ネイティブオーディオAPIなし**: Node.jsの`speaker`ライブラリに相当するものが存在しない
- **ネイティブモジュール非対応**: Node.jsのネイティブアドオン（`.node`ファイル）を読み込めない

### 2. speakerライブラリの互換性

Node.jsの`speaker`ライブラリは：

- `node-gyp`を使用してネイティブモジュールをコンパイル
- PortAudio/ALSA/CoreAudio/WASAPIへのバインディングを提供
- Denoのアーキテクチャと根本的に非互換

### 3. Deno FFIの検討

Deno FFI（Foreign Function Interface）を使用すれば理論上は可能ですが：

**必要な作業：**
- PortAudio、ALSA、CoreAudio、WASAPIへのFFIバインディングを自作
- プラットフォーム別の実装（Linux/macOS/Windows）
- バッファ管理、同期処理、エラーハンドリング
- 音声ストリーミングの実装

**工数見積もり：**
- 数週間〜数ヶ月の開発時間が必要
- 既存のライブラリを使う方が現実的

### 4. npm互換モード

Denoはnpmパッケージをインポート可能ですが：

- ネイティブモジュール（`speaker`）は非対応
- Node.js互換モードを使うことは「Denoを使う意味」を損なう

## 代替案の検討

### 案A: Node.js実装を維持（推奨）✅

**メリット：**
- すでに動作する実装がある
- `speaker`ライブラリでクロスプラットフォーム対応済み
- 即座に利用可能

**デメリット：**
- Denoではない（ただし、Denoに技術的制約があるため妥当）

### 案B: 純粋Denoでファイル出力

**メリット：**
- Denoで動作する
- シンプルで信頼性が高い

**デメリット：**
- 直接再生できない（外部ツール`ffplay`/`aplay`が必要）
- ユーザーの要求「直接演奏してほしい」を満たせない

### 案C: Denoから外部プレーヤーを起動

**メリット：**
- Denoで動作する
- `Deno.Command`で`ffplay`を起動し、stdinにデータをパイプ

**デメリット：**
- 外部依存（ffplayのインストールが必要）
- クロスプラットフォーム対応が複雑
- `speaker`ライブラリより劣る

## 推奨事項

**Node.js実装を維持することを推奨します。**

### 理由：

1. **技術的制約**: Denoには直接オーディオ再生のための適切なAPIやライブラリが存在しない
2. **ユーザー要求**: 「直接演奏してほしい」という要求を満たせるのはNode.jsのみ
3. **実用性**: Node.jsの`speaker`ライブラリは成熟しており、クロスプラットフォーム対応済み
4. **開発効率**: Deno FFI実装は工数が大きすぎる

### 今後の展望

Denoコミュニティで以下のような開発があれば、将来的にDeno対応が可能になります：

- Deno用のPortAudioバインディングライブラリの開発
- Deno標準ライブラリへのオーディオAPI追加
- サードパーティによる`deno-speaker`のような専用ライブラリ

現時点（2025年10月）では、これらは存在しないため、Node.js実装が最適解です。

## 参考情報

- [Deno FFI Documentation](https://deno.land/manual/runtime/ffi_api)
- [Node.js speaker library](https://github.com/TooTallNate/node-speaker)
- [PortAudio - Cross-platform audio I/O library](http://www.portaudio.com/)

---

**調査日**: 2025年10月19日  
**結論**: Node.js実装を継続使用
