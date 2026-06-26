# SpxOpenCode Features

Full feature reference for all SpxOpenCode plugins and modules.

---

## v0.1 Features

### SpxStatusBar

**Plugin ID:** `spx:status-bar`
**File:** `packages/tui/src/feature-plugins/spx/status-bar.tsx`
**Slot:** `home_footer` (order 200, below OpenCode footer)

Renders a persistent one-line status bar at the bottom of the home screen.

**Content:**
| Segment | Source | Description |
|---------|--------|-------------|
| Accept mode | `accept-mode-store` | `[MANUAL]` / `[AUTO]` / `[YOLO]` with color coding |
| Git branch | `api.state.vcs?.branch` | `⎇ branch-name` or hidden if no git |
| Providers | `api.state.provider.length` | `N providers` count |

**Colors:**
- MANUAL — default text color
- AUTO — green
- YOLO — red

---

### SpxAutoAccept

**Plugin ID:** `spx:auto-accept`
**File:** `packages/tui/src/feature-plugins/spx/auto-accept.ts`
**Keybind:** `shift+tab`
**KV key:** `spx.accept.mode`

Cycles between three permission modes. Mode is persisted across sessions via `api.kv`.

**Modes:**

| Mode | Permission reply | Notes |
|------|-----------------|-------|
| `manual` | None — OpenCode handles normally | Default |
| `auto` | `once` for all commands | No persistent grants |
| `yolo` | `always` for safe commands; `reject` for dangerous | See danger patterns below |

**YOLO danger patterns (blocked):**

| Pattern | Reason |
|---------|--------|
| `rm -rf` / `rm -r` / `sudo rm` | Recursive/privileged deletion |
| `mkfs` | Filesystem format |
| `dd if=` | Disk overwrite |
| `>> /dev/` | Writes to device files |
| `: > /` | Shell truncation of root paths |
| `format C:` (etc.) | Windows drive format |
| `fdisk` / `parted` | Disk partitioning |
| `shred` / `wipefs` | Data destruction |
| Paths: `/etc/` `/usr/` `/bin/` `/boot/` `/dev/` `/proc/` `/sys/` `/lib/` | System paths |

---

### SpxFallback

**Plugin ID:** `spx:fallback`
**File:** `packages/tui/src/feature-plugins/spx/fallback.ts`
**Trigger:** `session.error` event

Intercepts OpenCode session errors and displays classified, human-readable notifications instead of raw error objects.

**Error classifications:**

| Condition | Title | Duration |
|-----------|-------|----------|
| `statusCode 429` or `name` contains `RateLimit` | Rate Limit | 8s |
| `statusCode 401/403` or `name` contains `Auth` | Auth Error | 10s |
| `statusCode 500–599` or `name` contains `Server` | Provider Error | 6s |
| `name` contains `Context` or `responseBody` mentions tokens | Context Overflow | 6s |
| `name` contains `Overload` or `responseBody` contains `overloaded` | Model Overloaded | 5s |
| All others | AI Error | 5s |

---

### SpxDoctor

**Plugin ID:** `spx:doctor`
**File:** `packages/tui/src/feature-plugins/spx/doctor.ts`
**Slash command:** `/doctor`

Runs a health check and displays results as a formatted notification.

**Checks:**

| Check | Source | Pass condition |
|-------|--------|----------------|
| Providers | `api.state.provider` | At least 1 configured |
| Git | `api.state.vcs?.branch` | Branch detected |
| MCP servers | `api.state.mcp()` | All in `connected` state |
| LSP servers | `api.state.lsp()` | All in `running` state |

Output format:
```
SpxOpenCode Doctor

✅ Providers: 2 configured
✅ Git: main
✅ MCP: 3 connected
⚠️ MCP: github-mcp failed
✅ LSP: 1 running
```

---

## Disabling plugins

You can disable any SpxOpenCode plugin without uninstalling the fork. OpenCode continues to work fully with all spx plugins disabled — you simply get vanilla OpenCode behavior.

### How it works

Each built-in plugin entry in `packages/tui/src/feature-plugins/builtins.ts` supports an optional `enabled` field (type: `boolean`). When `enabled` is `false`, that plugin is skipped at startup.

The `BuiltinTuiPlugin` type definition:

```ts
export type BuiltinTuiPlugin = Omit<TuiPluginModule, "id"> & {
  id: string
  tui: TuiPlugin
  enabled?: boolean   // set to false to disable
}
```

### Example — disable a single plugin

To disable the status bar, edit `createBuiltinPlugins()` in `packages/tui/src/feature-plugins/builtins.ts`:

```ts
    // ...other plugins...
    { ...SpxStatusBar, enabled: false },   // disables spx:status-bar
    SpxAutoAccept,
    SpxFallback,
    SpxDoctor,
```

### Example — disable all SpxOpenCode plugins

```ts
    // ...OpenCode core plugins...
    { ...SpxStatusBar,  enabled: false },
    { ...SpxAutoAccept, enabled: false },
    { ...SpxFallback,   enabled: false },
    { ...SpxDoctor,     enabled: false },
```

### Plugin reference

| Import | Plugin ID | Description |
|--------|-----------|-------------|
| `SpxStatusBar` | `spx:status-bar` | Persistent footer bar (accept mode, git branch, providers) |
| `SpxAutoAccept` | `spx:auto-accept` | `shift+tab` accept-mode cycling |
| `SpxFallback` | `spx:fallback` | Friendly error notifications |
| `SpxDoctor` | `spx:doctor` | `/doctor` health-check slash command |

### After editing

Rebuild and run:

```bash
bun run build   # or: bun run dev
```

> **Note:** The `which-key` OpenCode core plugin already uses `enabled: false` by default — you can see this pattern in `packages/tui/src/feature-plugins/system/which-key.tsx`.

---

## Planned Features (not yet implemented)

See [ROADMAP.md](ROADMAP.md) for versioned delivery targets.

- Mac Shortcuts (`v0.2`)
- SpxStatusBar v2 with token/cost display (`v0.2`)
- SpxOffice document context (`v0.3`)
- SpxSkills slash command library (`v0.3`)
- SpxAuto virtual provider (`v0.5`)
- SpxCompanions persistent sub-agents (`v0.5`)
- SpxMemory session persistence (`v0.5`)
- SpxUI configuration panel (`v1.0`)
