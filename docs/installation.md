# Installation — SpxOpenCode

> **Alpha notice:** SpxOpenCode has no published binaries yet. All install paths use source + Bun. This will update automatically when binary releases land.

---

## Quick Install (recommended)

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.sh | bash
```

Skip PATH modification:

```bash
curl -fsSL https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.sh | bash -s -- --no-modify-path
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.ps1 | iex
```

Skip PATH modification:

```powershell
irm https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.ps1 | iex; & { . { iex (irm https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.ps1) } -NoModifyPath }
```

Or download the script and pass the flag:

```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.ps1 -OutFile install.ps1
.\install.ps1 -NoModifyPath
```

---

## What the installer does

1. Checks for `git` and `bun` (both required)
2. Clones the repo to `~/.spxopencode/src` (or pulls if already cloned)
3. Runs `bun install --frozen-lockfile`
4. Creates wrapper scripts in `~/.spxopencode/bin/`:
   - `spxopencode` — main command
   - `spx` — alias
5. Adds `~/.spxopencode/bin` to your PATH (shell config or Windows user PATH)

The wrapper runs SpxOpenCode from source via Bun:

```bash
exec bun run --conditions=browser ~/.spxopencode/src/packages/opencode/src/index.ts "$@"
```

No build step, no compiled binary. Starts immediately after install.

---

## Requirements

| Requirement | Version | Install |
|------------|---------|---------|
| git | any | [git-scm.com](https://git-scm.com) |
| bun | >= 1.3.14 | `curl -fsSL https://bun.sh/install \| bash` |

---

## Supported platforms

| Platform | Architecture | Status |
|----------|-------------|--------|
| macOS | arm64 (Apple Silicon) | Supported |
| macOS | x64 (Intel) | Supported |
| Linux | x64 | Supported |
| Windows | x64 | Supported (PowerShell) |

---

## Update

Re-run the install command. The script pulls the latest source with `git pull --ff-only` and re-installs dependencies.

```bash
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.sh | bash

# Windows
irm https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.ps1 | iex
```

---

## Uninstall

**macOS / Linux:**

```bash
rm -rf ~/.spxopencode
```

Then remove the PATH line from your shell config (`~/.zshrc`, `~/.bashrc`, etc.):

```bash
# Remove the line that looks like:
export PATH="$HOME/.spxopencode/bin:$PATH"
```

**Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.spxopencode"
```

Then remove `%USERPROFILE%\.spxopencode\bin` from your user PATH via System Settings → Environment Variables, or:

```powershell
$current = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPath = ($current -split ";" | Where-Object { $_ -notlike "*\.spxopencode\bin*" }) -join ";"
[Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
```

---

## Manual install (dev/local)

For development or if you prefer full control:

```bash
git clone https://github.com/spxmiguel/SpxOpenCode.git
cd SpxOpenCode
bun install
bun run dev
```

To run without the installer wrapper:

```bash
bun run --conditions=browser packages/opencode/src/index.ts
```

---

## Troubleshooting

### `spxopencode: command not found` after install

The bin dir was not added to your PATH or the shell hasn't reloaded. Fix:

```bash
export PATH="$HOME/.spxopencode/bin:$PATH"
```

Add that line to `~/.zshrc` or `~/.bashrc` for persistence, then `source ~/.zshrc`.

### `bun: command not found`

Install bun first:

```bash
curl -fsSL https://bun.sh/install | bash
```

### `git: command not found`

Install git from [git-scm.com](https://git-scm.com).

### `error: Your local changes...` during update

The installer uses `git pull --ff-only`. If you have local modifications in `~/.spxopencode/src`, stash or reset them:

```bash
git -C ~/.spxopencode/src stash
```

### bun install fails with lockfile error

The repo may have updated dependencies since your last install. Remove the lockfile and retry:

```bash
rm ~/.spxopencode/src/bun.lockb
cd ~/.spxopencode/src && bun install
```

### Windows: execution policy error

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Current limitations (alpha)

- **No compiled binary** — runs from source via `bun run`. Startup is slightly slower than a compiled binary but functional.
- **Bun required at runtime** — unlike a compiled binary, Bun must remain installed after SpxOpenCode is installed.
- **No auto-update** — re-run the install command to update.
- **Windows PATH** requires terminal restart to take effect.

These limitations will be resolved when binary releases are published.

---

## See also

- [Getting started](getting-started.md)
- [FAQ](faq.md)
- [Roadmap](roadmap.md)
