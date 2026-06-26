# SpxOpenCode Shortcuts & Safety Reference

## macOS Shortcuts

These shortcuts use the `super` modifier (Cmd on macOS, Win on Windows/Linux).
They are additive — original bindings still work.

| Action | macOS Shortcut | Original Binding |
|--------|---------------|-----------------|
| Copy message | `Cmd+C` | `<leader>y` |
| Paste | `Cmd+V` | `Ctrl+V` |
| Select all | `Cmd+A` | — |
| Undo | `Cmd+Z` | `Ctrl+-` |
| Redo | `Cmd+Shift+Z` | `Ctrl+.` |
| Clear line | `Cmd+K` | `Ctrl+K` |
| Session list | `Cmd+L` | `<leader>l` |
| Submit | `Cmd+Enter` | `Enter` |

> **Ctrl+C** is NOT remapped — it still interrupts the running process.
> **Ctrl+D** is NOT remapped — it still sends EOF / exits.

## Accept Mode (Shift+Tab)

Press `Shift+Tab` to cycle through permission modes:

| Mode | Behavior | Status Bar |
|------|----------|------------|
| **MANUAL** | Prompts for every tool call (default) | `● manual` (muted) |
| **AUTO** | Approves each call once without prompting | `● auto` (green) |
| **YOLO** | Approves all calls permanently — but blocks dangerous commands | `● YOLO` (red) |

Mode is persisted across sessions via `kv` storage.

## YOLO Safety Rules

YOLO mode auto-approves tool calls but blocks patterns that could cause irreversible damage.

### Blocked on all platforms
- `rm -r` / `rm -rf` variants
- Any invocation of `sudo`
- `mkfs`, `fdisk`, `parted`, `shred`, `wipefs` (disk operations)
- `dd if=` (raw device write)
- Writes to `/dev/` via `>>` or `: >`
- Paths: `/etc/`, `/usr/`, `/bin/`, `/boot/`, `/dev/`, `/proc/`, `/sys/`, `/lib/`

### Blocked on Windows
- `del /s`, `del /q`, `del /f`
- `rmdir /s`, `rmdir /q`, `rd /s`, `rd /q`
- `diskpart`
- `format X:`
- Paths: `C:\Windows\`, `C:\System32\`, `C:\Program Files\`

### Blocked on macOS
- Paths: `/System/`, `/Library/`

When a dangerous command is blocked, YOLO rejects the tool call and shows a toast notification. The session continues — the AI must try a safer approach.

## SpxStatusBar Fields

The status bar appears at the bottom of every screen.

```
● manual  ⎇ main  ⚠ Rate limited          2 providers
```

| Field | When shown | Color |
|-------|-----------|-------|
| Accept mode (`● manual/auto/YOLO`) | Always | muted / green / red |
| Git branch (`⎇ branch`) | When inside a git repo | muted |
| Last error (`⚠ message`) | After a provider error (clears in 30s) | red |
| Provider count | Always | muted (or red if 0 providers) |

When no providers are configured, the count shows `no providers` in red — run `:doctor` to diagnose.

## Running CI Locally

```bash
# Typecheck
cd packages/tui
bun run typecheck

# Tests
bun test

# Lint (non-blocking)
bun run lint
```

The full CI pipeline (`.github/workflows/spx-ci.yml`) runs typecheck, lint, and tests on every PR that touches SPX plugin files.
