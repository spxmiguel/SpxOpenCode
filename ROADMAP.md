# SpxOpenCode Roadmap

All versions follow the philosophy: **OpenCode first. Productivity first. Compatibility first.**

No version ships a feature that degrades OpenCode behavior, generates constant AI calls, or increases cost without justification.

---

## v0.1 — Foundation ✅ (current)

Goal: establish the plugin system and prove that SpxOpenCode can add real value without touching OpenCode core.

- [x] **SpxStatusBar** — persistent footer: accept mode, git branch, provider count
- [x] **SpxAutoAccept** — `shift+tab` cycles Manual / Auto / YOLO permission modes
- [x] **SpxFallback** — classifies `session.error` into friendly, actionable notifications
- [x] **SpxDoctor** — `/doctor` slash command: health check for providers, git, MCP, LSP
- [x] Repository structure, documentation, GitHub issues

---

## v0.2 — Platform & Ergonomics

Goal: make SpxOpenCode feel native on macOS and improve daily-use ergonomics.

- [ ] **Mac Shortcuts** — platform-aware `super` modifier for macOS (`cmd+k`, `cmd+p`, etc.)
- [ ] **SpxStatusBar v2** — token usage display, session cost indicator (opt-in, no AI calls)
- [ ] **Keybind config** — allow `spx.*` keybinds to be overridden via user config
- [ ] **Auto mode improvements** — configurable blocklist patterns per-project
- [ ] **YOLO audit log** — local log of auto-approved commands per session

---

## v0.3 — Context & Skills

Goal: make SpxOpenCode aware of what you're working on and provide reusable slash commands.

- [ ] **SpxOffice** — document-aware context injection: reads open files, infers intent, prepends relevant context to prompts (no AI calls — static analysis only)
- [ ] **SpxSkills** — library of reusable `/skill:*` slash commands for common dev tasks
  - `/skill:commit` — generate conventional commit message from staged diff
  - `/skill:pr` — draft PR description from git log
  - `/skill:explain` — explain selected code with line-level annotations
- [ ] **SpxDoctor v2** — detailed per-provider diagnostics, latency display

---

## v0.5 — Intelligence Layer

Goal: first AI-powered SpxOpenCode features — strictly opt-in, cost-justified.

- [ ] **SpxAuto** — virtual `spx/auto` provider: routes prompts to best available provider based on task type (code vs. reasoning vs. fast reply). No constant polling. Routes per-request only.
- [ ] **SpxCompanions** — persistent named AI sub-agents for specific roles (reviewer, architect, test writer). Spawned on demand, not always running.
- [ ] **SpxMemory** — session summary saved to `.spx/memory/` at session end. Loaded as context on next session in same directory. Zero AI calls during session.

---

## v1.0 — Stable & Configurable

Goal: stable plugin API, full configuration surface, ready for contributors.

- [ ] **SpxUI** — configuration panel accessible via `/spx config` showing all SpxOpenCode settings
- [ ] **Stable plugin API** — documented `SpxPlugin` interface that third-party plugins can implement
- [ ] **SpxProviders** — pluggable provider adapters (Ollama, LM Studio, local models) registered through SpxOpenCode's provider system
- [ ] **Full upstream compatibility** — structured process for pulling OpenCode upstream changes
- [ ] **Documentation site** — rendered docs at `spxmiguel.github.io/SpxOpenCode`

---

## Not on the roadmap

Features explicitly excluded to preserve philosophy:

- Background agents that poll continuously
- Features that require always-on AI calls
- Anything that modifies OpenCode session/permission logic (only wraps it)
- GUI/web interface (OpenCode TUI is the interface)
- Cloud sync or telemetry of any kind
