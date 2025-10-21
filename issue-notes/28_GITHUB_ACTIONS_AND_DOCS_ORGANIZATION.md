# Issue #28: GitHub Actions統合とドキュメント整理

## 概要
このissueでは、他のリポジトリで採用されている3つのGitHub Actionsワークフローを導入し、既存のドキュメントをissue-notes/ディレクトリに整理しました。

## 実施した作業

### 1. GitHub Actionsワークフローの追加

以下の3つのワークフローを`.github/workflows/`ディレクトリに追加しました：

#### 1.1 call-daily-project-summary.yml
- **目的**: プロジェクトの日次サマリーを自動生成
- **トリガー**: 
  - 毎日日本時間 07:00 (UTC 22:00 前日)
  - 手動実行 (workflow_dispatch)
- **使用するシークレット**: GEMINI_API_KEY
- **参照**: cat2151/github-actions/.github/workflows/daily-project-summary.yml@main

#### 1.2 call-issue-note.yml
- **目的**: Issue作成時に自動的にissue-notesを生成
- **トリガー**: Issueがopenedされた時
- **入力パラメータ**: issue_number, issue_title, issue_body, issue_html_url
- **参照**: cat2151/github-actions/.github/workflows/issue-note.yml@main

#### 1.3 call-translate-readme.yml
- **目的**: README.ja.mdの変更を自動翻訳してREADME.mdに反映
- **トリガー**: 
  - README.ja.mdへのpush (mainまたはmasterブランチ)
  - 手動実行 (workflow_dispatch)
- **使用するシークレット**: GEMINI_API_KEY
- **参照**: cat2151/github-actions/.github/workflows/translate-readme.yml@main

### 2. issue-notes/ディレクトリの作成と文書整理

既存の issue に関連するドキュメントを `issue-notes/` ディレクトリに移動し、命名規約に従ってリネームしました。

#### 命名規約
```
issue-notes/##_FILENAME.md
```
- `##`: 関連するissue番号（2桁の数字）
- `FILENAME`: 元のファイル名（大文字、アンダースコア区切り）

#### 移動したドキュメント一覧

##### Issue #4 - TypeScript/Deno版実装
- `src/typescript_deno/DENO_INVESTIGATION.md` → `issue-notes/04_DENO_INVESTIGATION.md`

##### Issue #8 - Python版実装
- `src/python/IMPLEMENTATION_NOTES.md` → `issue-notes/08_IMPLEMENTATION_NOTES.md`

##### Issue #16 - TypeScript版の問題対処
- `src/typescript_deno/ISSUE-16-IMPLEMENTATION-REPORT.md` → `issue-notes/16_IMPLEMENTATION_REPORT.md`
- `src/typescript_deno/RESEARCH-WINDOWS-YM2151.md` → `issue-notes/16_RESEARCH_WINDOWS_YM2151.md`
- `src/typescript_deno/README-WINDOWS.md` → `issue-notes/16_README_WINDOWS.md`

##### Issue #20 - ビルド・実行スクリプトの実装
- `BUILD_AND_RUN.md` → `issue-notes/20_BUILD_AND_RUN.md`

##### Issue #22 - どのプログラミング言語の版も音が鳴らない
- `PR_COMPLETION_REPORT.md` → `issue-notes/22_PR_COMPLETION_REPORT.md`
- `CHANGES_SUMMARY.md` → `issue-notes/22_CHANGES_SUMMARY.md`
- `WINDOWS_SETUP.md` → `issue-notes/22_WINDOWS_SETUP.md`
- `SECURITY_SUMMARY.md` → `issue-notes/22_SECURITY_SUMMARY.md`
- `QUICKSTART.md` → `issue-notes/22_QUICKSTART.md`

##### Issue #24 - Buffer zero問題
- `src/typescript_deno/FIX-BUFFER-ZERO-ISSUE.md` → `issue-notes/24_FIX_BUFFER_ZERO_ISSUE.md`

##### Issue #28 - 本作業
- `issue-notes/28_GITHUB_ACTIONS_AND_DOCS_ORGANIZATION.md` (このファイル)

### 3. 残されたドキュメント

以下のドキュメントは一般的なプロジェクトドキュメントまたは現在も使用中のため、プロジェクトルートに残しました：

- `README.md` - メインのプロジェクト説明
- `IMPLEMENTATION_PLAN.md` - プロジェクト実装計画書
- `LIBRARY_COMPARISON.md` - ライブラリ比較表
- `SETUP_COMPLETE.md` - 初期セットアップレポート（issue #1関連の可能性）

各言語ディレクトリの README.md も現在使用中のため、移動していません：
- `src/go/README.md`
- `src/python/README.md`
- `src/rust/README.md`
- `src/rust/nuked-opm/README.md`
- `src/typescript_deno/README.md`

## 効果と利点

### GitHub Actionsの導入効果
1. **自動化**: Issue作成時に自動的にドキュメントが生成される
2. **可視化**: プロジェクトの日次サマリーで進捗が把握しやすくなる
3. **国際化**: README翻訳の自動化により多言語対応が容易になる

### ドキュメント整理の効果
1. **トレーサビリティ**: どのドキュメントがどのIssueに関連するかが明確
2. **整理整頓**: プロジェクトルートがすっきりし、必要な情報を見つけやすい
3. **履歴管理**: Issue番号によってドキュメントの時系列が把握しやすい

## 参考リポジトリ

この作業は以下のリポジトリを参考にしました：
- https://github.com/cat2151/cat-file-watcher
  - GitHub Actionsワークフローの設定例
  - issue-notes/ディレクトリ構造の参考

## 今後の運用

### 新しいIssueへの対応
1. Issue作成時に `call-issue-note.yml` が自動実行され、issue-notes/##.md が生成される
2. Issue対応中に作成したドキュメントは、完了時に issue-notes/##_FILENAME.md にリネーム・移動する

### README更新時の運用
1. README.ja.md を編集してcommit/push
2. `call-translate-readme.yml` が自動実行され、README.md が更新される

### 日次サマリー
- 毎日日本時間 07:00 に自動的にプロジェクトサマリーが生成される
- 手動で実行したい場合は GitHub Actions の "Call Daily Project Summary" から workflow_dispatch で実行可能

## まとめ

Issue #28の対応により、以下を達成しました：
- ✅ 3つのGitHub Actionsワークフローの導入
- ✅ issue-notes/ディレクトリの作成
- ✅ 14個の既存ドキュメントの整理とリネーム
- ✅ 本作業のドキュメント化（このファイル）

これにより、プロジェクトの自動化と可視化が向上し、ドキュメント管理が体系的になりました。

---

**作成日**: 2025-10-21  
**対応Issue**: #28  
**作業者**: GitHub Copilot Agent
