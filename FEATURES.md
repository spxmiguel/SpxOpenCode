# SpxOpenCode Features

Full feature reference for all SpxOpenCode plugins and modules.

Status: **v1.0-RC** — all features below are implemented and in the codebase.

---

## SpxStatusBar

**Plugin ID:** `spx:status-bar`  
**File:** `packages/tui/src/feature-plugins/spx/status-bar.tsx`  
**Slot:** `home_footer` (order 200, below OpenCode footer)

Persistent one-line status bar at the bottom of the home screen.

**Content:**
| Segment | Source | Description |
|---------|--------|-------------|
| Accept mode | `accept-mode-store` | `[MANUAL]` / `[AUTO]` / `[YOLO]` with color coding |
| Git branch | `api.state.vcs?.branch` | `⎇ branch-name` or hidden if no git |
| Providers | `api.state.provider.length` | `N providers` count |
| Last error | `lastError()` signal | `⚠ Error Title` clears after 30 s |

**Colors:** MANUAL — default; AUTO — green; YOLO — red

---

## SpxAutoAccept

**Plugin ID:** `spx:auto-accept`  
**File:** `packages/tui/src/feature-plugins/spx/auto-accept.ts`  
**Keybind:** `shift+tab`  
**KV key:** `spx.accept.mode`

Cycles between three permission modes. Mode persists across sessions via `api.kv`.

**Modes:**

| Mode | Permission reply | Notes |
|------|-----------------|-------|
| `manual` | None — OpenCode handles normally | Default |
| `auto` | `once` for tools matching allowlist; manual for others | See allowlist below |
| `yolo` | `always` for safe commands; `reject` for dangerous | See danger patterns below |

**YOLO danger patterns (blocked):**

| Pattern | Reason |
|---------|--------|
| `rm -rf` / `rm -r` / `sudo rm` | Recursive/privileged deletion |
| `mkfs` | Filesystem format |
| `dd if=` | Disk overwrite |
| `>> /dev/` | Writes to device files |
| `: > /` | Shell truncation of root paths |
| `format C:` (and other drives) | Windows drive format |
| `fdisk` / `parted` | Disk partitioning |
| `shred` / `wipefs` | Data destruction |
| `del /s` / `rmdir /q` / `rd /s` | Windows recursive delete |
| `diskpart` / `format X:` | Windows disk management |
| Paths: `/System/` `/Library/` `/etc/` `/usr/` `/bin/` `/boot/` `/dev/` `/proc/` `/sys/` `/lib/` | System paths |

---

## Auto Allowlist

**File:** `packages/tui/src/feature-plugins/spx/allowlist.ts`  
**Config:** `.spx/allowlist.json` (per project)

In AUTO mode, tools matching any pattern in the allowlist are auto-approved. Others prompt for manual approval.

```json
{
  "patterns": ["read_file", "list_directory", "search_*"]
}
```

Patterns support `*` glob wildcards. File is optional — if absent, AUTO mode uses one-time approvals for everything.

---

## YOLO Audit Log

**File:** `packages/tui/src/feature-plugins/spx/audit-log.ts`  
**Output:** `.spx/audit/YYYY-MM-DD.jsonl` (per session, per day)

Every auto-approved action in YOLO mode is recorded locally. Format:

```jsonl
{"ts":"2026-06-27T10:00:00Z","tool":"bash","input":"ls -la","approved":true}
```

---

## SpxFallback

**Plugin ID:** `spx:fallback`  
**File:** `packages/tui/src/feature-plugins/spx/fallback.ts`  
**Trigger:** `session.error` event

Intercepts OpenCode session errors and displays classified, human-readable notifications.

**Error classifications:**

| Condition | Title | Duration |
|-----------|-------|----------|
| `statusCode 429` or `name` contains `RateLimit` | Rate Limit | 8 s |
| `statusCode 401/403` or `name` contains `Auth` | Auth Error | 10 s |
| `statusCode 500–599` or `name` contains `Server` | Provider Error | 6 s |
| `name` contains `Context` or tokens mentioned | Context Overflow | 6 s |
| `name` contains `Overload` or `overloaded` in body | Model Overloaded | 5 s |
| All others | AI Error | 5 s |

Also records the error title in the `lastError` signal, which SpxStatusBar shows for 30 s.

---

## SpxDoctor

**Plugin ID:** `spx:doctor`  
**File:** `packages/tui/src/feature-plugins/spx/doctor.ts`  
**Slash command:** `/doctor`

Runs a health check and displays results.

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

## macOS Shortcuts

**File:** `packages/tui/src/config/keybind.ts`  
**Platform:** macOS only (super = Cmd key)

| Shortcut | Action |
|----------|--------|
| `cmd+k` | Clear current line |
| `cmd+p` | Session list |
| `cmd+n` | New session |
| `cmd+m` | Toggle sidebar |
| `cmd+enter` | Submit message |

Ctrl+C and Ctrl+D are preserved as process interrupt and EOF.

---

## SpxSkills

**Plugin ID:** `spx:skills`  
**File:** `packages/tui/src/feature-plugins/spx/spx-skills.ts`  
**Skill loader:** `packages/tui/src/feature-plugins/spx/skill-loader.ts`

Loads `.md` skill files from `spx/skills/` in the current project directory and registers them as slash commands.

**Built-in skills:**

| Command | Description |
|---------|-------------|
| `/skill:commit` | Generates conventional commit message from staged diff. No AI — runs `git diff --cached` locally. |
| `/skill:pr` | PR description template from `git log`. No AI — uses git history. |

**Custom skills:** place `.md` files in `spx/skills/` to add project-specific slash commands. Each file becomes `/skill:<filename-without-extension>`.

See [docs/auto-by-spxmiguel.md](auto-by-spxmiguel.md) for the built-in model router.

---

## SpxMemory

**Plugin ID:** `spx:memory`  
**File:** `packages/tui/src/feature-plugins/spx/spx-memory.ts`  
**Command:** `/recall`  
**Output:** `.spx/memory/<timestamp>.json`

Saves a session summary to disk at session end. On the next session in the same directory, loads recent memories as context.

**Behaviors:**
- Zero AI calls during session — memory operations are local only
- `/recall` command shows recent session summaries in a notification
- Memory files are plain JSON, human-readable and deletable
- Each file: `{ timestamp, directory, summary, toolsUsed }`

---

## SpxPluginHost

**Plugin ID:** `spx:plugin-host`  
**File:** `packages/tui/src/feature-plugins/spx/spx-plugin-host.ts`

Loads community plugins from `.spx/plugins/` in the current project directory.

**How it works:**
1. Scans `.spx/plugins/*.js` at session start
2. Dynamic `import()` each file
3. Validates exported `default` matches `SpxPlugin` shape
4. Calls `plugin.tui(api)` with the stable `SpxApi` subset

**Plugin shape:**
```typescript
interface SpxPlugin {
  id: string
  name?: string
  description?: string
  tui: (api: SpxApi) => Promise<void> | void
}
```

**`SpxApi` stable surface:**
```typescript
type SpxApi = Pick<TuiPluginApi,
  "attention" | "command" | "event" | "kv" |
  "slots" | "state" | "keymap" | "client" | "theme"
> & { ui: { toast: TuiPluginApi["ui"]["toast"] } }
```

**Error handling:** load failures are captured and displayed in `/spx` config panel. A broken plugin does not crash the host.

See [docs/plugin-system.md](plugin-system.md) for authoring guide.

---

## SpxUI

**Plugin ID:** `spx:ui`  
**File:** `packages/tui/src/feature-plugins/spx/spx-ui.ts`  
**Command:** `/spx` (alias: `/spx-config`)

Displays a formatted report of all SpxOpenCode settings for the current project.

**Sections:**
- Accept Mode — current mode and how to toggle
- Allowlist — `.spx/allowlist.json` patterns or "not configured"
- Skills — `.md` files found in `spx/skills/`
- Community Plugins — loaded plugins and any load errors from `.spx/plugins/`
- Memory — count of session memory files in `.spx/memory/`

---

## Plugin system stable API

**Files:**
- `packages/tui/src/feature-plugins/spx/spx-api.ts` — `SpxApi` type + `defineSpxPlugin` helper
- `packages/tui/src/feature-plugins/spx/spx-plugin-loader.ts` — loader logic

`defineSpxPlugin` is an identity helper for type-safe plugin definition:

```typescript
import { defineSpxPlugin } from "spx-api"

export default defineSpxPlugin({
  id: "my-plugin",
  name: "My Plugin",
  tui: async (api) => {
    api.command!.register(() => [{
      title: "My Command",
      value: "my.command",
      slash: { name: "mycommand" },
      async onSelect() {
        await api.attention.notify({ title: "Hello", message: "World" })
      }
    }])
  }
})
```

---

## Not implemented

Features explicitly excluded from SpxOpenCode:

- Background agents that poll continuously
- AI companion features (persistent sub-agents, "Tamagotchi"-style companions)
- Office Mode / document-aware context injection
- GUI or web interface
- Cloud sync or telemetry
- Pixel Agents

See [ROADMAP.md](ROADMAP.md) for what is and isn't on the roadmap.
