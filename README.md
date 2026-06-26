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

SpxOpenCode is a source fork — install the same way as OpenCode:

```bash
# Clone SpxOpenCode
git clone https://github.com/spxmiguel/SpxOpenCode.git
cd SpxOpenCode

# Install dependencies (requires Bun >= 1.3.14)
bun install

# Build
bun run build

# Run
bun run dev
```

SpxOpenCode features are active by default. You can disable individual SpxOpenCode plugins without uninstalling the fork — OpenCode continues to work fully with all spx plugins disabled.

### Disabling SpxOpenCode features

Each built-in plugin entry in `packages/tui/src/feature-plugins/builtins.ts` supports an `enabled` field. Set it to `false` to disable that plugin:

```ts
// packages/tui/src/feature-plugins/builtins.ts

export function createBuiltinPlugins(options: { experimentalEventSystem: boolean }): BuiltinTuiPlugin[] {
  return [
    HomeFooter,
    HomeTips,
    SidebarContext,
    SidebarMcp,
    SidebarLsp,
    SidebarTodo,
    SidebarFiles,
    SidebarFooter,
    Notifications,
    PluginManager,
    WhichKey,
    DiffViewer,
    { ...SpxStatusBar, enabled: false },   // disables spx:status-bar
    SpxAutoAccept,
    SpxFallback,
    SpxDoctor,
  ]
}
```

The four SpxOpenCode plugins are:

| Import | Plugin ID | What it does |
|--------|-----------|--------------|
| `SpxStatusBar` | `spx:status-bar` | Persistent footer bar with accept mode, git branch, provider count |
| `SpxAutoAccept` | `spx:auto-accept` | `shift+tab` accept-mode cycling (Manual / Auto / YOLO) |
| `SpxFallback` | `spx:fallback` | Friendly error notifications for session errors |
| `SpxDoctor` | `spx:doctor` | `/doctor` health-check slash command |

To disable all SpxOpenCode plugins at once:

```ts
    { ...SpxStatusBar,  enabled: false },
    { ...SpxAutoAccept, enabled: false },
    { ...SpxFallback,   enabled: false },
    { ...SpxDoctor,     enabled: false },
```

After editing, rebuild and run:

```bash
bun run build   # or: bun run dev
```

> **Note:** Disabling SpxOpenCode plugins does **not** require uninstalling the fork. OpenCode works fully with all spx plugins disabled — you simply get vanilla OpenCode behavior.

---

## Development

```bash
# Watch mode
bun run dev

# Type check
bun run tsc --noEmit

# Run tests
bun test
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
