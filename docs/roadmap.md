# Roadmap

Detailed version breakdown. For high-level status see [ROADMAP.md](../ROADMAP.md) at the project root.

## v0.1.0-alpha — Foundation (current)

**Goal:** Prove the plugin architecture works and is stable.

- [x] Fork from OpenCode with clean history
- [x] SpxStatusBar — bottom status line with accept mode, branch, providers
- [x] SpxAutoAccept — three-mode cycle (MANUAL / AUTO / YOLO) with keybinds
- [x] SpxFallback — classified provider error messages
- [x] SpxDoctor — session health check via `:doctor`
- [x] Branding (logo, icon, banner, colors)
- [x] Full documentation (README, ARCHITECTURE, VISION, docs/)
- [x] GitHub professional setup (workflows, templates, labels, milestones)

## v0.2.0 — Ergonomics

**Goal:** Reduce friction in daily use.

- [ ] Mac-native keyboard shortcuts (Cmd+K, Cmd+Z, etc.)
- [ ] SpxStatusBar v2 — click-to-cycle mode directly from status bar
- [ ] Auto-accept allowlist per project (`.spx/allowlist.json`)
- [ ] Doctor enhanced — checks provider latency, model availability

## v0.3.0 — History

**Goal:** Better session awareness.

- [ ] Session summary on exit (cost, tokens, time, actions taken)
- [ ] `.spx/sessions/` local log (no cloud, no AI, plain JSON)
- [ ] Search past session summaries

## v0.5.0-preview — Extensibility

**Goal:** Let community build plugins.

- [ ] `spx.config.ts` — user-level plugin config file
- [ ] Plugin registry concept (local only, no npm install magic)
- [ ] Example third-party plugin template

## v1.0.0 — Stable

**Goal:** Production-ready, no regressions, community-maintained.

- [ ] All v0.x plugins stable and type-checked
- [ ] Upstream sync tested against latest OpenCode
- [ ] At least one community-contributed plugin merged
- [ ] Consider upstreaming `SpxStatusBar` to OpenCode

## What will NOT be in any version

- AI companions with autonomous behavior
- Background AI polling
- Cloud sync of any kind
- GUI or web interface
- Proprietary features that require a paid SpxOpenCode service

These are permanent exclusions, not deferred items.
