# Changelog

All notable changes to SpxOpenCode are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

---

## [1.0.0-rc.1] — 2026-06-27

### Added

- **SpxUI** — `/spx` slash command (alias `/spx-config`) shows a formatted config report: accept mode, allowlist patterns, installed skills, community plugins (loaded/failed), and memory file count.
- **Stable `SpxApi` type** — `spx-api.ts` exports `SpxApi` (stable subset of `TuiPluginApi`) and `defineSpxPlugin` identity helper for type-safe community plugin authoring.
- **`SpxPluginHost`** — loads `.spx/plugins/*.js` community plugins at session start via dynamic `import()`; validates shape; captures load errors without crashing host.
- **`SpxPlugin` / `PluginLoadResult` types** — public interface for community plugins.

### Known limitations (RC)

- `beta` CI workflow (hourly OpenCode upstream sync) stays queued — requires `OPENCODE_APP_SECRET` repo secret; does not affect SpxOpenCode functionality.
- No compiled binary — runs from source via `bun run`. Binary releases planned post-v1.0.
- Plugin disable via config key not verified end-to-end (OpenCode plugin manager handles the actual enable/disable).
- SpxSkills v2 (community-contributed skills) not yet available — contributions welcome.
- Tested on macOS (arm64, x64) and Linux (x64). Windows support via install script — not CI-tested.

---

## [0.5.0-preview] — 2026-06-27

### Added

- **SpxMemory** — session summaries saved to `.spx/memory/<timestamp>.json` at session end. `/recall` command displays recent summaries. Context loaded automatically on next session in same directory. Zero AI calls during session.
- **SpxPluginHost** — community plugin loader for `.spx/plugins/*.js`. See `spx-api.ts`.
- **`SpxApi` stable surface** — `Pick<TuiPluginApi, "attention" | "command" | "event" | "kv" | "slots" | "state" | "keymap" | "client" | "theme"> & { ui: { toast } }`.
- **`defineSpxPlugin` helper** — identity function for type-safe plugin definition.
- **Plugin system docs** — `docs/plugin-system.md` covers authoring, shape validation, error handling.

---

## [0.3.0] — 2026-06-26

### Added

- **SpxSkills** — `/skill:commit` generates conventional commit message from staged diff (local `git diff --cached`, no AI). `/skill:pr` generates PR description template from `git log`. Both are zero-AI, zero-network slash commands.
- **Custom skill loading** — `.md` files in `spx/skills/` auto-register as `/skill:<name>` commands.
- **Skill generators** — `skill-generators.ts` contains commit and PR template logic.
- **SpxDoctor v2** — per-provider latency display in health check output; improved MCP status detail.

---

## [0.1.0-alpha] — 2026-06-26

### Added

- **macOS shortcuts** — `super` modifier maps Cmd+C/V/K/L/Enter to copy, paste, clear line, session list, and submit. Ctrl+C and Ctrl+D are preserved as process interrupt and EOF.
- **SpxStatusBar v2 reactive** — status bar now reacts to accept mode changes, active git branch, provider count, and last provider error (30 s auto-clear with `⚠` indicator).
- **lastError signal** — `reportError(title, ttlMs)` in `accept-mode-store.ts`; `classify()` in `fallback.ts` now calls it before `api.attention.notify()`.
- **SPX CI pipeline** — `.github/workflows/spx-ci.yml` with typecheck, lint (non-blocking), and test jobs; triggers on push/PR to monitored SPX paths and via `workflow_dispatch`.
- **bun:test unit tests** — `packages/tui/src/feature-plugins/spx/__tests__/spx.test.ts` covers `isDangerous` (10 cases), `classify` (7 cases), cycle logic (3 cases), `reportError` (2 cases).
- **docs/shortcuts.md** — full reference for shortcuts, accept modes, YOLO safety rules, status bar fields, and CI commands.

### Changed

- **YOLO DANGER_PATTERNS hardened** — consolidated into single regex array; added Windows-specific patterns (`del /s`, `rmdir /q`, `rd /s`, `diskpart`, `format X:`), macOS paths (`/System/`, `/Library/`), and cross-platform system paths.
- `isDangerous()` exported from `auto-accept.ts` for testability.
- `classify()` exported from `fallback.ts` for testability.

### Fixed

- LSP status comparison in `doctor.ts` used wrong literal `"failed"` — corrected to `"error"` (matches `"connected" | "error"` type).
- `keymap.test.tsx` snapshot updated to reflect `session.list` having 2 bindings after `super+l` addition.

### Known Issues

- `bun` not in shell PATH on developer machine — CI covers type-check and tests.
- Upstream `pr-standards` workflow fails on Dependabot PRs (inherited from OpenCode fork — not our issue).
- Node.js 20 deprecation warning in CI (GitHub Actions infra change — no action needed from us).

---

## [0.1.0] — 2026-06-25

### Added

- **SpxStatusBar** — persistent TUI footer bar showing current accept mode, active git branch, and provider count. Renders at `home_footer` slot with order 200, below OpenCode's native footer.
- **SpxAutoAccept** — `shift+tab` keybind cycles between three permission modes:
  - `Manual` — default OpenCode behavior, prompts every time
  - `Auto` — approves all permission requests with `once` scope
  - `YOLO` — approves with `always` scope, blocks dangerous patterns (`rm -rf`, `dd if=`, `mkfs`, `fdisk`, `shred`, etc.)
- **SpxFallback** — listens to `session.error` events and classifies them into friendly, actionable notifications (rate limit, auth failure, network error, context overflow, model overloaded)
- **SpxDoctor** — `/doctor` slash command running health checks on: API providers, git VCS state, MCP servers, LSP servers
- **accept-mode-store** — shared SolidJS signal module for reactive accept mode state between `SpxAutoAccept` (writer) and `SpxStatusBar` (reader)
- **keybind registration** — `spx_accept_cycle` registered in `keybind.ts` Definitions and CommandMap; `agent_cycle_reverse` moved from `shift+tab` to `<leader>A` to free the binding

### Changed

- `packages/tui/src/config/keybind.ts` — `agent_cycle_reverse` default keybind changed from `shift+tab` to `<leader>A`
- `packages/tui/src/feature-plugins/builtins.ts` — added 4 SpxOpenCode plugins to `createBuiltinPlugins` return array

### Fork baseline

- Forked from `https://github.com/anomalyco/opencode` at commit `5f61d21` (feat(llm): pass strict through tool definitions for Codex parity)
