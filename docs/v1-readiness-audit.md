# v1.0 Readiness Audit

**Date:** 2026-06-27  
**SpxOpenCode version:** v1.0.0-rc.1  
**Verdict: RELEASE CANDIDATE — not production stable**

---

## Feature status

| Feature | Status | Notes |
|---------|--------|-------|
| SpxStatusBar | ✅ DONE | Reactive, tested |
| SpxAutoAccept (MANUAL/AUTO/YOLO) | ✅ DONE | All 3 modes working, persists via KV |
| Auto allowlist (`.spx/allowlist.json`) | ✅ DONE | Glob patterns, optional file |
| YOLO audit log (`.spx/audit/`) | ✅ DONE | Per-day JSONL |
| SpxFallback (error classification) | ✅ DONE | 6 error classes, tested |
| SpxDoctor (`/doctor`) | ✅ DONE | 4 health checks |
| SpxDoctor v2 (per-provider latency) | ✅ DONE | Latency ms in output |
| macOS shortcuts (`super+` keybinds) | ✅ DONE | 5 shortcuts wired |
| SpxSkills built-in (`/skill:commit`, `/skill:pr`) | ✅ DONE | Zero AI, local git |
| SpxSkills custom skill loader | ✅ DONE | `.md` files in `spx/skills/` |
| SpxMemory (session save/load) | ✅ DONE | JSON to `.spx/memory/` |
| SpxPluginHost (community plugins) | ✅ DONE | Dynamic import, shape validated |
| `SpxApi` stable surface | ✅ DONE | `spx-api.ts` exported, versioned |
| `defineSpxPlugin` helper | ✅ DONE | Identity function, type-safe |
| SpxUI (`/spx` config panel) | ✅ DONE | All sections present |
| Upstream compatibility process | ✅ DONE | `scripts/upstream-sync.sh`, 2-file merge |
| SPX CI pipeline | ✅ DONE | typecheck + tests on push/PR |
| Unit test suite | ✅ DONE | 22 tests, all pass |
| Plugin disable (`enabled: false`) | ✅ DONE | Via `BuiltinTuiPlugin.enabled` field |
| SpxSkills v2 (community skills) | 🔜 PLANNED | No community contributions yet |
| Provider Dashboard (full) | 🔜 PLANNED | `/doctor` covers basics; dedicated dashboard not implemented |
| Binary releases (multi-platform) | 🔜 PLANNED | Runs from source only |
| Windows CI testing | 🟡 PARTIAL | Install script exists; not CI-tested |
| Upstream sync CI validation | 🟡 PARTIAL | `beta.yml` exists; requires repo secret (`OPENCODE_APP_SECRET`) |
| Integration test (YOLO end-to-end) | 🟡 PARTIAL | Unit tests for `isDangerous`; no full approve/reject flow test (Issue #8) |

---

## CI status

| Check | State | Notes |
|-------|-------|-------|
| TypeScript typecheck (`pnpm tsc --noEmit`) | ✅ PASS | Clean |
| Unit tests (`bun test`) | ✅ PASS | 22 tests pass |
| Lint | ✅ PASS | Non-blocking |
| SPX CI pipeline (`spx-ci.yml`) | ✅ GREEN | Triggers on spx path changes |
| Upstream sync (`beta.yml`) | 🟡 QUEUED | Requires `OPENCODE_APP_SECRET`; non-blocking for RC |

---

## Documentation completeness

| Document | Status |
|----------|--------|
| README.md | ✅ RC framing, all 8 plugins documented |
| FEATURES.md | ✅ Full reference for all plugins, stable API, exclusions |
| CHANGELOG.md | ✅ All versions: [1.0.0-rc.1], [0.5.0-preview], [0.3.0], [0.1.0-alpha], [0.1.0] |
| ROADMAP.md | ✅ Honest status markers |
| docs/shortcuts.md | ✅ Shortcuts, modes, YOLO rules |
| docs/plugin-system.md | ✅ Community plugin authoring guide |
| docs/upstream-compatibility-audit.md | ✅ Merge process documented |
| docs/performance-audit.md | ✅ Verdict: GREEN |
| docs/security-audit.md | ✅ Verdict: ACCEPTABLE for RC |
| docs/v1-readiness-audit.md | ✅ This file |

---

## Known issues (RC)

| Issue | Severity | Blocking? |
|-------|----------|-----------|
| #8 — No integration test for YOLO end-to-end approve/reject flow | Medium | No |
| `beta.yml` requires `OPENCODE_APP_SECRET` — queued by default | Low | No |
| No compiled binary — source-only via `bun run` | Low | No (documented) |
| Windows CI not tested | Low | No (documented) |
| SpxSkills v2: no community skills exist yet | Low | No (documented) |
| `loadAllowlist` not cached — reads file per AUTO approval | Very low | No |

---

## RC readiness checklist

- [x] All 8 spx plugins implemented and tested
- [x] TypeScript typecheck clean
- [x] Unit test suite passing (22 tests)
- [x] Stable `SpxApi` surface documented and exported
- [x] Plugin authoring guide available (`docs/plugin-system.md`)
- [x] Upstream merge process documented and scripted
- [x] All partial/planned features documented honestly
- [x] CHANGELOG, README, FEATURES, ROADMAP updated for RC
- [x] GitHub release v1.0.0-rc.1 created (pre-release)
- [x] Security posture documented and acceptable
- [ ] Compiled binaries for macOS/Linux/Windows — blocked until post-v1.0
- [ ] Windows CI coverage — blocked on CI runner cost
- [ ] SpxSkills v2 — waiting for community

---

## RC verdict

**SpxOpenCode v1.0.0-rc.1 is ready for release candidate status.**

All core features are implemented, tested, and documented. Known gaps are non-blocking, accurately described in CHANGELOG Known Limitations, and tracked as GitHub issues. No stability regressions against OpenCode baseline. Upstream merge process is scripted and documented.

**Not production stable.** The `rc.1` label is accurate. Post-RC checklist before v1.0 final:
1. Binary release pipeline (GitHub Actions, bun compile)
2. End-to-end integration test for YOLO approve/reject flow
3. Windows CI coverage
4. Community feedback on `SpxApi` surface (break window closes at v1.0 final)
