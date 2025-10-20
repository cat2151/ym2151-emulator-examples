# YM2151 Emulator Library Downloader for Windows
# このスクリプトは、ym2151-emu-win-binリポジトリから必要なライブラリをダウンロードします

param(
    [string]$Language = "all"
)

$ErrorActionPreference = "Stop"

# リポジトリのベースURL
$REPO_BASE = "https://raw.githubusercontent.com/cat2151/ym2151-emu-win-bin/main/binaries"

# スクリプトのディレクトリを取得
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "YM2151 Emulator Library Downloader" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

function Download-File {
    param(
        [string]$Url,
        [string]$OutputPath
    )
    
    $dir = Split-Path -Parent $OutputPath
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    Write-Host "Downloading: $Url" -ForegroundColor Yellow
    Write-Host "         to: $OutputPath" -ForegroundColor Yellow
    
    try {
        Invoke-WebRequest -Uri $Url -OutFile $OutputPath -UseBasicParsing
        Write-Host "✓ Downloaded successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ Failed to download: $_" -ForegroundColor Red
        return $false
    }
}

function Download-PythonLibs {
    Write-Host "`n--- Python Libraries ---" -ForegroundColor Cyan
    $url = "$REPO_BASE/python/ym2151.dll"
    $dest = Join-Path $PROJECT_ROOT "src\python\ym2151.dll"
    return Download-File -Url $url -OutputPath $dest
}

function Download-RustLibs {
    Write-Host "`n--- Rust Libraries ---" -ForegroundColor Cyan
    $success = $true
    
    # 静的ライブラリ
    $url = "$REPO_BASE/rust/libym2151.a"
    $dest = Join-Path $PROJECT_ROOT "src\rust\lib\libym2151.a"
    if (!(Download-File -Url $url -OutputPath $dest)) {
        $success = $false
    }
    
    # ヘッダーファイル（必要な場合）
    $url = "$REPO_BASE/rust/opm.h"
    $dest = Join-Path $PROJECT_ROOT "src\rust\lib\opm.h"
    Download-File -Url $url -OutputPath $dest | Out-Null
    
    return $success
}

function Download-GoLibs {
    Write-Host "`n--- Go Libraries ---" -ForegroundColor Cyan
    $url = "$REPO_BASE/go/libym2151.a"
    $dest = Join-Path $PROJECT_ROOT "src\go\lib\libym2151.a"
    return Download-File -Url $url -OutputPath $dest
}

function Download-TypeScriptLibs {
    Write-Host "`n--- TypeScript/Node.js Libraries ---" -ForegroundColor Cyan
    Write-Host "TypeScript版はlibymfm.wasmを使用します（既に含まれています）" -ForegroundColor Yellow
    return $true
}

# メイン処理
$success = $true

switch ($Language.ToLower()) {
    "python" {
        if (!(Download-PythonLibs)) { $success = $false }
    }
    "rust" {
        if (!(Download-RustLibs)) { $success = $false }
    }
    "go" {
        if (!(Download-GoLibs)) { $success = $false }
    }
    "typescript" {
        if (!(Download-TypeScriptLibs)) { $success = $false }
    }
    "all" {
        if (!(Download-PythonLibs)) { $success = $false }
        if (!(Download-RustLibs)) { $success = $false }
        if (!(Download-GoLibs)) { $success = $false }
        if (!(Download-TypeScriptLibs)) { $success = $false }
    }
    default {
        Write-Host "Unknown language: $Language" -ForegroundColor Red
        Write-Host "Usage: .\download_libs.ps1 [python|rust|go|typescript|all]" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
if ($success) {
    Write-Host "ライブラリのダウンロードが完了しました！" -ForegroundColor Green
} else {
    Write-Host "一部のライブラリのダウンロードに失敗しました" -ForegroundColor Red
    Write-Host "詳細は上記のログを確認してください" -ForegroundColor Yellow
}
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if (!$success) {
    exit 1
}
