# SpxOpenCode Architecture

## Overview

SpxOpenCode is a fork of OpenCode. It extends OpenCode by adding plugins through OpenCode's existing `BuiltinTuiPlugin` system. The goal is to keep all SpxOpenCode code isolated in dedicated files, making upstream merges as clean as possible.

---

## Repository Structure

```
SpxOpenCode/
├── packages/                          # OpenCode monorepo packages (upstream owned)
│   ├── tui/
│   │   └── src/
│   │       ├── feature-plugins/
│   │       │   ├── spx/               # SpxOpenCode TUI plugins ← our code
│   │       │   │   ├── accept-mode-store.ts
│   │       │   │   ├── auto-accept.ts
│   │       │   │   ├── doctor.ts
│   │       │   │   ├── fallback.ts
│   │       │   │   └── status-bar.tsx
│   │       │   └── builtins.ts        # Modified: adds spx plugins to builtin list
│   │       └── config/
│   │           └── keybind.ts         # Modified: adds spx_accept_cycle binding
│   └── ...                            # All other packages — untouched
├── spx/                               # Future SpxOpenCode modules
│   ├── plugins/
│   ├── core/
│   ├── ui/
│   ├── doctor/
│   ├── skills/
│   ├── office/
│   ├── companions/
│   ├── providers/
│   └── config/
├── docs/                              # Extended documentation
├── assets/                            # Screenshots, logos
├── README.md
├── ROADMAP.md
├── FEATURES.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
└── LICENSE
```

---

## OpenCode Plugin System

SpxOpenCode uses OpenCode's `BuiltinTuiPlugin` interface:

```typescript
type BuiltinTuiPlugin = {
  id: string          // e.g. "spx:status-bar"
  tui: TuiPlugin      // async (api, options, meta) => void
  enabled?: boolean
}
```

Plugins are registered in `packages/tui/src/feature-plugins/builtins.ts` via `createBuiltinPlugins()`.

### TuiPlugin API Surface Used by SpxOpenCode

| API | Used by | Purpose |
|-----|---------|---------|
| `api.slots.register` | SpxStatusBar | Mount JSX into `home_footer` slot |
| `api.keymap.registerLayer` | SpxAutoAccept | Register `spx.accept.cycle` command with keybind |
| `api.tuiConfig.keybinds.gather` | SpxAutoAccept | Wire keybind.ts entry to layer |
| `api.kv.get/set` | SpxAutoAccept | Persist accept mode across sessions |
| `api.event.on` | SpxAutoAccept, SpxFallback | Listen to `permission.asked`, `session.error` |
| `api.client.permission.reply` | SpxAutoAccept | Auto-reply to permission requests |
| `api.attention.notify` | SpxFallback, SpxDoctor | Display notifications |
| `api.command!.register` | SpxDoctor | Register `/doctor` slash command (legacy API) |
| `api.state.vcs` | SpxStatusBar, SpxDoctor | Git branch info |
| `api.state.provider` | SpxStatusBar, SpxDoctor | Provider list |
| `api.state.mcp()` | SpxDoctor | MCP server states |
| `api.state.lsp()` | SpxDoctor | LSP server states |
| `api.theme.current` | SpxStatusBar | Current theme for color access |
| `api.ui.toast` | SpxAutoAccept | Show toast on mode cycle |

---

## Cross-Plugin State

OpenCode's `api.kv` is not reactive. For reactive shared state between plugins, SpxOpenCode uses a module-level SolidJS signal:

```
accept-mode-store.ts
  ↕ writes
auto-accept.ts  →  SpxAutoAccept (writes acceptMode signal on cycle)
  ↕ reads
status-bar.tsx  →  SpxStatusBar (reads acceptMode() for reactive display)
```

The signal is initialized from `api.kv` when `SpxAutoAccept` loads. `SpxStatusBar` reads it reactively via SolidJS's tracking system.

---

## OpenCode Files Modified by SpxOpenCode

Only two OpenCode-owned files are modified. Both changes are additive (no deletions of existing behavior):

| File | Change |
|------|--------|
| `packages/tui/src/feature-plugins/builtins.ts` | Added 4 imports + 4 array entries in `createBuiltinPlugins` |
| `packages/tui/src/config/keybind.ts` | Moved `agent_cycle_reverse` from `shift+tab` to `<leader>A`; added `spx_accept_cycle` with `shift+tab` |

---

## Slash Command Registration

OpenCode has two command registration APIs:

1. **`api.keymap.registerLayer`** — registers TUI commands with keybinds. Supports `name`/`run` shape. Does **not** support slash commands.
2. **`api.command!.register(cb)` (legacy)** — registers slash commands via `TuiCommand[]` with `slash: { name, aliases? }` shape.

SpxOpenCode uses both:
- `SpxAutoAccept` uses `registerLayer` for the `shift+tab` keybind
- `SpxDoctor` uses the legacy `api.command!.register` for `/doctor`

---

## Upstream Sync Strategy

SpxOpenCode maintains a conceptual separation between:
- **Upstream** (`https://github.com/anomalyco/opencode`) — all files except those listed above
- **SpxOpenCode** — `packages/tui/src/feature-plugins/spx/`, `spx/`, root docs, and minimal diffs in `builtins.ts` + `keybind.ts`

When pulling upstream changes:
1. Merge or rebase onto latest upstream `main`
2. Resolve conflicts in `builtins.ts` and `keybind.ts` manually (always additive — keep our entries)
3. `spx/` directory has no upstream counterpart — no conflicts expected there
