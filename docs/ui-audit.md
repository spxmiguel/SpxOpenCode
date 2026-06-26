# UI Audit — FASE 11

Audit conducted before implementing UI Pro Max. Documents current state, weaknesses, reusable components, and decisions that will guide implementation.

---

## Current interface inventory

### OpenCode built-in components (not owned by SPX)

| Component | File | Purpose |
|-----------|------|---------|
| `DialogModel` | `component/dialog-model.tsx` | Model selector — fuzzy search, favorites, recents, provider grouping |
| `DialogProvider` | `component/dialog-provider.tsx` | Provider connect flow — API key, OAuth, custom |
| `DialogSelect` | `ui/dialog-select.tsx` | Generic filtered list dialog |
| `DialogPrompt` | `ui/dialog-prompt.tsx` | Single text input dialog |
| `DialogVariant` | `component/dialog-variant.tsx` | Model variant selector |
| `HomeFooter` | `feature-plugins/home/footer.tsx` | OpenCode's own footer — dir, MCP count, version |
| Toast / Attention | (api) | `api.ui.toast` + `api.attention.notify` |

### SPX plugins (owned)

| Plugin | File | Slot/Event | Status |
|--------|------|-----------|--------|
| `spx:status-bar` | `spx/status-bar.tsx` | `home_footer` order 200 | Active |
| `spx:auto-accept` | `spx/auto-accept.ts` | keymap + `permission.asked` | Active |
| `spx:fallback` | `spx/fallback.ts` | `session.error` | Active |
| `spx:doctor` | `spx/doctor.ts` | `/doctor` slash command | Active |

### Shared state

| Store | File | Signals |
|-------|------|---------|
| `accept-mode-store` | `spx/accept-mode-store.ts` | `acceptMode`, `lastError`, `reportError` |
| `auto-router` | `spx/auto-router.ts` | `route(prompt, fallback)` |
| `diff-risk` | `spx/diff-risk.ts` | `classifyRisk`, `overallRisk`, `riskLabel` |

---

## Weaknesses identified

### 1. Status bar — information density vs noise

**Current state:** `status-bar.tsx` shows accept mode, git branch, last error, model ID, provider count. The OpenCode `home-footer` (order 100) shows dir+branch+MCP+version below ours (order 200).

**Weaknesses:**
- Two footer rows with overlapping info (git branch appears in both — OpenCode shows `dir:branch`, SPX shows `⎇ branch` separately)
- No loop indicator, no doctor status, no skills count, no Auto by SpxMiguel indicator
- `lastError` is just a 30s-TTL string with no context or call-to-action
- Provider count is always shown even when there are providers — noisy
- Model ID truncation not handled — long model names break layout on 80-col terminals
- No visual separator between left/right sections on narrow terminals

### 2. Model picker — present but shallow

**Current state:** `DialogModel` already includes "Auto by SpxMiguel" as an option (lines 143–188 of `dialog-model.tsx`). Model list shows name, provider, free/favorite markers.

**Weaknesses:**
- No cost per token shown in picker (data exists in `info.cost`)
- No context window / max tokens shown
- No speed/capability tier shown
- No auth status indicator per model (can show ✓ in provider picker but not per-model)
- No search filter shortcut hint visible
- Auto option description doesn't show what was last auto-chosen
- Category headers ("Auto", "Favorites", "Recent", "Providers") work but have no visual count

### 3. Diff viewer — no viewer, only utilities

**Current state:** `diff-risk.ts` classifies risk per file. There is a `DiffViewer` in `builtins.ts` — it's an OpenCode built-in (`internal:diff-viewer`). SPX adds no enhancement.

**Weaknesses:**
- Risk classification exists but is never surfaced in the diff view UI
- No file grouping by risk level
- No overall risk summary banner
- No stats (files changed, lines added/removed)
- High-risk files (package.json, .env, Dockerfile) not visually highlighted
- `classifyRisk` is utility-only — no TUI component consumes it

### 4. Provider information — scattered

**Current state:** Provider connect is `DialogProvider` (OpenCode). SPX `fallback.ts` reports errors. Status bar shows count.

**Weaknesses:**
- No dedicated panel to inspect provider health, quota, latency
- After provider error, user sees a toast/notification but no actionable "fix this" path
- No "last error per provider" persisted
- No "recommended next model" when current model fails
- Auth status only visible by opening provider dialog and looking for ✓

### 5. Error fallback — notifications only

**Current state:** `fallback.ts` classifies errors and calls `api.attention.notify`. Good classification (401, 429, quota, timeout, etc.) but output is notification-only.

**Weaknesses:**
- Notification disappears — no persistent error state beyond `lastError` (30s TTL)
- No "try this model instead" suggestion surfaced
- Error classification doesn't feed back into model picker
- YOLO danger blocks show a toast but don't explain what was blocked or why

### 6. Onboarding — none

No first-run flow. User lands in default OpenCode state. SPX features (Auto Accept, Auto by SpxMiguel, Doctor) activate silently with no introduction. This causes confusion about what mode is active.

**Missing:**
- First-run detection (check KV key `spx.onboarded`)
- Mode selection (classic OpenCode vs SPX mode)
- Feature introduction for Doctor, Auto Accept, Auto by SpxMiguel

### 7. Settings — none

No UI to toggle SPX plugins, configure accept mode defaults, or restore defaults. The only config path is editing `opencode.json` manually (documented in README but not discoverable from TUI).

### 8. Accessibility

**Current state:** Uses `fg` colors from theme — should work with user-defined themes. No minimum column width enforced.

**Weaknesses:**
- Status bar not tested on terminals < 80 columns
- No `flexShrink` budget — all items have `flexShrink={0}` which will overlap/overflow on narrow terminals
- Color is the only differentiator for accept mode (manual/auto/YOLO) — no text shape difference when color-blind
- No keyboard navigation documented beyond the existing keybind layer

### 9. Performance

**Current state:** Solid.js reactive signals update efficiently. No polling observed.

**Weaknesses:**
- `lastError` uses a `setTimeout` for auto-clear — acceptable but should use Solid.js `createEffect` + `onCleanup` pattern instead
- `ProviderCount` re-renders on any `api.state.provider` change — fine for now
- No concern with current implementation size

---

## Reusable components — do not replace

| Component | Reuse plan |
|-----------|-----------|
| `accept-mode-store.ts` | Extend: add `loopActive` signal |
| `diff-risk.ts` | Keep as-is, add TUI layer on top |
| `fallback.ts` | Extend: emit `nextModelSuggestion` signal |
| `auto-router.ts` | Keep as-is — wired into `DialogModel` already |
| `doctor.ts` | Export `runChecks` result to a shared signal for status bar |
| `DialogSelect` (OpenCode) | Use for Settings, Provider Dashboard item lists |
| `DialogPrompt` (OpenCode) | Use for Onboarding prompts |
| `useLocal()` | Use for model state in all new plugins |
| `api.kv` | Use for all persisted SPX preferences |
| `api.ui.toast` | Use for all user-facing confirmations |

---

## Architecture decisions

### D1 — Two footer rows coexist, no merging

OpenCode's `home-footer` (order 100) and SPX's `status-bar` (order 200) both render in `home_footer`. We do NOT merge them — merging would require replacing OpenCode's component, breaking upstream sync constraint. SPX row stays at order 200 above OpenCode's row.

**Trade-off:** Two rows use slightly more vertical space. Acceptable — TUI apps commonly have multi-line status bars (vim, tmux, etc.)

### D2 — No new slot registrations for dialogs

Model Picker Pro, Provider Dashboard, Settings, Onboarding are implemented as `dialog.push()` overlays triggered by commands/keybinds. They do NOT need new slot types — `DialogSelect` and custom `<box>` layouts work within existing dialog stack.

### D3 — Shared signals via module-level Solid.js signals

New state (loop indicator, doctor cache, settings flags) follows the `accept-mode-store.ts` pattern: module-level `createSignal` + exported getters/setters. No global store object — signals are imported directly.

### D4 — KV keys namespace

All SPX KV keys use `spx.` prefix. New keys for FASE 11:
- `spx.onboarded` — boolean, first-run done
- `spx.loop.active` — boolean, loop mode state  
- `spx.settings.*` — per-setting flags

### D5 — CLI-first layout constraints

All new components must work in an 80-column, 24-line terminal. Status bar items must use `flexShrink={1}` for non-critical items so they can be dropped on narrow terminals. Critical items (accept mode) keep `flexShrink={0}`.

### D6 — OpenCode compatibility

No edits to OpenCode files except `builtins.ts` (plugin registration) and `dialog-model.tsx` (already has SPX Auto option — already modified in prior phases). If `dialog-model.tsx` needs enhancement, preference is to keep changes minimal and additive.

---

## Implementation order (FASE 11)

1. **Status Bar V4** — extend `status-bar.tsx`, add loop/doctor/skills signals
2. **Model Picker Pro** — enhance `dialog-model.tsx` model option display (cost, context, capabilities)
3. **Diff Viewer Pro** — new `spx/diff-viewer-enhanced.tsx` plugin wrapping OpenCode's diff-viewer with risk overlay
4. **Provider Dashboard** — new `spx/provider-dashboard.tsx` plugin with `/providers` slash command
5. **Onboarding** — new `spx/onboarding.tsx` plugin, fires once on first run
6. **Settings** — new `spx/settings.tsx` plugin with `/spx-settings` slash command
7. **Tests** — `__tests__/ui.test.ts` covering all new plugins
8. **Docs** — update README, FEATURES, ARCHITECTURE, docs/ui.md, docs/configuration.md, CHANGELOG

---

*Created: FASE 11 — UI Pro Max. Last updated: 2026-06-26.*
