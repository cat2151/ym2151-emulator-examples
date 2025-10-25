# Copilot Instructions for ym2151-emulator-examples

## プロジェクト概要
- YM2151（OPM）FM音源チップのエミュレータを、Rust・Go・TypeScript(Node.js)・Pythonで実装した最小限のサウンド再生サンプル集。
- 主要エミュレータ: Nuked-OPM（C）、libymfm.wasm（WASM）、ymfm（C++）
- 目的: 各言語でのFM音源制御・音声出力の最小構成例を比較・検証すること。
- **重要: このプロジェクトはWindows専用です。**

## ディレクトリ構成と主要ファイル
- `src/rust/` : Rust + Nuked-OPM + cpal。`main.rs`がエントリポイント。`build.rs`でCコードをビルド。
- `src/go/` : Go + Nuked-OPM + PortAudio。`main.go`がエントリポイント。CGO必須（Zig ccを使用）。
- `src/typescript_deno/` : Node.js + libymfm.wasm + naudiodon。`src/index.ts`がメイン。Denoは調査用。
- `src/python/` : Python + Nuked-OPM + sounddevice。`main.py`がメイン。ctypesでCライブラリをラップ。

## プラットフォーム方針（重要）
- **このプロジェクトはWindows専用です。**
- macOSやLinuxに関する記述は基本的に削除またはコメントアウトしてください。
- ドキュメントや説明からmacOS/Linuxの手順は積極的に削除し、Windows専用であることを明記してください。
- これによりAIエージェントのハルシネーション（不正確な情報の生成）を防ぎます。

## ビルド・実行ワークフロー（Windows専用）
- Rust: `cargo build --release` → `cargo run --release`
- Go: `set CC=zig cc` → `set CXX=zig c++` → `set CGO_ENABLED=1` → `go build -o ym2151-example.exe main.go` → `ym2151-example.exe`
- Python: `pip install -r requirements.txt` → `python main.py`
- TypeScript(Node.js): `npm install` → `npm run build` → `npm start`
- Cコンパイラ: Zig ccを使用（MinGWは使用しない）

## 重要な開発パターン・注意点
- 各言語とも「YM2151レジスタ初期化→音色/周波数設定→PCM出力」の流れが共通。
- C/C++エミュレータ（Nuked-OPM等）はFFI/CGO/ctypesでラップし、WASMはTypeScriptから直接呼び出し。
- サウンド出力は各言語のライブラリ（cpal, PortAudio, sounddevice, naudiodon）を利用。
- サンプルは「A4=440Hzの単音」を3秒程度再生する最小構成。
- **リアルタイム再生**: naudiodon等を使ったリアルタイム再生を実装。WAVファイル出力ではない。
- WASMバイナリやCライブラリはWindows用にビルドが必要。READMEの手順を参照。
- Denoでは直接オーディオ出力不可。Node.jsでのみ動作。
- **TypeScript/Node.js版**: node-speakerではなくnode-naudiodonを使用

## スクリプト作成方針
- **新しい自動化スクリプトはPythonで書いてください。**
- BAT（バッチファイル）、Shell Script（.sh）、PowerShell（.ps1）は使用しません。
  - これらはlegacyな言語であり、GitHubでのメンテナンスに向かないためです。
  - **既存のBAT/PowerShell/Shellスクリプトは積極的にPythonスクリプトに置き換えてください。**
- 理由: Pythonは以下の点で優れています:
  - エラーハンドリングが明確
  - 保守性が高い
  - GitHubでのメンテナンスに適している
  - このプロジェクトで既に使用されている（build_and_run.py, download_libs.py等）
- 環境構築は、複数の手順が必要な場合に、Pythonスクリプトファイルを作成して自動化してください。

## 参考: 主要なカスタマイズ例
- 音の高さ: 各mainファイル内のKC（Key Code）値を変更
- 音色: アルゴリズムやオペレータパラメータを変更
- 再生時間: 定数DURATION_SECONDS等を変更

## 典型的なトラブルと対処（Windows専用）
- C/C++/WASMバイナリが見つからない→ビルド手順・パスを再確認
- サウンドデバイスが見つからない→Windowsのオーディオ設定・依存ライブラリを確認
- CGO利用時はZig ccを使用
  - `set CC=zig cc`
  - `set CXX=zig c++`
  - `set CGO_ENABLED=1`
- **重要**: Zig ccでビルドすることで、依存DLLの問題を回避
  - MinGWは使用しません
  - 成果物は標準的なWindows環境でそのまま動作すべき

## ドキュメント配置方針
- **Issue関連のドキュメントは `issue-notes/XX_TITLE.md` 形式で配置してください。**
- XXは2桁のissue番号（例: 16, 22, 28）
- TITLEは内容を示す簡潔な英語（アンダースコア区切り、例: RESEARCH_WINDOWS_YM2151）
- 既存の例:
  - `issue-notes/16_IMPLEMENTATION_REPORT.md`
  - `issue-notes/22_QUICKSTART.md`
  - `issue-notes/28_GITHUB_ACTIONS_AND_DOCS_ORGANIZATION.md`
- この形式により、Issue番号との紐付けが明確になり、ドキュメントの整理が容易になります。

## 追加情報
- 詳細な設計・比較は `IMPLEMENTATION_PLAN.md` `LIBRARY_COMPARISON.md` を参照
- 各言語ごとのREADMEにセットアップ・実行・カスタマイズ例あり（Windows専用）

## Zig ccビルドガイド
- CGOを使用するGoプロジェクトでは、Zig ccをCコンパイラとして使用します。
  
### Zig ccの利点
- MinGWの複雑な依存関係を回避
- クロスコンパイルが容易
- DLL依存の問題が少ない

### ビルド手順
```bash
# 環境変数を設定
set CC=zig cc
set CXX=zig c++
set CGO_ENABLED=1

# Goプロジェクトをビルド
go build -o ym2151-example.exe main.go
```

### Zigのインストール
- https://ziglang.org/download/ からZigをダウンロード
- ZigのパスをシステムのPATH環境変数に追加

### 検証方法
```bash
# Zigのバージョン確認
zig version

# ビルド後、依存DLLを確認
dumpbin /dependents ym2151-example.exe
```

標準的なWindows DLL（kernel32.dll, msvcrt.dll等）のみに依存している状態が理想。

---

このガイドはAIエージェントが本リポジトリで即戦力となるための要点をまとめています。疑問点や不足があればフィードバックしてください。

## userによる追加情報
- 以下の追加情報が優先されます。これより上にある情報で矛盾しているものがあれば削除し、以下の追加情報に置き換えてください
- wavファイルへの出力ではなく、物理スピーカーを鳴らすリアルタイム再生にしてください
- Windows専用にしてください
- MacOS / Linuxの手順は削除してください
- mingwとMSYS2の手順は削除してください
  - かわりにzig ccを使った手順に置き換えてください
- BAT / sh / PowerShellスクリプトは削除してください
  - かわりにPythonスクリプトでビルド・実行手順を自動化してください
- issueに紐付くドキュメントは、 issue-notes/ に移動してください
