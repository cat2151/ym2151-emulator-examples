# Copilot Instructions for ym2151-emulator-examples

## プロジェクト概要
- YM2151（OPM）FM音源チップのエミュレータを、Rust・Go・TypeScript(Node.js)・Pythonで実装した最小限のサウンド再生サンプル集。
- 主要エミュレータ: Nuked-OPM（C）、libymfm.wasm（WASM）、ymfm（C++）
- 目的: 各言語でのFM音源制御・音声出力の最小構成例を比較・検証すること。
- **重要: このプロジェクトはWindows専用です。**

## ディレクトリ構成と主要ファイル
- `src/rust/` : Rust + Nuked-OPM + cpal。`main.rs`がエントリポイント。`build.rs`でCコードをビルド。
- `src/go/` : Go + Nuked-OPM + PortAudio。`main.go`がエントリポイント。CGO必須。
- `src/typescript_deno/` : Node.js + libymfm.wasm + speaker。`src/index.ts`がメイン。Denoは調査用。
- `src/python/` : Python + Nuked-OPM + sounddevice。`main.py`がメイン。ctypesでCライブラリをラップ。

## プラットフォーム方針（重要）
- **このプロジェクトはWindows専用です。**
- macOSやLinuxに関する記述は基本的に削除またはコメントアウトしてください。
- ドキュメントや説明からmacOS/Linuxの手順は積極的に削除し、Windows専用であることを明記してください。
- これによりAIエージェントのハルシネーション（不正確な情報の生成）を防ぎます。

## ビルド・実行ワークフロー（Windows専用）
- Rust: `cargo build --release` → `cargo run --release`
- Go: `set CGO_ENABLED=1` → `go build -o ym2151-example.exe main.go` → `ym2151-example.exe`
- Python: `pip install -r requirements.txt` → `python main.py`
- TypeScript(Node.js): `npm install` → `npm run build` → `npm start`
- 必要なシステムライブラリ: MSYS2経由でインストール（PortAudio等）

## 重要な開発パターン・注意点
- 各言語とも「YM2151レジスタ初期化→音色/周波数設定→PCM出力」の流れが共通。
- C/C++エミュレータ（Nuked-OPM等）はFFI/CGO/ctypesでラップし、WASMはTypeScriptから直接呼び出し。
- サウンド出力は各言語のライブラリ（cpal, PortAudio, sounddevice, speaker）を利用。
- サンプルは「A4=440Hzの単音」を3秒程度再生する最小構成。
- **リアルタイム再生**: speaker等を使ったリアルタイム再生を実装。WAVファイル出力ではない。
- WASMバイナリやCライブラリはWindows用にビルドが必要。READMEの手順を参照。
- Denoでは直接オーディオ出力不可。Node.jsでのみ動作。

## スクリプト作成方針
- **新しい自動化スクリプトはPythonで書いてください。**
- BAT（バッチファイル）、Shell Script（.sh）、PowerShell（.ps1）は避けてください。
- 理由: Pythonは以下の点で優れています:
  - クロスプラットフォーム互換性が高い（将来の拡張性）
  - エラーハンドリングが明確
  - 保守性が高い
  - このプロジェクトで既に使用されている（build_and_run.py, download_libs.py等）
- 既存のPowerShellスクリプト（download_libs.ps1）は維持しますが、新規作成は避けてください。

## 参考: 主要なカスタマイズ例
- 音の高さ: 各mainファイル内のKC（Key Code）値を変更
- 音色: アルゴリズムやオペレータパラメータを変更
- 再生時間: 定数DURATION_SECONDS等を変更

## 典型的なトラブルと対処（Windows専用）
- C/C++/WASMバイナリが見つからない→ビルド手順・パスを再確認
- サウンドデバイスが見つからない→Windowsのオーディオ設定・依存ライブラリを確認
- CGO/ctypes利用時はMSYS2のCビルド環境が必要
- **重要**: MSYS2でビルドする際は、MinGW-w64のDLLに依存しないように静的リンクすること
  - `-static`フラグや静的ライブラリ（.a）を使用
  - ランタイムにMinGW-w64のDLLが必要な状態は避ける
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

## MSYS2ビルド詳細ガイド
- MSYS2を使用してCライブラリをビルドする際の重要な注意事項:
  
### 静的リンク（推奨）
```bash
# 静的リンクでビルド（MinGW-w64 DLL不要）
gcc -c nuked_opm.c -o nuked_opm.o
ar rcs libym2151.a nuked_opm.o

# または静的リンクフラグ付きでビルド
gcc -static -o output.exe source.c -lym2151
```

### 避けるべきパターン
- 動的リンク（.dll）のみの配布: `libgcc_s_seh-1.dll`, `libwinpthread-1.dll`等のMinGW-w64 DLLが必要になる
- これらのDLLに依存すると、エンドユーザーのPC環境で動作しない可能性がある

### 検証方法
```bash
# 依存DLLを確認（PowerShellまたはコマンドプロンプト）
dumpbin /dependents output.exe

# MSYS2内で確認
ldd output.exe
```

標準的なWindows DLL（kernel32.dll, msvcrt.dll等）のみに依存している状態が理想。

---

このガイドはAIエージェントが本リポジトリで即戦力となるための要点をまとめています。疑問点や不足があればフィードバックしてください。
