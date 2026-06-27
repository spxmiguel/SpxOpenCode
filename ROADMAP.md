# SpxOpenCode Roadmap

All versions follow the philosophy: **OpenCode first. Productivity first. Compatibility first.**

No version ships a feature that degrades OpenCode behavior, generates constant AI calls, or increases cost without justification.

---

## v0.1 — Foundation ✅ (current)

Goal: establish the plugin system and prove that SpxOpenCode can add real value without touching OpenCode core.

- [x] **SpxStatusBar** — persistent footer: accept mode, git branch, provider count
- [x] **SpxAutoAccept** — `shift+tab` cycles MANUAL / AUTO / YOLO permission modes
- [x] **SpxFallback** — classifies provider errors into friendly, actionable notifications
- [x] **SpxDoctor** — `:doctor` health check for providers, config, keybinds
- [x] Repository structure, documentation, branding, GitHub setup

---

## v0.2 — Ergonomics ✅

Goal: reduce daily friction, especially on macOS.

- [x] **Mac Shortcuts** — `super+` variants for common keybinds (`cmd+p`, `cmd+b`, `cmd+n`, `cmd+m`)
- [x] **SpxStatusBar v2** — click-to-cycle accept mode directly from status bar
- [x] **Auto mode allowlist** — per-project `.spx/allowlist.json` for AUTO mode tool patterns
- [x] **YOLO audit log** — local log of auto-approved actions per session (`.spx/audit/`)

---

## v0.3 — Skills ✅

Goal: reusable slash commands for common dev tasks. All static, zero AI calls.

- [x] **SpxSkills** — `/skill:commit`, `/skill:pr` slash commands
  - `/skill:commit` — conventional commit message from staged diff (local git, no AI)
  - `/skill:pr` — PR description template from git log
- [x] **SpxDoctor v2** — per-provider latency display, model availability check

---

## v0.5-preview — Session Awareness ✅

Goal: make SpxOpenCode aware of what happened in past sessions.

- [x] **SpxMemory** — session summary to `.spx/memory/` at session end. Loaded as context on next session in same directory. Zero AI calls during session — only on explicit `:recall` command.
- [ ] **SpxSkills v2** — more skills contributed by community

---

## v1.0 — Stable

Goal: stable plugin API, ready for long-term maintenance and community contributions.

- [x] **Stable plugin API** — documented `SpxPlugin` interface for third-party plugins
- [x] **Full upstream compatibility** — structured process for pulling OpenCode upstream changes
- [ ] **SpxUI** — `/spx config` TUI panel showing all SpxOpenCode settings
- [ ] Consider upstreaming `SpxStatusBar` and `SpxFallback` to OpenCode

---

## Not on the roadmap

Features explicitly excluded to preserve philosophy:

- Background agents that poll continuously
- Features that require always-on AI calls
- Anything that modifies OpenCode session or permission logic beyond wrapping
- GUI or web interface
- Cloud sync or telemetry of any kind
- Provider routing or selection logic (OpenCode handles this)
- AI companion features that run without explicit user request
