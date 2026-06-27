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
- 🔜 **SpxSkills v2** — more skills contributed by community (no contributions yet; open for PRs)

---

## v1.0-RC — Release Candidate 🟡

Current state: [v1.0.0-rc.1](https://github.com/spxmiguel/SpxOpenCode/releases/tag/v1.0.0-rc.1) released 2026-06-27. Not production stable.

- [x] **Stable plugin API** — documented `SpxPlugin` interface and `defineSpxPlugin` helper
- [x] **Full upstream compatibility** — structured process for pulling OpenCode upstream changes; `scripts/upstream-sync.sh`
- [x] **SpxUI** — `/spx` TUI panel showing all SpxOpenCode settings
- [x] **Plugin disable support** — `BuiltinTuiPlugin.enabled?: boolean` documented
- 🟡 **Windows CI coverage** — install script exists; not CI-tested
- 🟡 **Upstream sync CI validation** — `beta.yml` exists; requires `OPENCODE_APP_SECRET` repo secret
- 🔜 **Binary releases** — macOS/Linux/Windows compiled binaries; runs from source only currently
- [ ] Consider upstreaming `SpxStatusBar` and `SpxFallback` to OpenCode

### v1.0 final (post-RC)

Before v1.0 final:
1. Binary release pipeline (GitHub Actions, `bun compile`)
2. End-to-end integration test for YOLO approve/reject flow (Issue #8)
3. Windows CI coverage
4. Community feedback on `SpxApi` surface (break window closes at v1.0 final)

---

## Pixel Agents — Foundation 🟡 (PARTIAL)

Lightweight, stateful event observers. Disabled by default, zero AI calls in LOCAL mode.

**Status**: Infrastructure only. Not wired to plugin lifecycle or UI yet.

- [x] **Types** — `PixelAgent`, `PixelAgentEvent`, `PixelAgentState`, `PixelAgentAction`, `PixelAgentMemory`, `PixelAgentRuntime`, `PixelAgentProviderMode`
- [x] **Config parser** — safe defaults, premium mode enforcement, `maxEventsPerSession` cap
- [x] **Event bus** — 11 typed event types, in-process pub/sub
- [x] **`LocalPixelAgentAdapter`** — deterministic reactions, zero AI calls
- [x] **`InMemoryPixelAgentMemoryStore`** — RAM-only, no file I/O, no SQLite
- [x] **`PixelAgentHost`** — register agents, route events, enforce quota, pub/sub API
- [x] Tests — 25+ assertions covering config, event bus, adapter, persistence, host
- [x] Docs — `docs/pixel-agents.md`, `docs/pixel-events.md`, `docs/pixel-api.md`, `docs/pixel-agents-analysis.md`

**What is explicitly NOT included** (and will not be, without a new explicit authorization):
- Plugin wiring (host not connected to SpxPlugin lifecycle)
- UI panel (no `:pixel` TUI screen, no StatusBar indicator)
- Groq adapter (mode typed but no implementation)
- AI calls of any kind in this phase
- Personalities, characters, Tamagotchis, XP/humor systems

### Planned (future, not authorized)

- **Pixel Agents UI** — StatusBar indicator; `:pixel` TUI panel
- **Tamagotchi System** — personality-driven idle state (requires UI + local state machine)
- **Groq Personality Mode** — optional Groq adapter behind `groqEnabled: true` + API key

---

## Not on the roadmap

Features explicitly excluded to preserve philosophy:

- Background agents that poll continuously
- Features that require always-on AI calls
- Anything that modifies OpenCode session or permission logic beyond wrapping
- GUI or web interface
- Cloud sync or telemetry of any kind
- Provider routing or selection logic (OpenCode handles this)
- AI companion features that run without explicit user request ("Tamagotchi"-style companions, full personalities)
- Office Mode / document-aware context injection
