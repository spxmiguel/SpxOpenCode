# SpxOpenCode

> An opinionated fork of [OpenCode](https://github.com/anomalyco/opencode) — productivity first, compatibility always.

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

## Current Features (v0.1)

All features are implemented as plugins — zero OpenCode core modifications unless strictly necessary.

| Feature | Keybind | Description |
|---------|---------|-------------|
| **SpxStatusBar** | — | Persistent footer bar: accept mode indicator, git branch, provider count |
| **SpxAutoAccept** | `shift+tab` | Cycle between Manual / Auto / YOLO permission modes |
| **SpxFallback** | — | Classifies `session.error` events into friendly, actionable notifications |
| **SpxDoctor** | `/doctor` | Slash command: health check for providers, git, MCP servers, LSP |

### Accept Modes

| Mode | Behavior |
|------|----------|
| **Manual** | Default OpenCode behavior — prompts on every permission request |
| **Auto** | Auto-approves all commands with `once` scope (no persistent grants) |
| **YOLO** | Auto-approves with `always` scope, but **blocks dangerous patterns** (`rm -rf`, `dd if=`, `mkfs`, etc.) |

---

## Planned Features

See [ROADMAP.md](ROADMAP.md) for full versioned roadmap.

- `v0.2` — Mac Shortcuts (super key support), enhanced status bar metrics
- `v0.3` — SpxOffice (document-aware context), SpxSkills (reusable slash command library)
- `v0.5` — SpxAuto virtual provider, SpxCompanions (persistent AI sub-agents)
- `v1.0` — SpxUI polish, full configuration UI, stable plugin API

---

## Installation

> **Alpha:** SpxOpenCode has no published binaries yet. The scripts below install from source and will automatically switch to binary downloads once releases are available.

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

**Requirements:** [git](https://git-scm.com). The install scripts handle everything else (including runtime dependencies) automatically.

### Update

Re-run the install command — it pulls the latest source and re-installs.

### Uninstall

```bash
rm -rf ~/.spxopencode
```

Then remove the `export PATH=...` line from your shell config.

### Manual / Dev Install

```bash
git clone https://github.com/spxmiguel/SpxOpenCode.git
cd SpxOpenCode
npm install
npm run dev
```

> Dev builds require [bun](https://bun.sh) (>= 1.3.14). Install it with `npm install -g bun` or via [brew](https://brew.sh): `brew install bun`.

See [docs/installation.md](docs/installation.md) for the full guide including troubleshooting.

---

SpxOpenCode features are active by default. To use as vanilla OpenCode, disable spx plugins in your config:

```json
{
  "plugins": {
    "spx:status-bar": { "enabled": false },
    "spx:auto-accept": { "enabled": false },
    "spx:fallback": { "enabled": false },
    "spx:doctor": { "enabled": false }
  }
}
```

---

## Development

```bash
# Watch mode
npm run dev

# Type check
npm run typecheck

# Run SPX tests
cd packages/tui && npx bun test
```

SpxOpenCode-specific code lives in:

```
packages/tui/src/feature-plugins/spx/   # TUI plugins (current)
spx/                                      # Future modules
  plugins/     # Plugin definitions
  core/        # Shared SpxOpenCode core utilities
  ui/          # UI components
  doctor/      # Health check logic
  skills/      # Slash command library
  office/      # Document context
  companions/  # Persistent AI sub-agents
  providers/   # Custom AI providers
  config/      # SpxOpenCode configuration
docs/          # Documentation
assets/        # Static assets
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

All new SpxOpenCode functionality must:
1. Be implemented as a plugin in `packages/tui/src/feature-plugins/spx/` (or future `spx/` modules)
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
