# YM2151エミュレータ実装計画書

このドキュメントは、Rust / Go / TypeScript / Python でYM2151エミュレータを使った最低限の音声再生を実現するための実装計画書です。

## プロジェクト概要

### 目的
各プログラミング言語（Rust、Go、TypeScript/Deno、Python）で、YM2151エミュレータライブラリを使用して、CLIから最低限の音を鳴らすシンプルなアプリケーションを作成します。

### 参考リポジトリ
- [cat-oscillator-sync](https://github.com/cat2151/cat-oscillator-sync) - マルチ言語でのオーディオ合成実装例

### スコープ
- ✅ 最低限のYM2151音声再生（単音またはシンプルなメロディ）
- ✅ CLI（コマンドライン）での実行
- ✅ 環境構築のシンプルさを重視
- ❌ 複雑な楽曲再生やMIDI対応は対象外
- ❌ GUIやリアルタイム制御は対象外

---

## YM2151エミュレータライブラリ比較

> 💡 **詳細な比較表とライセンス情報**: [LIBRARY_COMPARISON.md](LIBRARY_COMPARISON.md) を参照してください。

### 共通の主要ライブラリ

#### 1. Nuked-OPM ⭐⭐⭐⭐⭐
- **言語**: C
- **特徴**: サイクル精度の高い YM2151 エミュレータ
- **リポジトリ**: https://github.com/nukeykt/Nuked-OPM
- **スター数**: 83 stars
- **ライセンス**: LGPL-2.1
- **メンテナンス状況**: ✅ アクティブ
- **適用性**: 
  - Rust: FFI経由で使用可能 ⭐⭐⭐⭐
  - Go: CGO経由で使用可能 ⭐⭐⭐⭐⭐
  - TypeScript: WebAssemblyにコンパイルして使用 ⭐⭐⭐
  - Python: ctypesやCython経由で使用可能 ⭐⭐⭐⭐

#### 2. ymfm ⭐⭐⭐⭐⭐
- **言語**: C++
- **特徴**: BSD-licensed Yamaha FM sound cores (OPM, OPN, OPL含む)
- **リポジトリ**: https://github.com/aaronsgiles/ymfm
- **スター数**: 309 stars
- **ライセンス**: BSD-3-Clause
- **メンテナンス状況**: ✅ アクティブ
- **適用性**:
  - Rust: FFI経由で使用可能 ⭐⭐⭐⭐
  - Go: CGO経由で使用可能 ⭐⭐⭐⭐⭐
  - TypeScript: WebAssemblyにコンパイルして使用 ⭐⭐⭐
  - Python: ctypesやCython経由で使用可能 ⭐⭐⭐⭐

#### 3. libymfm.wasm ⭐⭐⭐⭐
- **言語**: Rust (WebAssembly build)
- **特徴**: ymfmのWebAssemblyビルド版
- **リポジトリ**: https://github.com/h1romas4/libymfm.wasm
- **スター数**: 59 stars
- **ライセンス**: BSD-3-Clause
- **メンテナンス状況**: ✅ アクティブ
- **適用性**:
  - Rust: 直接使用可能 ⭐⭐⭐⭐⭐
  - Go: WASMランタイム経由で使用 ⭐⭐
  - TypeScript: 直接使用可能 ⭐⭐⭐⭐⭐
  - Python: WASMランタイム経由で使用 ⭐⭐

---

## 言語別実装計画

### 1. Rust版 ⭐⭐⭐⭐⭐ (最推奨)

#### 推奨ライブラリ

##### Option A: libymfm.wasm (最推奨) ⭐⭐⭐⭐⭐
- **プロジェクト適合度**: ✅✅✅✅✅ (5/5)
- **環境構築の容易さ**: ⭐⭐⭐⭐⭐ (cargoで完結)
- **メリット**:
  - Rust製のため統合が簡単
  - WebAssemblyなので依存関係が少ない
  - 活発にメンテナンスされている
  - BSD-3-Clauseライセンス
- **デメリット**:
  - WASM実行のオーバーヘッド（ただし実用上は問題なし）
- **使用方法**: Cargo.tomlに追加するだけ

##### Option B: Nuked-OPM FFI wrapper ⭐⭐⭐⭐
- **プロジェクト適合度**: ✅✅✅✅ (4/5)
- **環境構築の容易さ**: ⭐⭐⭐ (bindgen等のセットアップが必要)
- **メリット**:
  - サイクル精度が非常に高い
  - 直接C言語バインディング
- **デメリット**:
  - FFI bindingのセットアップが必要
  - ビルド環境にC compiler必須

##### Option C: ymfm FFI wrapper ⭐⭐⭐⭐
- **プロジェクト適合度**: ✅✅✅✅ (4/5)
- **環境構築の容易さ**: ⭐⭐⭐ (C++ compilerとbindgenが必要)
- **メリット**:
  - 複数のYamaha FMチップをサポート
  - BSD-3-Clauseライセンス
- **デメリット**:
  - C++ bindingのセットアップがやや複雑

#### 推奨実装アプローチ
```rust
// libymfm.wasmを使用した簡単な例
use libymfm_wasm::Ym2151;

fn main() {
    // YM2151初期化
    let mut chip = Ym2151::new(48000);
    
    // レジスタ設定（簡単な音を鳴らす）
    chip.write(0x08, 0x00); // Key off
    chip.write(0x20, 0x50); // Algorithm, Feedback
    
    // サンプル生成とオーディオ出力
    let mut buffer = vec![0i16; 48000];
    chip.generate(&mut buffer);
    
    // cpalなどでオーディオ出力
}
```

#### 依存関係（推奨）
```toml
[dependencies]
libymfm-wasm = "0.1"  # 仮のバージョン
cpal = "0.15"          # オーディオ出力
```

#### 想定実装時間
- **セットアップ**: 30分
- **基本実装**: 2-3時間
- **テスト・調整**: 1-2時間
- **合計**: 4-6時間

---

### 2. Go版 ⭐⭐⭐⭐

#### 推奨ライブラリ

##### Option A: Nuked-OPM + CGO (推奨) ⭐⭐⭐⭐⭐
- **プロジェクト適合度**: ✅✅✅✅✅ (5/5)
- **環境構築の容易さ**: ⭐⭐⭐ (CGOとCコンパイラが必要)
- **メリット**:
  - サイクル精度が非常に高い
  - CGOで直接Cライブラリを呼び出せる
  - 実績のある安定したライブラリ
- **デメリット**:
  - CGOの有効化が必要
  - クロスコンパイルがやや複雑
- **使用方法**: CGOでCコードをラップ

##### Option B: ymfm + CGO ⭐⭐⭐⭐⭐
- **プロジェクト適合度**: ✅✅✅✅✅ (5/5)
- **環境構築の容易さ**: ⭐⭐⭐ (C++コンパイラが必要)
- **メリット**:
  - 複数のFMチップをサポート
  - BSDライセンスで扱いやすい
  - ドキュメントが充実
- **デメリット**:
  - C++とのバインディングが必要

##### Option C: Pure Go実装を自作 ⭐⭐
- **プロジェクト適合度**: ✅✅ (2/5)
- **環境構築の容易さ**: ⭐⭐⭐⭐⭐ (Go環境のみ)
- **メリット**:
  - 依存関係なし
  - クロスコンパイルが容易
- **デメリット**:
  - ゼロから実装する必要がある（大きな工数）
  - 精度や互換性の検証が必要

#### 推奨実装アプローチ
```go
package main

/*
#cgo CFLAGS: -I./nuked-opm
#cgo LDFLAGS: -L./nuked-opm -lnukedopm
#include "opm.h"
*/
import "C"
import "fmt"

func main() {
    // Nuked-OPMの初期化
    C.OPM_Reset()
    
    // レジスタへの書き込み
    C.OPM_Write(0x08, 0x00)
    C.OPM_Write(0x20, 0x50)
    
    // サンプル生成
    var left, right C.short
    C.OPM_Generate(&left, &right)
    
    fmt.Printf("Generated: L=%d R=%d\n", left, right)
}
```

#### 依存関係（推奨）
```go
// go.mod
module ym2151-emulator-example

go 1.21

require (
    github.com/gordonklaus/portaudio v0.0.0-20230709114228-aafa478834f5
)
```

#### 想定実装時間
- **セットアップ**: 1-2時間（CGO環境構築含む）
- **基本実装**: 3-4時間
- **テスト・調整**: 2-3時間
- **合計**: 6-9時間

---

### 3. TypeScript/Deno版 ⭐⭐⭐⭐⭐

#### 推奨ライブラリ

##### Option A: libymfm.wasm (最推奨) ⭐⭐⭐⭐⭐
- **プロジェクト適合度**: ✅✅✅✅✅ (5/5)
- **環境構築の容易さ**: ⭐⭐⭐⭐⭐ (npm/denoで完結)
- **メリット**:
  - WebAssemblyでブラウザ・Deno両対応
  - 型定義が含まれている
  - 活発にメンテナンスされている
  - オーディオ出力にWeb Audio API使用可能
- **デメリット**:
  - 特になし（このプロジェクトに最適）
- **使用方法**: npmパッケージとしてインストール

##### Option B: Nuked-OPMをEmscriptenでWASM化 ⭐⭐⭐
- **プロジェクト適合度**: ✅✅✅ (3/5)
- **環境構築の容易さ**: ⭐⭐ (Emscriptenのセットアップが必要)
- **メリット**:
  - サイクル精度が高い
  - カスタマイズ可能
- **デメリット**:
  - 自前でWASMビルドが必要
  - セットアップが複雑

##### Option C: Web MIDI API経由でハードウェア再生 ⭐
- **プロジェクト適合度**: ✅ (1/5)
- **環境構築の容易さ**: ⭐⭐⭐ (ブラウザのみ)
- **メリット**:
  - エミュレータ不要
- **デメリット**:
  - 実機またはMIDI音源が必要
  - プロジェクトのスコープ外

#### 推奨実装アプローチ (Deno)
```typescript
// deno版の例
import { Ym2151 } from "npm:libymfm-wasm";

async function main() {
  // YM2151初期化
  const chip = await Ym2151.init(48000);
  
  // レジスタ設定
  chip.write(0x08, 0x00); // Key off
  chip.write(0x20, 0x50); // Algorithm, Feedback
  
  // サンプル生成
  const buffer = new Int16Array(48000);
  chip.generate(buffer);
  
  // Denoのオーディオ出力（要調査）
  console.log("Audio data generated:", buffer.length);
}

main();
```

#### 依存関係（推奨）
```json
// package.json (Node.js/Deno)
{
  "dependencies": {
    "libymfm-wasm": "^0.1.0"
  }
}
```

または

```typescript
// deno.json
{
  "imports": {
    "libymfm-wasm": "npm:libymfm-wasm@^0.1.0"
  }
}
```

#### 想定実装時間
- **セットアップ**: 30分
- **基本実装**: 2-3時間
- **テスト・調整**: 1-2時間
- **合計**: 4-6時間

---

### 4. Python版 ⭐⭐⭐⭐

#### 推奨ライブラリ

##### Option A: Nuked-OPM + ctypes (推奨) ⭐⭐⭐⭐⭐
- **プロジェクト適合度**: ✅✅✅✅✅ (5/5)
- **環境構築の容易さ**: ⭐⭐⭐⭐ (pipで完結、DLLのみ必要)
- **メリット**:
  - ctypesは標準ライブラリ（追加インストール不要）
  - サイクル精度が高い
  - Cライブラリとして安定
- **デメリット**:
  - 事前にNuked-OPMをコンパイルして.soまたは.dllを用意
- **使用方法**: ctypesで動的リンク

##### Option B: ymfm + pybind11 ⭐⭐⭐⭐
- **プロジェクト適合度**: ✅✅✅✅ (4/5)
- **環境構築の容易さ**: ⭐⭐⭐ (pybind11のビルドが必要)
- **メリット**:
  - Pythonバインディングが作りやすい
  - 複数チップサポート
- **デメリット**:
  - pybind11のビルド環境が必要
  - やや複雑

##### Option C: Cythonでラッピング ⭐⭐⭐
- **プロジェクト適合度**: ✅✅✅ (3/5)
- **環境構築の容易さ**: ⭐⭐ (Cythonのセットアップが必要)
- **メリット**:
  - パフォーマンスが良い
- **デメリット**:
  - コンパイルステップが増える

#### 推奨実装アプローチ
```python
# ctypesを使ったNuked-OPMの例
import ctypes
import numpy as np

# Nuked-OPMライブラリのロード
libopm = ctypes.CDLL('./nuked_opm.so')  # または .dll

# 関数シグネチャの定義
libopm.OPM_Reset.argtypes = []
libopm.OPM_Reset.restype = None

libopm.OPM_Write.argtypes = [ctypes.c_uint8, ctypes.c_uint8]
libopm.OPM_Write.restype = None

libopm.OPM_Generate.argtypes = [ctypes.POINTER(ctypes.c_short), ctypes.POINTER(ctypes.c_short)]
libopm.OPM_Generate.restype = None

# 初期化
libopm.OPM_Reset()

# レジスタ設定
libopm.OPM_Write(0x08, 0x00)
libopm.OPM_Write(0x20, 0x50)

# サンプル生成
left = ctypes.c_short()
right = ctypes.c_short()
libopm.OPM_Generate(ctypes.byref(left), ctypes.byref(right))

print(f"Generated: L={left.value} R={right.value}")

# pyaudioやsounddeviceでオーディオ出力
```

#### 依存関係（推奨）
```
# requirements.txt
numpy>=1.24.0
sounddevice>=0.4.6  # オーディオ出力
```

#### 想定実装時間
- **セットアップ**: 1時間（Cライブラリのビルド含む）
- **基本実装**: 2-3時間
- **テスト・調整**: 1-2時間
- **合計**: 4-6時間

---

## 総合推奨ランキング

### プロジェクト適合度と環境構築の容易さの総合評価

| 順位 | 言語 | 推奨度 | 推奨ライブラリ | 理由 |
|------|------|--------|--------------|------|
| 🥇 1 | **TypeScript/Deno** | ⭐⭐⭐⭐⭐ | libymfm.wasm | 最も簡単にセットアップでき、WebAssemblyでクロスプラットフォーム対応 |
| 🥇 1 | **Rust** | ⭐⭐⭐⭐⭐ | libymfm.wasm | Cargo完結で環境構築が容易、パフォーマンスも最高 |
| 🥈 3 | **Python** | ⭐⭐⭐⭐ | Nuked-OPM + ctypes | ctypesは標準ライブラリで追加インストール不要、セットアップも比較的簡単 |
| 🥉 4 | **Go** | ⭐⭐⭐⭐ | Nuked-OPM/ymfm + CGO | CGOのセットアップが必要だが、その後は安定して動作 |

### 環境構築の容易さランキング

1. **TypeScript/Deno + libymfm.wasm**: ⭐⭐⭐⭐⭐
   - npm/denoコマンド1発で完了
2. **Rust + libymfm.wasm**: ⭐⭐⭐⭐⭐
   - cargo buildで完了
3. **Python + ctypes**: ⭐⭐⭐⭐
   - Cライブラリのビルドが必要だが、その後はシンプル
4. **Go + CGO**: ⭐⭐⭐
   - CGO環境とCコンパイラのセットアップが必要

---

## 実装ロードマップ

### Phase 1: 優先実装 (Week 1-2)
1. **TypeScript/Deno版** (最も簡単)
   - libymfm.wasmを使用
   - Deno環境で動作確認
2. **Rust版** (パフォーマンス重視)
   - libymfm.wasmまたはFFI wrapper
   - cpalでオーディオ出力

### Phase 2: 追加実装 (Week 3-4)
3. **Python版** (スクリプト言語として)
   - ctypes + Nuked-OPM
   - sounddeviceでオーディオ出力
4. **Go版** (並行処理の検証)
   - CGO + Nuked-OPM
   - PortAudioでオーディオ出力

### Phase 3: ドキュメント整備 (Week 5)
- 各言語版のREADME作成
- クイックスタートガイド作成
- トラブルシューティング追加

---

## 各言語での最低限のゴール

### 共通ゴール
1. YM2151エミュレータライブラリの初期化
2. 簡単な音（440Hzの正弦波など）の生成
3. オーディオデバイスへの出力
4. CLIから実行可能

### 成功基準
- ✅ `cargo run` / `go run` / `deno run` / `python` コマンドで起動
- ✅ 1秒以上の音声が再生される
- ✅ 追加の手動セットアップ（DLLコピーなど）が最小限
- ✅ README.mdに環境構築手順が明記されている

---

## 注意事項

### ライセンス
- **Nuked-OPM**: LGPL-2.1（商用利用時は注意）
- **ymfm**: BSD-3-Clause（商用利用OK）
- **libymfm.wasm**: BSD-3-Clause（商用利用OK）

### クロスプラットフォーム対応
- Windows, macOS, Linuxでの動作を想定
- オーディオ出力ライブラリは各OSで動作するものを選択

### パフォーマンス目標
- リアルタイム再生: 48kHz サンプリングレート
- バッファサイズ: 512～2048サンプル
- レイテンシ: 50ms以下

---

## 参考リンク

### YM2151関連
- [YM2151 Wikipedia](https://en.wikipedia.org/wiki/Yamaha_YM2151)
- [Nuked-OPM GitHub](https://github.com/nukeykt/Nuked-OPM)
- [ymfm GitHub](https://github.com/aaronsgiles/ymfm)
- [libymfm.wasm GitHub](https://github.com/h1romas4/libymfm.wasm)

### オーディオライブラリ
- Rust: [cpal](https://github.com/RustAudio/cpal)
- Go: [PortAudio](https://github.com/gordonklaus/portaudio)
- Python: [sounddevice](https://python-sounddevice.readthedocs.io/)
- TypeScript/Deno: Web Audio API

---

## まとめ

このプロジェクトでは、**TypeScript/Deno版**と**Rust版**を優先的に実装することを推奨します。両方とも`libymfm.wasm`を使用することで、環境構築がシンプルになり、クロスプラットフォーム対応も容易です。

その後、**Python版**と**Go版**を追加実装することで、各言語の特性を活かした多様な実装例を提供できます。
