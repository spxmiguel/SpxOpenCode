# Changelog

All notable changes to SpxOpenCode are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

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
