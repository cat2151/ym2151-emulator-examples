# Issue #30: Agent Guidelines Update for Windows-Only Focus

## 概要 / Overview
このissueでは、`.github/copilot-instructions.md`を更新し、AIエージェント向けのガイドラインを改善しました。主な目的は以下の通りです：

This issue updates `.github/copilot-instructions.md` to improve guidelines for AI agents. The main objectives are:

1. **Windows専用であることの明確化**
2. **macOS/Linuxの記述を削除してハルシネーション対策**
3. **Python scriptの使用を推奨**
4. **issue-notes/XX_TITLE.md形式でのドキュメント配置を明記**
5. **Zig ccの使用（MinGWからの移行）**
6. **node-naudiodonの使用（node-speakerからの移行）**

## 実施した変更

### 1. プラットフォーム方針の明確化

**追加した内容:**
- プロジェクトがWindows専用であることを冒頭で明記
- macOS/Linuxの記述を積極的に削除する方針を追加
- AIエージェントのハルシネーション防止を目的として明記

**理由:**
- プロジェクトはWindows環境での動作のみをサポート
- macOS/Linuxに関する不正確な情報がAIエージェントによって生成されるのを防ぐ
- ドキュメントの一貫性を保つ

### 2. スクリプト作成方針の追加

**新規追加セクション:**
```markdown
## スクリプト作成方針
- 新しい自動化スクリプトはPythonで書く
- BAT/Shell/PowerShellは使用しない（legacyな言語）
- 既存のBAT/PowerShell/Shellスクリプトは積極的にPythonスクリプトに置き換える
```

**理由:**
- Pythonは以下の点で優れている:
  - エラーハンドリングが明確
  - 保守性が高い
  - GitHubでのメンテナンスに適している
  - 既に使用されている（build_and_run.py, download_libs.py）

**既存のスクリプト:**
- `build_and_run.py` - ビルド＆実行の自動化
- `scripts/download_libs.py` - ライブラリダウンロード
- `scripts/download_libs.ps1` - PowerShell版（置き換え対象）

### 3. ドキュメント配置方針の追加

**新規追加セクション:**
```markdown
## ドキュメント配置方針
- Issue関連のドキュメントは `issue-notes/XX_TITLE.md` 形式で配置
- XXは2桁のissue番号
- TITLEは内容を示す簡潔な英語
```

**既存の例:**
- `issue-notes/16_IMPLEMENTATION_REPORT.md`
- `issue-notes/22_QUICKSTART.md`
- `issue-notes/28_GITHUB_ACTIONS_AND_DOCS_ORGANIZATION.md`

**効果:**
- Issue番号との紐付けが明確
- ドキュメントの整理が容易
- 一貫性のあるファイル命名規則

### 4. Zig ccビルドガイドの追加（MSYS2/MinGWからの移行）

**新規追加セクション:**
```markdown
## Zig ccビルドガイド
- CGOを使用するGoプロジェクトでは、Zig ccをCコンパイラとして使用
- MinGWは使用しない
```

**重要な内容:**
- Zig ccの利点:
  - MinGWの複雑な依存関係を回避
  - クロスコンパイルが容易
  - DLL依存の問題が少ない
- 標準的なWindows環境でそのまま動作すべき

**具体的なビルドコマンド例:**
```bash
# 環境変数を設定
set CC=zig cc
set CXX=zig c++
set CGO_ENABLED=1

# Goプロジェクトをビルド
go build -o ym2151-example.exe main.go
```

**Zigのインストール:**
- https://ziglang.org/download/ からダウンロード
- システムのPATH環境変数に追加

**検証方法:**
```bash
# Zigのバージョン確認
zig version

# ビルド後、依存DLLを確認
dumpbin /dependents ym2151-example.exe
```
```

### 5. TypeScript/Node.js版のオーディオライブラリ変更

**変更内容:**
- node-speakerからnode-naudiodonへ移行
- TypeScript/Node.js版: `Node.js + libymfm.wasm + naudiodon`

**理由:**
- node-naudiodonは最新のNode.jsバージョンに対応
- より安定した動作
- Windows環境での互換性が高い

## その他の更新

**ビルド・実行ワークフローの更新:**
- Goのビルドコマンドを`Zig cc`使用に更新
  - `set CC=zig cc` → `set CXX=zig c++` → `set CGO_ENABLED=1`
- MinGWに関する記述を削除
- Zig ccの使用を明記

**サウンド出力ライブラリの更新:**
- speakerからnaudiodonへの変更を明記

## 影響範囲

### 直接的な影響
- `.github/copilot-instructions.md`の内容更新のみ
- 実際のコードやビルドスクリプトには変更なし

### AIエージェントへの影響
- Windows専用であることが明確になり、不要なmacOS/Linux関連の提案を防止
- スクリプト作成時にPythonを優先的に選択するようになる
- ドキュメント配置規則が明確になる
- MSYS2でのビルド時に静的リンクを推奨するようになる

### 開発者への影響
- ガイドラインが明確になり、一貫性のある開発が可能
- 新規参加者が方針を理解しやすくなる

## 検証方法

### 1. ドキュメントの確認
```bash
cat .github/copilot-instructions.md
```

### 2. 既存機能の動作確認
- 既存のビルドスクリプトは変更なし
- 既存のドキュメントも変更なし
- 新規のガイドラインのみ追加

## 実装状況

### 完了したタスク
- [x] `.github/copilot-instructions.md`の更新 (このPRで実装)
- [x] `issue-notes/30_AGENT_GUIDELINES_UPDATE.md`の作成 (このPRで実装)

### 今後の推奨アクション

**優先度：中**
- [ ] 既存READMEからmacOS/Linuxの記述を段階的に削除（別issue）
- [ ] 新しいスクリプト作成時はPythonを使用

**優先度：低**
- [ ] 既存のドキュメントを`issue-notes/XX_TITLE.md`形式に移行検討

## まとめ

このissueでは、AIエージェント向けのガイドラインを大幅に改善し、cat-oscillator-syncリポジトリの最新状況に準拠しました：

1. ✅ **Windows専用の明確化** - ハルシネーション防止
2. ✅ **スクリプト方針** - Python優先、BAT/PowerShell/Shellは積極的に置き換え
3. ✅ **ドキュメント配置** - issue-notes/XX_TITLE.md形式
4. ✅ **Zig ccビルドガイド** - MinGW/MSYS2からの移行
5. ✅ **node-naudiodon使用** - node-speakerからの移行

これらの変更により、AIエージェントがより正確で一貫性のある提案を行えるようになり、プロジェクトの品質向上に貢献します。
