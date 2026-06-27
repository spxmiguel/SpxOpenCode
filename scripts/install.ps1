# SpxOpenCode Installer for Windows (PowerShell)
#
# NOTE: SpxOpenCode has no published binaries yet. This script installs
# from source using git + bun. When binary releases are available this
# script will offer a faster download path automatically.
#
# Usage:
#   irm https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.ps1 | iex
#   irm https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.ps1 | iex -NoModifyPath

[CmdletBinding()]
param(
    [switch]$NoModifyPath,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

$REPO    = "https://github.com/spxmiguel/SpxOpenCode.git"
$InstallDir = Join-Path $env:USERPROFILE ".spxopencode"
$BinDir     = Join-Path $InstallDir "bin"
$SrcDir     = Join-Path $InstallDir "src"

function Write-Alpha {
    Write-Host ""
    Write-Host "WARNING: SpxOpenCode is in alpha - expect breaking changes." -ForegroundColor Yellow
    Write-Host ""
}

function Show-Usage {
    Write-Host @"
SpxOpenCode Installer (alpha) - Windows

Usage:
    irm https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.ps1 | iex

Parameters:
    -NoModifyPath    Don't add to PATH
    -Help            Show this help

Alpha notice: no compiled binaries are published yet. Installs from source.
Requires: git. bun is auto-installed if missing (via winget, scoop, or bun.sh installer).
"@
}

if ($Help) {
    Show-Usage
    exit 0
}

Write-Alpha

# Auto-install bun if missing
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "bun not found — installing..." -ForegroundColor Yellow
    $installed = $false
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install --id Oven-sh.Bun --silent --accept-source-agreements --accept-package-agreements
        $installed = $true
    } elseif (Get-Command scoop -ErrorAction SilentlyContinue) {
        scoop install bun
        $installed = $true
    }
    if (-not $installed) {
        # Fallback: official PowerShell installer
        Invoke-RestMethod https://bun.sh/install.ps1 | Invoke-Expression
    }
    # Refresh PATH so bun is available now
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
        Write-Host "Error: bun install failed. Install manually: https://bun.sh" -ForegroundColor Red
        exit 1
    }
    Write-Host "bun installed." -ForegroundColor Green
}

# Dependency checks
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: 'git' is required but not installed." -ForegroundColor Red
    Write-Host "Install git: https://git-scm.com/download/win" -ForegroundColor Gray
    exit 1
}

# Create directories
New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

# Clone or update source
if (Test-Path (Join-Path $SrcDir ".git")) {
    Write-Host "Updating SpxOpenCode source..." -ForegroundColor Gray
    git -C $SrcDir pull --ff-only --quiet
} else {
    Write-Host "Cloning SpxOpenCode..." -ForegroundColor Gray
    git clone --depth 1 --quiet $REPO $SrcDir
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Gray
Push-Location $SrcDir
try {
    bun install --frozen-lockfile --silent
} finally {
    Pop-Location
}

# Create wrapper script (batch file for Windows PATH compatibility)
# Entry point: packages/opencode/src/index.ts
$WrapperBat = Join-Path $BinDir "spxopencode.cmd"
@"
@echo off
bun run --conditions=browser "$SrcDir\packages\opencode\src\index.ts" %*
"@ | Set-Content -Path $WrapperBat -Encoding ASCII

# Create spx alias
$SpxBat = Join-Path $BinDir "spx.cmd"
@"
@echo off
bun run --conditions=browser "$SrcDir\packages\opencode\src\index.ts" %*
"@ | Set-Content -Path $SpxBat -Encoding ASCII

# PATH management
if (-not $NoModifyPath) {
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($currentPath -notlike "*$BinDir*") {
        [Environment]::SetEnvironmentVariable("PATH", "$BinDir;$currentPath", "User")
        Write-Host "Added $BinDir to user PATH." -ForegroundColor Gray
        Write-Host "Restart your terminal to use spxopencode." -ForegroundColor Gray
    } else {
        Write-Host "PATH already contains $BinDir, skipping." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "SpxOpenCode installed." -ForegroundColor Green
Write-Host ""
Write-Host "  Command:  spxopencode" -ForegroundColor Gray
Write-Host "  Alias:    spx" -ForegroundColor Gray
Write-Host "  Source:   $SrcDir" -ForegroundColor Gray
Write-Host "  Bin:      $BinDir" -ForegroundColor Gray
Write-Host ""
Write-Host "To update:" -ForegroundColor Gray
Write-Host "  irm https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.ps1 | iex" -ForegroundColor Gray
Write-Host ""
Write-Host "To uninstall:" -ForegroundColor Gray
Write-Host "  Remove-Item -Recurse -Force $InstallDir" -ForegroundColor Gray
Write-Host ""
