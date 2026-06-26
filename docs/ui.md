# UI Improvements — SpxOpenCode

Usability layer on top of OpenCode. No core component replacements, no heavy animations, no refactors. Each piece is additive.

---

## Model Picker V2

**File:** `packages/tui/src/component/dialog-model.tsx`

The "Auto by SpxMiguel" option now tracks which model it routed to. After Auto selects a model, the option description changes from `"Routes to best model based on task"` to `"Este modelo foi escolhido automaticamente."` — visible next time the picker opens.

**Signal:** module-level `autoChosenModel` (SolidJS `createSignal`). Compared against `local.model.current()` inside the `options` memo to detect match reactively.

**Constraint:** description is computed inside `createMemo(() => options)`, so `autoChosenModel()` is tracked automatically. No extra subscriptions needed.

---

## Status Bar V3

**File:** `packages/tui/src/feature-plugins/spx/status-bar.tsx`

Left side: accept-mode indicator, git branch, last fallback error.
Right side: current model (new), provider count.

### `CurrentModel` component

Shows `◈ <modelID>` in the status bar when a non-auto model is active. Hidden when `providerID === "auto"` (Auto mode active) or no model set.

```
● manual  ⎇ main  ⚠ Auth error          ◈ claude-sonnet-4-5  3 providers
```

**Hook used:** `useLocal()` → `local.model.current()` — same source used by the rest of the TUI.

---

## Fallback UX V2

**File:** `packages/tui/src/feature-plugins/spx/fallback.ts`

Every `FriendlyError` can now carry a `suggestion?: string`. When present, the notification appends it on a second line:

```
Provider timeout
No response from provider. Check connection or try a different model.
Try: google/gemini-2.0-flash (lower latency)
```

### Error → Suggestion mapping

| Error | Suggestion |
|-------|-----------|
| `ProviderHeaderTimeoutError` | `google/gemini-2.0-flash` (lower latency) |
| `ProviderResponseStreamError` | `anthropic/claude-haiku-4-5` (lighter, stable) |
| 401 / invalid API key | `opencode auth login` |
| 429 / rate limit | `google/gemini-2.0-flash` or `deepseek/deepseek-chat` |
| 413 / context overflow | `anthropic/claude-sonnet-4-5` (200k context window) |
| `insufficient_quota` | `google/gemini-2.0-flash` (free tier) |
| `usage_not_included` | `google/gemini-2.0-flash` (free tier) |
| `server_is_overloaded` | `deepseek/deepseek-chat` (independent infra) |
| 403 / forbidden | *(none — plan/permission issue, no safe alternative)* |

---

## Diff Viewer Enhancement

**Files:**
- `packages/tui/src/feature-plugins/spx/diff-risk.ts` (pure TS, no UI deps)
- `packages/tui/src/component/dialog-workspace-file-changes.tsx`

### Risk classification (`diff-risk.ts`)

`classifyRisk(filePath)` returns `"high" | "medium" | "low"` based on regex patterns. No external deps — pure TypeScript, fully testable.

**HIGH patterns** (touches deployment, auth, or environment):
- `package.json`, `*.lock`, `*.lockb`
- `.github/` directory
- auth files/directories (path or filename contains `auth`)
- `migration` in path
- `.env` files
- `Dockerfile*`, `docker-compose*`
- `secrets/` directory

**MEDIUM patterns** (config that affects build or runtime):
- `.yaml/.yml/.toml/.ini/.cfg/.conf`
- `tsconfig*`
- `middleware` in path or filename
- `schema.*` files
- `*.config.ts/js/mjs/cjs`
- `vite/webpack/rollup/esbuild` configs

**LOW:** everything else.

`overallRisk(levels[])` returns the highest level present.

### Summary bar

Added above the file list in `DialogWorkspaceFileChanges`:

```
3 files · +1 ~1 -1                    ⚠ high
```

- File count + change breakdown (`+N added`, `~N modified`, `-N deleted`)
- Overall risk label colored by theme (`error` / `warning` / `textMuted`)

### Per-file risk coloring

Each file row inherits its risk color:
- HIGH → `theme.error` (red)
- MEDIUM → `theme.warning` (yellow)  
- LOW → `theme.textMuted` (gray)

Status letter (A/M/D) and filename both use the same color.

---

## OpenCode Compatibility

All changes are additive:
- No OpenCode components replaced or monkey-patched
- `dialog-workspace-file-changes.tsx` is a SpxOpenCode fork already — modifications stay in fork
- `dialog-model.tsx` extends the auto option only; all upstream model options untouched
- Status bar slot registered with `order: 200`, same as before

---

## Maintenance

- `diff-risk.ts` has no SolidJS dependency — update patterns there without touching components
- To add a new error suggestion, add `suggestion` to the matching branch in `fallback.ts:classify()`
- To add a status bar item, add a component to `View` in `status-bar.tsx` — no plugin registration needed
- Tests for risk classification and fallback suggestions live in `__tests__/spx.test.ts`
