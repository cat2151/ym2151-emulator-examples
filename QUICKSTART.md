# Quick Start Guide - YM2151 Emulator Examples (Windows)

このガイドでは、最も簡単にYM2151エミュレータサンプルを動作させる方法を説明します。

## 推奨: Python版を使う

Python版が最もセットアップが簡単で、すぐに音を鳴らすことができます。

### ステップ1: Python環境のセットアップ

```powershell
cd src\python

# 仮想環境の作成
python -m venv venv

# 仮想環境の有効化
venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt
```

### ステップ2: YM2151エミュレータDLLの取得

**方法A: ym2151-emu-win-binからダウンロード（推奨）**

```powershell
# プロジェクトルートに戻る
cd ..\..

# Python版ライブラリをダウンロード
python scripts\download_libs.py python
```

**方法B: ローカルビルド（MSYS2が必要）**

MSYS2をインストール済みの場合：

```powershell
# プロジェクトルートで実行
python scripts\build_libs.py
```

### ステップ3: 実行

```powershell
cd src\python

# 仮想環境を有効化（未実施の場合）
venv\Scripts\activate

# 実行
python main.py
```

スピーカーから440HzのYM2151 FM音源サウンドが聞こえれば成功です！

## トラブルシューティング

### DLLが見つからない

```
FileNotFoundError: Nuked-OPM library not found
```

→ `src/python/ym2151.dll` が存在することを確認してください。存在しない場合は、ステップ2を再実行してください。

### ダウンロードに失敗する

ym2151-emu-win-binリポジトリにまだバイナリがアップロードされていない可能性があります。
その場合は、ローカルビルド（方法B）を試してください。

### ローカルビルドに失敗する

MSYS2のインストールと設定を確認してください：

1. [MSYS2](https://www.msys2.org/) をインストール
2. MSYS2 MINGW64ターミナルを開く
3. 以下を実行:
   ```bash
   pacman -S mingw-w64-x86_64-gcc
   ```

## 次のステップ

音が鳴ることを確認できたら、以下を試してみてください：

- `src/python/main.py` を編集して音の高さや長さを変更
- [実装計画書](IMPLEMENTATION_PLAN.md) を読んで、他の言語版の実装を確認
- 各言語のREADMEで詳細な情報を確認

## 他の言語版

- **Rust版**: [src/rust/README.md](src/rust/README.md) - セットアップがやや複雑ですが、高性能
- **TypeScript/Node.js版**: [src/typescript_deno/README.md](src/typescript_deno/README.md) - WebAssembly版のエミュレータを使用
- **Go版**: 準備中

詳細は各ディレクトリのREADMEを参照してください。
