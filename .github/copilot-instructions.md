# Copilot Instructions for ym2151-emulator-examples

## プロジェクト概要
- YM2151（OPM）FM音源チップのエミュレータを、Rust・Go・TypeScript(Node.js)・Pythonで実装した最小限のサウンド再生サンプル集。
- 主要エミュレータ: Nuked-OPM（C）、libymfm.wasm（WASM）、ymfm（C++）
- 目的: 各言語でのFM音源制御・音声出力の最小構成例を比較・検証すること。

## ディレクトリ構成と主要ファイル
- `src/rust/` : Rust + Nuked-OPM + cpal。`main.rs`がエントリポイント。`build.rs`でCコードをビルド。
- `src/go/` : Go + Nuked-OPM + PortAudio。`main.go`がエントリポイント。CGO必須。
- `src/typescript_deno/` : Node.js + libymfm.wasm + speaker。`src/index.ts`がメイン。Denoは調査用。
- `src/python/` : Python + Nuked-OPM + sounddevice。`main.py`がメイン。ctypesでCライブラリをラップ。

## ビルド・実行ワークフロー
- Rust: `cargo build --release` → `cargo run --release`
- Go: `CGO_ENABLED=1 go build -o ym2151-example main.go` → `./ym2151-example`
- Python: `pip install -r requirements.txt` → `python main.py`
- TypeScript(Node.js): `npm install` → `npm run build` → `npm start`
  - Windows, Linux, macOSで必要なシステムライブラリ（PortAudio, ALSA等）に注意

## 重要な開発パターン・注意点
- 各言語とも「YM2151レジスタ初期化→音色/周波数設定→PCM出力」の流れが共通。
- C/C++エミュレータ（Nuked-OPM等）はFFI/CGO/ctypesでラップし、WASMはTypeScriptから直接呼び出し。
- サウンド出力は各言語のクロスプラットフォームライブラリ（cpal, PortAudio, sounddevice, speaker）を利用。
- サンプルは「A4=440Hzの単音」を3秒程度再生する最小構成。
- WASMバイナリやCライブラリは各プラットフォームでビルドが必要。READMEの手順を参照。
- Denoでは直接オーディオ出力不可。Node.jsでのみ動作。

## 参考: 主要なカスタマイズ例
- 音の高さ: 各mainファイル内のKC（Key Code）値を変更
- 音色: アルゴリズムやオペレータパラメータを変更
- 再生時間: 定数DURATION_SECONDS等を変更

## 典型的なトラブルと対処
- C/C++/WASMバイナリが見つからない→ビルド手順・パスを再確認
- サウンドデバイスが見つからない→システムのオーディオ設定・依存ライブラリを確認
- WindowsでCGO/ctypes利用時はMSYS2やMinGW等のCビルド環境が必要

## 追加情報
- 詳細な設計・比較は `IMPLEMENTATION_PLAN.md` `LIBRARY_COMPARISON.md` を参照
- 各言語ごとのREADMEにセットアップ・実行・カスタマイズ例あり

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
