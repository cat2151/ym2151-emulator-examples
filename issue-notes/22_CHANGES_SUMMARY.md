# 変更内容サマリー

このPRは、YM2151エミュレータライブラリの取得方法を[ym2151-emu-win-bin](https://github.com/cat2151/ym2151-emu-win-bin)リポジトリからのダウンロードに統一します。

## 主な変更点

### 1. ライブラリ取得スクリプトの追加

#### `scripts/download_libs.py` (Python版)
- ym2151-emu-win-binリポジトリからビルド済みバイナリをダウンロード
- 各言語版（Python、Rust、Go、TypeScript）に対応
- エラーハンドリングとわかりやすいメッセージ

#### `scripts/download_libs.ps1` (PowerShell版)
- Windows環境でのダウンロードスクリプト
- download_libs.pyと同じ機能

### 2. Python版の更新

#### `src/python/nuked_opm.py`
- ライブラリ名を `libnukedopm.dll` から `ym2151.dll` に変更
- Windows専用に簡略化（Linux/macOSサポート削除）
- わかりやすいエラーメッセージ

#### `src/python/README.md`
- セットアップ手順を大幅に簡略化
- ダウンロードスクリプトの使い方を説明
- WSL2/MSYS2でのビルド手順を簡潔に
- Windows専用であることを明記

#### 削除
- `src/python/build_library.sh` - 不要になったため削除

### 3. Rust版の更新

#### `src/rust/README.md`
- Visual Studio Build Toolsの代わりにMSYS2を使用
- Windows専用であることを明記
- セットアップ手順を明確化

### 4. Go版の更新

#### サブモジュールの削除
- `.gitmodules` の削除
- `src/go/nuked-opm-src` サブモジュールの削除

#### `src/go/README.md`
- 準備中であることを明記
- Python版への誘導

### 5. TypeScript/Node.js版の更新

#### `src/typescript_deno/README.md`
- Windows専用であることを明記
- Linux/macOSの手順を削除
- speakerライブラリのビルド問題への言及

### 6. ドキュメントの追加・更新

#### `QUICKSTART.md` (新規)
- 初心者向けの最速セットアップガイド
- Python版を推奨
- トラブルシューティング

#### `WINDOWS_SETUP.md` (新規)
- Windows環境での詳細なセットアップガイド
- 各言語版の概要
- ライブラリ取得方法の説明

#### `README.md`
- 実装ステータステーブルを現実的な内容に更新
- QUICKSTARTガイドへのリンク追加
- ライブラリ取得方法の説明

### 7. .gitignoreの更新

- ダウンロード/ビルドされたライブラリを除外
- vendorディレクトリを除外
- 言語別のライブラリパスを追加

## 設計方針

### Windows専用に特化
- Linux/macOSのサポートを削除
- MSYS2を統一的なビルド環境として使用
- PowerShellとPythonスクリプトを提供

### MinGW DLL非依存
- すべてのビルドで静的リンク（`-static-libgcc -static-libstdc++`）を使用
- ユーザー環境へのDLL汚染を防止
- 配布が容易（.exeまたは.dllファイル単体で動作）

### 責任の分離
- **ym2151-emu-win-bin**: ライブラリのビルドと配布
- **ym2151-emulator-examples**: 音を鳴らすサンプルコードに注力

### ユーザーフレンドリー
- 初心者向けにPython版を推奨
- QUICKSTARTガイドで最速セットアップを提供
- わかりやすいエラーメッセージ

## 今後の作業

### 必要な作業
1. **ym2151-emu-win-binでのビルド**: GitHub Actionsでビルドされたバイナリを`binaries/`ディレクトリにコミット
2. **動作確認**: 実際にダウンロードスクリプトでDLLを取得して、Python版が動作するか確認

### オプション
- Go版の実装
- Rust版でもym2151-emu-win-binからのライブラリ取得に対応
- CI/CDでの自動テスト追加
- より詳細なサンプルコード追加

## 互換性への影響

### 破壊的変更
- **Python**: ライブラリ名が変更（`libnukedopm.dll` → `ym2151.dll`）
- **Go**: サブモジュールが削除され、現状では動作しない
- **すべて**: Linux/macOSサポート削除（Windows専用化）

### 移行方法
既存ユーザーは以下の手順で移行：

1. 古いライブラリファイルを削除
2. `python scripts/download_libs.py` を実行
3. 各言語版の更新されたREADMEに従ってセットアップ

## セキュリティ上の考慮事項

- すべてのライブラリは静的リンクされ、MinGW DLLに依存しない
- ダウンロードスクリプトはHTTPS経由でGitHubから取得

## まとめ

このPRは、ユーザーエクスペリエンスを大幅に改善し、セットアップを簡素化します。
特に、初心者が最も簡単に音を鳴らせるようにPython版を推奨し、
ライブラリのビルドをym2151-emu-win-binリポジトリに完全に委譲することで、
このリポジトリは「音を鳴らすサンプルコード」に注力できるようになります。
