# Issue #30: Agent Guidelines Update for Windows-Only Focus

## 概要
このissueでは、`.github/copilot-instructions.md`を更新し、AIエージェント向けのガイドラインを改善しました。主な目的は以下の通りです：

1. **Windows専用であることの明確化**
2. **macOS/Linuxの記述を削除してハルシネーション対策**
3. **Python scriptの使用を推奨**
4. **issue-notes/XX_TITLE.md形式でのドキュメント配置を明記**

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
- BAT/Shell/PowerShellは避ける
- 既存のPowerShellスクリプトは維持
```

**理由:**
- Pythonは以下の点で優れている:
  - エラーハンドリングが明確
  - 保守性が高い
  - クロスプラットフォーム互換性（将来の拡張性）
  - 既に使用されている（build_and_run.py, download_libs.py）

**既存のスクリプト:**
- `build_and_run.py` - ビルド＆実行の自動化
- `scripts/download_libs.py` - ライブラリダウンロード
- `scripts/download_libs.ps1` - PowerShell版（維持）

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

### 4. MSYS2ビルド詳細ガイドの追加

**新規追加セクション:**
```markdown
## MSYS2ビルド詳細ガイド
- 静的リンク（推奨）
- 避けるべきパターン
- 検証方法
```

**重要な内容:**
- MinGW-w64のDLLに依存しない静的リンクを推奨
- 動的リンクで必要になるDLL（libgcc_s_seh-1.dll等）への依存を避ける
- 標準的なWindows環境でそのまま動作すべき

**具体的なビルドコマンド例:**
```bash
# 静的リンクでビルド（MinGW-w64 DLL不要）
gcc -c nuked_opm.c -o nuked_opm.o
ar rcs libym2151.a nuked_opm.o

# または静的リンクフラグ付きでビルド
gcc -static -o output.exe source.c -lym2151
```

**検証方法:**
```bash
# 依存DLLを確認（PowerShellまたはコマンドプロンプト）
dumpbin /dependents output.exe

# MSYS2内で確認
ldd output.exe
```

### 5. その他の更新

**ビルド・実行ワークフローの更新:**
- Windows専用であることを明記
- Goのビルドコマンドを`.exe`付きに修正
- `set CGO_ENABLED=1`の使用を明記（Windows環境）

**リアルタイム再生の明記:**
- WAVファイル出力ではなく、speaker等を使ったリアルタイム再生であることを強調

**"userによる追加情報"セクションの削除:**
- 本文に統合したため削除
- 内容は適切なセクションに再配置

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

## 今後の推奨アクション

### 優先度：高
- [x] `.github/copilot-instructions.md`の更新

### 優先度：中
- [ ] 既存READMEからmacOS/Linuxの記述を段階的に削除（別issue）
- [ ] 新しいスクリプト作成時はPythonを使用

### 優先度：低
- [ ] 既存のドキュメントを`issue-notes/XX_TITLE.md`形式に移行検討

## まとめ

このissueでは、AIエージェント向けのガイドラインを大幅に改善しました：

1. ✅ **Windows専用の明確化** - ハルシネーション防止
2. ✅ **スクリプト方針** - Python優先
3. ✅ **ドキュメント配置** - issue-notes/XX_TITLE.md形式
4. ✅ **MSYS2ビルドガイド** - 静的リンク推奨

これらの変更により、AIエージェントがより正確で一貫性のある提案を行えるようになり、プロジェクトの品質向上に貢献します。
