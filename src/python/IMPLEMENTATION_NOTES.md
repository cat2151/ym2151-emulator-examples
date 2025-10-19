# Python版 YM2151エミュレータ実装ノート

## 実装概要

このディレクトリには、Python言語でYM2151 (OPM) FM音源チップのエミュレータを実装したコードが含まれています。

## 実装アプローチ

### 選択したライブラリ
- **Nuked-OPM**: サイクル精度の高いYM2151エミュレータ (C言語)
- **ctypes**: PythonからCライブラリを呼び出すための標準ライブラリ
- **numpy**: 数値計算とオーディオデータ処理
- **sounddevice**: クロスプラットフォームなオーディオ出力

### 実装の特徴

#### 1. Nuked-OPMラッパー (`nuked_opm.py`)
- ctypesを使用したCライブラリのPythonラッパー
- `OPM_t`構造体を不透明型として扱い、十分なバッファを確保
- レジスタ書き込み、クロッキング、サンプル生成のAPIを提供
- クロスプラットフォーム対応（.so/.dylib/.dll）

#### 2. ビルドスクリプト (`build_library.sh`)
- Nuked-OPMリポジトリを自動でクローン
- プラットフォームに応じた共有ライブラリをビルド
- Linux、macOS対応

#### 3. メインプログラム (`main.py`)
- YM2151レジスタの設定例
- サンプルレート変換（YM2151: 62.5kHz → 出力: 48kHz）
- ステレオオーディオ出力

#### 4. テストスイート (`test_wrapper.py`)
- ライブラリロードのテスト
- レジスタ書き込みのテスト
- クロック動作のテスト
- サンプル生成のテスト

## 技術的な課題と解決策

### 課題1: 構造体のサイズ
**問題**: ctypesで`opm_t`構造体を完全に定義するのは複雑

**解決策**: 構造体を不透明型として扱い、十分なバッファ (4096バイト) を確保。実際の構造体サイズは1396バイトなので十分。

### 課題2: ステレオ出力
**問題**: 当初、出力が単一の値だと誤解していた

**解決策**: `OPM_Clock`関数は`int32_t output[2]`配列にステレオサンプルを出力することを確認し、修正。

### 課題3: サンプルクロック
**問題**: いつ有効なサンプルが出力されるか不明確

**解決策**: `sh1`と`sh2`信号がサンプルクロックであることを確認。ただし、現在の実装では単純にクロック回数で制御。

### 課題4: 音声出力の検証
**問題**: レジスタ設定が複雑で、音声出力の生成が困難

**現状**: フレームワークは完成しているが、正しいレジスタシーケンスの設定が必要。YM2151のFM合成は以下の要素を正確に設定する必要がある：
- アルゴリズム（オペレータの接続方法）
- オペレータごとのパラメータ（周波数倍率、エンベロープ等）
- チャンネル設定（左右出力、フィードバック）
- キーコード（音程）

## ファイル構成

```
src/python/
├── README.md              # 使用方法とセットアップガイド
├── IMPLEMENTATION_NOTES.md # このファイル
├── requirements.txt        # Python依存パッケージ
├── build_library.sh        # Nuked-OPMビルドスクリプト
├── nuked_opm.py           # Pythonラッパー
├── main.py                # メインプログラム
├── test_wrapper.py        # テストスイート
├── simple_demo.py         # オーディオシステムデモ
├── opm.h                  # Nuked-OPMヘッダー（参照用）
└── libnukedopm.dll        # Nuked-OPM共有ライブラリ（Windows用、ビルド後）
```

## 使用例

### 1. ライブラリのビルド
```bash
./build_library.sh
```

### 2. テストの実行
```bash
python3 test_wrapper.py
```

### 3. メインプログラムの実行
```bash
# 依存関係のインストール
pip install -r requirements.txt

# 実行（オーディオデバイスが必要）
python3 main.py
```

## 今後の改善点

### 優先度: 高
1. **音声出力の実現**: 正しいYM2151レジスタシーケンスの実装
   - 既知の動作するVGMファイルを参考にする
   - 単純な正弦波から始めて徐々に複雑化
   
2. **サンプルプリセット**: 基本的な音色のプリセット追加
   - ピアノ
   - ストリングス
   - ベース
   - ドラム

### 優先度: 中
3. **VGMファイル再生**: VGM (Video Game Music) フォーマットのサポート
4. **WAVファイル出力**: オーディオデバイスなしでの動作
5. **リアルタイム制御**: パラメータの動的変更

### 優先度: 低
6. **GUIフロントエンド**: パラメータ調整用のグラフィカルインターフェース
7. **MIDI入力**: MIDIコントローラからの入力対応

## 参考資料

### YM2151関連
- [Nuked-OPM GitHub](https://github.com/nukeykt/Nuked-OPM)
- [YM2151 Wikipedia](https://en.wikipedia.org/wiki/Yamaha_YM2151)
- [YM2151 Application Manual](http://www.vgmpf.com/Wiki/index.php/YM2151)

### Python/ctypes関連
- [Python ctypes Documentation](https://docs.python.org/3/library/ctypes.html)
- [numpy Documentation](https://numpy.org/doc/)
- [sounddevice Documentation](https://python-sounddevice.readthedocs.io/)

## ライセンス

### Nuked-OPM
- **ライセンス**: LGPL-2.1
- **注意**: 商用利用時は動的リンクまたはソースコード公開が必要

### このプロジェクト
- **ライセンス**: MIT License
- Nuked-OPMのLGPL-2.1ライセンスに準拠する必要がある

## 貢献

改善案やバグ報告は、GitHubのIssueまたはPull Requestでお願いします。

## 謝辞

- Nuke.YKT氏による[Nuked-OPM](https://github.com/nukeykt/Nuked-OPM)の開発
- siliconpr0n.orgによるYM2151のデキャップと解析
