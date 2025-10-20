#!/usr/bin/env python3
"""
YM2151 Emulator Library Builder for Windows
このスクリプトは、Nuked-OPMライブラリをローカルでビルドします
（ym2151-emu-win-binからバイナリが利用可能になるまでの暫定措置）
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import urllib.request
import zipfile
import tempfile

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent

def check_msys2():
    """MSYS2がインストールされているかチェック"""
    msys2_paths = [
        r"C:\msys64\mingw64\bin",
        r"C:\msys64\usr\bin",
    ]
    
    for path in msys2_paths:
        if Path(path).exists():
            return Path(path).parent.parent
    
    return None

def download_and_extract_nuked_opm(dest_dir: Path) -> bool:
    """Nuked-OPMをダウンロードして展開"""
    print("Downloading Nuked-OPM...")
    
    # Nuked-OPMのzipをダウンロード
    url = "https://github.com/nukeykt/Nuked-OPM/archive/refs/heads/master.zip"
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp_file:
        try:
            urllib.request.urlretrieve(url, tmp_file.name)
            print(f"✓ Downloaded to {tmp_file.name}")
            
            # 展開
            with zipfile.ZipFile(tmp_file.name, 'r') as zip_ref:
                zip_ref.extractall(dest_dir)
            
            # Nuked-OPM-master を vendor/nuked-opm にリネーム
            extracted = dest_dir / "Nuked-OPM-master"
            target = dest_dir / "nuked-opm"
            if extracted.exists():
                if target.exists():
                    shutil.rmtree(target)
                extracted.rename(target)
            
            print("✓ Extracted Nuked-OPM")
            return True
            
        except Exception as e:
            print(f"✗ Failed to download/extract: {e}")
            return False
        finally:
            try:
                os.unlink(tmp_file.name)
            except:
                pass

def build_python_dll() -> bool:
    """Python用DLLをビルド"""
    print("\n--- Building Python DLL ---")
    
    python_dir = PROJECT_ROOT / "src" / "python"
    vendor_dir = python_dir / "vendor"
    vendor_dir.mkdir(exist_ok=True)
    
    # Nuked-OPMをダウンロード
    if not (vendor_dir / "nuked-opm" / "opm.c").exists():
        if not download_and_extract_nuked_opm(vendor_dir):
            return False
    
    # MSYS2のMINGW64環境でビルド
    msys2_root = check_msys2()
    if not msys2_root:
        print("✗ MSYS2 が見つかりません")
        print("  MSYS2をインストールしてください: https://www.msys2.org/")
        return False
    
    mingw_bin = msys2_root / "mingw64" / "bin"
    gcc = mingw_bin / "gcc.exe"
    
    if not gcc.exists():
        print(f"✗ GCC が見つかりません: {gcc}")
        print("  MSYS2 MINGW64環境でmingw-w64-x86_64-gccをインストールしてください")
        print("  pacman -S mingw-w64-x86_64-gcc")
        return False
    
    # ビルドコマンド
    opm_c = vendor_dir / "nuked-opm" / "opm.c"
    output_dll = python_dir / "ym2151.dll"
    
    cmd = [
        str(gcc),
        "-shared",
        "-o", str(output_dll),
        "-static-libgcc",
        "-static-libstdc++",
        "-O3",
        str(opm_c)
    ]
    
    print(f"Running: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("✓ Build successful")
        print(f"  Output: {output_dll}")
        
        # DLL依存をチェック
        objdump = mingw_bin / "objdump.exe"
        if objdump.exists():
            print("\nChecking DLL dependencies...")
            result = subprocess.run(
                [str(objdump), "-p", str(output_dll)],
                capture_output=True,
                text=True
            )
            dll_lines = [line for line in result.stdout.split('\n') if 'dll' in line.lower() and 'DLL Name:' in line]
            for line in dll_lines:
                print(f"  {line.strip()}")
            
            # mingw DLLへの依存をチェック
            mingw_deps = [line for line in dll_lines if 'mingw' in line.lower() or 'libgcc' in line.lower() or 'libstdc++' in line.lower()]
            if mingw_deps:
                print("\n⚠ Warning: MinGW DLLへの依存が検出されました")
                for dep in mingw_deps:
                    print(f"  {dep.strip()}")
            else:
                print("\n✓ MinGW DLLに依存していません（静的リンク成功）")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"✗ Build failed: {e}")
        if e.stderr:
            print(f"  Error: {e.stderr}")
        return False

def main():
    print("=========================================")
    print("YM2151 Emulator Library Builder")
    print("=========================================")
    print()
    print("注: このスクリプトは、ym2151-emu-win-binからバイナリが")
    print("    利用可能になるまでの暫定措置です。")
    print()
    
    success = build_python_dll()
    
    print()
    print("=========================================")
    if success:
        print("ライブラリのビルドが完了しました！")
    else:
        print("ライブラリのビルドに失敗しました")
    print("=========================================")
    print()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
