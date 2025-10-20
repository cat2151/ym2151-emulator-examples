#!/usr/bin/env python3
"""
YM2151 Emulator Library Downloader for Windows
このスクリプトは、ym2151-emu-win-binリポジトリから必要なライブラリをダウンロードします
"""

import os
import sys
import urllib.request
import argparse
from pathlib import Path

# リポジトリのベースURL
REPO_BASE = "https://raw.githubusercontent.com/cat2151/ym2151-emu-win-bin/main/binaries"

# スクリプトのディレクトリ
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent


def download_file(url: str, output_path: Path) -> bool:
    """ファイルをダウンロードする"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Downloading: {url}")
    print(f"         to: {output_path}")
    
    try:
        urllib.request.urlretrieve(url, output_path)
        print("✓ Downloaded successfully")
        return True
    except Exception as e:
        print(f"✗ Failed to download: {e}")
        return False


def download_python_libs() -> bool:
    """Python用ライブラリをダウンロード"""
    print("\n--- Python Libraries ---")
    url = f"{REPO_BASE}/python/ym2151.dll"
    dest = PROJECT_ROOT / "src" / "python" / "ym2151.dll"
    return download_file(url, dest)


def download_rust_libs() -> bool:
    """Rust用ライブラリをダウンロード"""
    print("\n--- Rust Libraries ---")
    success = True
    
    # 静的ライブラリ
    url = f"{REPO_BASE}/rust/libym2151.a"
    dest = PROJECT_ROOT / "src" / "rust" / "lib" / "libym2151.a"
    if not download_file(url, dest):
        success = False
    
    # ヘッダーファイル（必要な場合）
    url = f"{REPO_BASE}/rust/opm.h"
    dest = PROJECT_ROOT / "src" / "rust" / "lib" / "opm.h"
    download_file(url, dest)  # 失敗しても続行
    
    return success


def download_go_libs() -> bool:
    """Go用ライブラリをダウンロード"""
    print("\n--- Go Libraries ---")
    url = f"{REPO_BASE}/go/libym2151.a"
    dest = PROJECT_ROOT / "src" / "go" / "lib" / "libym2151.a"
    return download_file(url, dest)


def download_typescript_libs() -> bool:
    """TypeScript/Node.js用ライブラリをダウンロード"""
    print("\n--- TypeScript/Node.js Libraries ---")
    print("TypeScript版はlibymfm.wasmを使用します（既に含まれています）")
    return True


def main():
    parser = argparse.ArgumentParser(
        description="YM2151 Emulator Library Downloader"
    )
    parser.add_argument(
        "language",
        nargs="?",
        default="all",
        choices=["python", "rust", "go", "typescript", "all"],
        help="ダウンロードする言語のライブラリ (デフォルト: all)"
    )
    args = parser.parse_args()
    
    print("=========================================")
    print("YM2151 Emulator Library Downloader")
    print("=========================================")
    print()
    
    success = True
    language = args.language.lower()
    
    if language == "python" or language == "all":
        if not download_python_libs():
            success = False
    
    if language == "rust" or language == "all":
        if not download_rust_libs():
            success = False
    
    if language == "go" or language == "all":
        if not download_go_libs():
            success = False
    
    if language == "typescript" or language == "all":
        if not download_typescript_libs():
            success = False
    
    print()
    print("=========================================")
    if success:
        print("ライブラリのダウンロードが完了しました！")
    else:
        print("一部のライブラリのダウンロードに失敗しました")
        print("詳細は上記のログを確認してください")
    print("=========================================")
    print()
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
