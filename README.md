# SpxOpenCode

> An opinionated fork of [OpenCode](https://github.com/anomalyco/opencode) — productivity first, compatibility always.

> **Alpha / pre-release.** Current release is `v1.0.0-rc.1`. Not production-stable. Breaking changes may occur before v1.0 final.

SpxOpenCode keeps 100% of OpenCode's behavior and adds carefully scoped DX enhancements as non-invasive plugins. You can use it as pure OpenCode today and opt into SpxOpenCode features at any time.

---

## Philosophy

- **OpenCode first.** Every SpxOpenCode feature must leave OpenCode behavior intact.
- **Productivity first.** Features that don't save time don't ship.
- **Compatibility first.** Upstream merges must remain easy.
- **Performance first.** No feature may generate constant AI calls or increase cost without justification.
- **Fun is optional.** Substance over novelty.

---

## Screenshots

> Coming soon — screenshots will be added as features stabilize.

| Feature | Preview |
|---------|---------|
| Status Bar | _(placeholder)_ |
| Accept Mode Cycle | _(placeholder)_ |
| /doctor panel | _(placeholder)_ |

---

## Current Features (v1.0-RC)

All features are implemented as plugins — zero OpenCode core modifications unless strictly necessary.

### Permission & Safety

| Feature | Keybind / Command | Description |
|---------|---------|-------------|
| **SpxAutoAccept** | `shift+tab` | Cycle between Manual / Auto / YOLO permission modes |
| **Auto allowlist** | — | Per-project `.spx/allowlist.json` patterns for AUTO mode |
| **YOLO audit log** | — | Session log of auto-approved actions in `.spx/audit/` |

### Accept Modes

| Mode | Behavior |
|------|----------|
| **Manual** | Default OpenCode behavior — prompts on every permission request |
| **Auto** | Auto-approves tools matching `.spx/allowlist.json` patterns; others require manual approval |
| **YOLO** | Auto-approves everything except dangerous patterns (`rm -rf`, `dd if=`, `mkfs`, system paths, etc.) |

### Status & Health

| Feature | Keybind / Command | Description |
|---------|---------|-------------|
| **SpxStatusBar** | — | Persistent footer: accept mode, git branch, provider count, last error |
| **SpxFallback** | — | Classifies `session.error` events into friendly, actionable notifications |
| **SpxDoctor** | `/doctor` | Health check: providers, git, MCP servers, LSP; per-provider latency |

### Skills

| Feature | Command | Description |
|---------|---------|-------------|
| **SpxSkills** | `/skill:commit` | Conventional commit message from staged diff (local git, no AI) |
| **SpxSkills** | `/skill:pr` | PR description template from git log |

### Session & Memory

| Feature | Command | Description |
|---------|---------|-------------|
| **SpxMemory** | `/recall` | Session summary saved to `.spx/memory/` at session end; loaded as context on next session |

### Configuration

| Feature | Command | Description |
|---------|---------|-------------|
| **SpxUI** | `/spx` | Shows all SpxOpenCode settings: accept mode, allowlist, skills, plugins, memory |

### Plugin System

| Feature | Description |
|---------|-------------|
| **SpxPluginHost** | Loads community `.js` plugins from `.spx/plugins/`; validates `SpxPlugin` shape |
| **`SpxApi` interface** | Stable subset of `TuiPluginApi` guaranteed for third-party plugins |
| **`defineSpxPlugin`** | Type-safe helper for community plugin authors |

### macOS Shortcuts

| Shortcut | Action |
|----------|--------|
| `cmd+k` | Clear current line |
| `cmd+p` | Session list |
| `cmd+n` | New session |
| `cmd+m` | Toggle sidebar |
| `cmd+enter` | Submit message |

---

## Planned

- SpxSkills v2 — community-contributed skill files (contributions welcome)
- Consider upstreaming SpxStatusBar and SpxFallback to OpenCode

---

## Installation

### Quick Install

**macOS / Linux**
```bash
curl -fsSL https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.sh | bash
```

**Windows (PowerShell)**
```powershell
irm https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.ps1 | iex
```

Both scripts:
- Clone the repo to `~/.spxopencode/src` (macOS/Linux) or `%USERPROFILE%\.spxopencode\src` (Windows)
- Install dependencies with Bun
- Create a `spxopencode` command (and `spx` alias) in `~/.spxopencode/bin`
- Add that directory to your PATH (skip with `--no-modify-path` / `-NoModifyPath`)

**Requirements:** [git](https://git-scm.com) and [bun](https://bun.sh) (>= 1.3.14).

See [docs/installation.md](docs/installation.md) for the full guide including troubleshooting.

### Update

Re-run the install command — it pulls the latest source and re-installs.

### Uninstall

```bash
rm -rf ~/.spxopencode
```

Then remove the `export PATH=...` line from your shell config.

---

## Disable individual plugins

SpxOpenCode features are active by default. To disable any plugin, edit `packages/tui/src/feature-plugins/builtins.ts` and set `enabled: false` on the plugin entry:

```ts
// disable a single plugin
{ ...SpxStatusBar, enabled: false },

// disable all spx plugins (returns vanilla OpenCode behavior)
{ ...SpxStatusBar,    enabled: false },
{ ...SpxAutoAccept,   enabled: false },
{ ...SpxFallback,     enabled: false },
{ ...SpxDoctor,       enabled: false },
{ ...SpxSkills,       enabled: false },
{ ...SpxMemory,       enabled: false },
{ ...SpxPluginHost,   enabled: false },
{ ...SpxUi,           enabled: false },
```

After editing, rebuild: `bun run build` (or `bun run dev` to run immediately).

| Import | Plugin ID | Description |
|--------|-----------|-------------|
| `SpxStatusBar` | `spx:status-bar` | Persistent footer bar (accept mode, git branch, providers) |
| `SpxAutoAccept` | `spx:auto-accept` | `shift+tab` accept-mode cycling |
| `SpxFallback` | `spx:fallback` | Friendly error notifications |
| `SpxDoctor` | `spx:doctor` | `/doctor` health-check slash command |
| `SpxSkills` | `spx:skills` | `/skill:commit` and `/skill:pr` slash commands |
| `SpxMemory` | `spx:memory` | Session summary save/load |
| `SpxPluginHost` | `spx:plugin-host` | Community plugin loader |
| `SpxUi` | `spx:ui` | `/spx` config panel |

---

## Development

```bash
git clone https://github.com/spxmiguel/SpxOpenCode.git
cd SpxOpenCode
bun install
bun run dev
```

```bash
# Type check
pnpm typecheck

# Run SPX unit tests
cd packages/tui && bun test

# Lint (non-blocking)
pnpm lint
```

SpxOpenCode-specific code lives in:

```
packages/tui/src/feature-plugins/spx/   # All SPX TUI plugins
spx/skills/                              # Per-project skill files (user-created)
docs/                                    # Documentation
scripts/                                 # Install scripts
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

All new SpxOpenCode functionality must:
1. Be implemented as a plugin in `packages/tui/src/feature-plugins/spx/`
2. Leave OpenCode core behavior intact
3. Not generate constant AI calls
4. Be disableable via config

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full versioned plan.

---

## License

MIT — see [LICENSE](LICENSE).

SpxOpenCode is a fork of [OpenCode](https://github.com/anomalyco/opencode), which is also MIT licensed.
