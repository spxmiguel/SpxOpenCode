# Getting Started with SpxOpenCode

## Prerequisites

- [Bun](https://bun.sh) v1.3.14+
- Node.js 20+ (for some dev tooling)
- Git

## Installation

SpxOpenCode is a fork of OpenCode. Install it the same way you would install OpenCode from source.

```bash
git clone https://github.com/spxmiguel/SpxOpenCode.git
cd SpxOpenCode
bun install
bun run build
```

## Running

```bash
bun run start
```

Or from any directory after a global link:

```bash
bun link
spxopencode
```

## First launch

On first run, SpxOpenCode asks you to configure a provider (same as OpenCode). Add your API key for any supported provider.

SpxOpenCode adds four features on top of OpenCode:

| Feature | Default | Keybind |
|---------|---------|---------|
| Status bar | Enabled | — |
| Auto-accept cycling | Enabled | `shift+tab` / `<leader>A` |
| Fallback handler | Enabled | — |
| Doctor | Enabled | `:doctor` |

All four can be disabled by setting `enabled: false` in their plugin registration inside `builtins.ts`.

## Key concepts

### Accept modes

SpxOpenCode adds three accept modes on top of OpenCode's default behavior:

- **MANUAL** (default) — same as vanilla OpenCode, approve each action
- **AUTO** — auto-approve tool use matching a configured allowlist
- **YOLO** — approve everything (use carefully)

Cycle forward: `shift+tab`. Cycle backward: `<leader>A`.

The current mode is visible in the status bar at the bottom of the screen.

### Status bar

Bottom line of the TUI. Shows:
- Current accept mode (color-coded: blue=MANUAL, green=AUTO, red=YOLO)
- Git branch
- Active provider count
- SpxOpenCode version

### Doctor

Run `:doctor` in the chat input to get a health report. Doctor checks:
- Configuration files
- Provider connectivity
- Keybind registration
- Plugin state

### Fallback handler

When a provider fails, SpxOpenCode shows a classified error (rate limit / auth / network / model) instead of a raw stack trace, and suggests what to do next.

## Disabling SpxOpenCode features

SpxOpenCode is designed to degrade gracefully. To disable any plugin, open `packages/tui/src/feature-plugins/builtins.ts` and set `enabled: false` for that plugin's entry.

To use SpxOpenCode as pure OpenCode with no SPX features, disable all four plugins.

## Updating from upstream

```bash
git remote add upstream https://github.com/anomalyco/opencode.git
git fetch upstream
git merge upstream/main
```

Conflicts will only appear in `builtins.ts` and `keybind.ts`. Both are additive changes — resolve by keeping both the upstream changes and the SPX additions.
