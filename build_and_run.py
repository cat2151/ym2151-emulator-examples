#!/usr/bin/env python3
"""
build_and_run.py
このscriptはすべてのym2151-emulator-examplesアプリをビルドし、一つずつ実行できるようにします。
用途：物理スピーカーでの人力テストを効率化します。
Windows専用です。
"""

import os
import subprocess
from pathlib import Path


class Colors:
    """ANSI color codes for terminal output"""

    RED = "\033[0;31m"
    GREEN = "\033[0;32m"
    YELLOW = "\033[1;33m"
    BLUE = "\033[0;34m"
    NC = "\033[0m"  # No Color


def log_info(message: str) -> None:
    """Print info message"""
    print(f"{Colors.BLUE}[INFO]{Colors.NC} {message}")


def log_success(message: str) -> None:
    """Print success message"""
    print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {message}")


def log_warning(message: str) -> None:
    """Print warning message"""
    print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {message}")


def log_error(message: str) -> None:
    """Print error message"""
    print(f"{Colors.RED}[ERROR]{Colors.NC} {message}")


def command_exists(command: str) -> bool:
    """Check if a command exists in PATH"""
    try:
        subprocess.run(
            [command, "--version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        return True
    except FileNotFoundError:
        return False


def build_python(script_dir: Path) -> None:
    """Build/check Python dependencies"""
    log_info("[1/4] Python版の依存関係チェック...")

    if not command_exists("python"):
        log_warning("Pythonが見つかりません。Python版はスキップします。")
        return

    python_dir = script_dir / "src" / "python"

    try:
        # Check if required packages are installed
        result = subprocess.run(
            ["pip", "list"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False,
        )

        if "sounddevice" not in result.stdout:
            log_warning("Python版: sounddeviceがインストールされていません")
            log_info("インストール中: pip install -r requirements.txt")
            subprocess.run(
                ["pip", "install", "-r", "requirements.txt"],
                cwd=python_dir,
                check=False,
            )
        else:
            log_success("Python版: 準備完了")
    except Exception as e:
        log_error(f"Python版の依存関係チェックに失敗しました: {e}")


def build_rust(script_dir: Path) -> None:
    """Build Rust version"""
    log_info("[2/4] Rust版をビルド中...")

    if not command_exists("cargo"):
        log_warning("cargoが見つかりません。Rust版はスキップします。")
        return

    rust_dir = script_dir / "src" / "rust"
    result = subprocess.run(["cargo", "build", "--release"], cwd=rust_dir, check=False)

    if result.returncode == 0:
        log_success("Rust版: ビルド完了")
    else:
        log_error("Rust版のビルドに失敗しました")


def build_go(script_dir: Path) -> None:
    """Build Go version"""
    log_info("[3/4] Go版をビルド中...")

    if not command_exists("go"):
        log_warning("goが見つかりません。Go版はスキップします。")
        return

    go_dir = script_dir / "src" / "go"
    
    # Set environment for Windows cross-compilation
    env = os.environ.copy()
    env["CGO_ENABLED"] = "1"
    
    result = subprocess.run(
        ["go", "build", "-o", "ym2151-example.exe", "main.go"],
        cwd=go_dir,
        env=env,
        check=False,
    )

    if result.returncode == 0:
        log_success("Go版: ビルド完了")
    else:
        log_error("Go版のビルドに失敗しました")


def build_typescript(script_dir: Path) -> None:
    """Build TypeScript/Node.js version"""
    log_info("[4/4] TypeScript/Node.js版をビルド中...")

    if not command_exists("npm"):
        log_warning("npmが見つかりません。TypeScript版はスキップします。")
        return

    ts_dir = script_dir / "src" / "typescript_deno"
    node_modules = ts_dir / "node_modules"

    if not node_modules.exists():
        log_info("依存関係をインストール中...")
        subprocess.run(["npm", "install"], cwd=ts_dir, check=False)

    result = subprocess.run(["npm", "run", "build"], cwd=ts_dir, check=False)

    if result.returncode == 0:
        log_success("TypeScript/Node.js版: ビルド完了")
    else:
        log_error("TypeScript/Node.js版のビルドに失敗しました")


def build_all(script_dir: Path) -> None:
    """Build all applications"""
    print("=" * 50)
    print("  YM2151 Emulator Examples ビルド＆実行")
    print("=" * 50)
    print()

    log_info("ビルドを開始します...")
    print()

    build_python(script_dir)
    print()

    build_rust(script_dir)
    print()

    build_go(script_dir)
    print()

    build_typescript(script_dir)
    print()

    log_success("全てのビルドが完了しました！")
    print()


def show_menu() -> None:
    """Display the application selection menu"""
    print("=" * 50)
    print("  実行するアプリを選択してください")
    print("=" * 50)
    print()
    print("Python版:")
    print("  1) main.py         - YM2151エミュレータ（Nuked-OPM + sounddevice）")
    print()
    print("Rust版:")
    print("  2) ym2151-example  - YM2151エミュレータ（Nuked-OPM + cpal）")
    print()
    print("Go版:")
    print("  3) ym2151-example  - YM2151エミュレータ（Nuked-OPM + PortAudio）")
    print()
    print("TypeScript/Node.js版:")
    print("  4) index.js        - YM2151エミュレータ（libymfm.wasm + speaker）")
    print()
    print("  0) 終了")
    print()


def run_application(choice: str, script_dir: Path) -> bool:
    """Run the selected application. Returns False if should exit."""
    try:
        if choice == "1":
            log_info("Python main.py を起動します...")
            print("440HzのA4音が3秒間再生されます。")
            subprocess.run(["python", "main.py"], cwd=script_dir / "src" / "python", check=False)

        elif choice == "2":
            log_info("Rust ym2151-example を起動します...")
            print("440HzのA4音が3秒間再生されます。")
            exe_path = script_dir / "src" / "rust" / "target" / "release" / "ym2151-example.exe"
            if not exe_path.exists():
                log_error(f"実行ファイルが見つかりません: {exe_path}")
                log_info("Rust版をビルドしてください。")
            else:
                subprocess.run([str(exe_path)], cwd=script_dir, check=False)

        elif choice == "3":
            log_info("Go ym2151-example を起動します...")
            print("440HzのA4音が2秒間再生されます。")
            exe_path = script_dir / "src" / "go" / "ym2151-example.exe"
            if not exe_path.exists():
                log_error(f"実行ファイルが見つかりません: {exe_path}")
                log_info("Go版をビルドしてください。")
            else:
                subprocess.run([str(exe_path)], cwd=script_dir, check=False)

        elif choice == "4":
            log_info("TypeScript/Node.js index.js を起動します...")
            print("440HzのA4音が3秒間再生されます。")
            ts_dir = script_dir / "src" / "typescript_deno"
            dist_file = ts_dir / "dist" / "index.js"
            if not dist_file.exists():
                log_error(f"ビルド済みファイルが見つかりません: {dist_file}")
                log_info("TypeScript版をビルドしてください。")
            else:
                subprocess.run(["npm", "start"], cwd=ts_dir, check=False)

        elif choice == "0":
            log_info("終了します。")
            return False

        else:
            log_error("無効な選択です。0-4の数字を入力してください。")
            return True

        print()
        print("アプリが終了しました。")
        print()
        return True

    except KeyboardInterrupt:
        print()
        print("アプリが終了しました。")
        print()
        return True
    except Exception as e:
        log_error(f"実行中にエラーが発生しました: {e}")
        print()
        return True


def main() -> None:
    """Main function"""
    # Get script directory
    script_dir = Path(__file__).parent.resolve()
    os.chdir(script_dir)

    # Build all applications
    build_all(script_dir)

    # Interactive menu loop
    while True:
        show_menu()
        try:
            choice = input("選択してください [0-4]: ").strip()
            if not run_application(choice, script_dir):
                break
        except KeyboardInterrupt:
            print()
            log_info("終了します。")
            break
        except EOFError:
            print()
            log_info("終了します。")
            break


if __name__ == "__main__":
    main()
