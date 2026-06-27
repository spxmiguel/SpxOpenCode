# Upstream Compatibility Audit

**Date:** 2026-06-27  
**SpxOpenCode version:** v1.0-rc.1  
**OpenCode fork baseline:** commit `5f61d21` (feat(llm): pass strict through tool definitions for Codex parity)  
**OpenCode remote:** `https://github.com/anomalyco/opencode.git` (remote: `upstream`)

---

## Summary

SpxOpenCode is a fork of OpenCode. All SpxOpenCode features are implemented as plugins registered through OpenCode's existing plugin API — zero modifications to OpenCode core files.

**Compatibility verdict: GREEN.** No OpenCode core files were modified. Upstream merges require only standard git conflict resolution on two files.

---

## What SpxOpenCode modified

### Files touched by SpxOpenCode

| File | Type of change | Risk |
|------|---------------|------|
| `packages/tui/src/feature-plugins/builtins.ts` | Added imports and plugin entries to array | Low — additive only |
| `packages/tui/src/config/keybind.ts` | Moved `agent_cycle_reverse` from `shift+tab` to `<leader>A`; added `spx_accept_cycle` | Medium — keybind conflict possible on upstream change |

### Files added by SpxOpenCode (new, no upstream conflict)

All files in `packages/tui/src/feature-plugins/spx/` are new — no upstream equivalents exist.

---

## Upstream merge process

```bash
# Fetch upstream
git fetch upstream

# Merge upstream main into SpxOpenCode main
git merge upstream/main

# Expected conflict sites:
# 1. packages/tui/src/feature-plugins/builtins.ts
#    → Accept upstream changes, re-add SpxOpenCode imports and entries
# 2. packages/tui/src/config/keybind.ts
#    → Accept upstream keybind changes, verify shift+tab is still free
#    → If upstream reclaims shift+tab, move spx_accept_cycle to another binding

# After merge: typecheck
pnpm tsc --noEmit

# Run SPX tests
cd packages/tui && bun test

# Commit
git commit -m "chore: merge upstream OpenCode vX.Y.Z"
```

Script: `scripts/upstream-sync.sh` automates fetch + merge and reports conflict sites.

---

## Risk assessment by area

### Plugin API (`@opencode-ai/plugin/tui`)

**Risk: Medium.**

SpxOpenCode imports `TuiPlugin`, `TuiPluginModule`, `TuiDialogStack` from `@opencode-ai/plugin/tui`. If OpenCode renames or removes these types, SpxOpenCode will fail to typecheck.

Mitigation: `SpxApi` is a local stable subset — `spx-api.ts` only exposes APIs we control. Community plugins target `SpxApi`, not `TuiPluginApi` directly. If upstream API changes, only internal SpxOpenCode plugins need updating, not community plugins.

### Keybind `shift+tab`

**Risk: Low.**

`shift+tab` was previously `agent_cycle_reverse` in upstream. SpxOpenCode moved that to `<leader>A` and claimed `shift+tab` for `spx_accept_cycle`. If upstream adds a new binding to `shift+tab`, there will be a conflict in `keybind.ts`.

### `builtins.ts` array order

**Risk: Low.**

Plugin registration order affects render order in slots. SpxOpenCode appends plugins at the end of the array. If upstream restructures `createBuiltinPlugins` significantly, manual reordering may be needed after merge.

### `beta.yml` upstream sync workflow

**Risk: None for users.**

The `beta.yml` workflow (hourly, requires `OPENCODE_APP_SECRET`) automatically syncs the upstream OpenCode beta branch. This is a repo-admin concern, not a user concern. Queued runs are normal — the workflow runs only when runners are available.

---

## Upstream API surface used

| API | Used in | Stability |
|-----|---------|-----------|
| `api.command.register()` | All command-registering plugins | Stable |
| `api.attention.notify()` | SpxFallback, SpxDoctor, SpxUI, SpxMemory | Stable |
| `api.event.on("session.error")` | SpxFallback | Stable |
| `api.kv.get/set()` | SpxAutoAccept, SpxMemory | Stable |
| `api.state.provider` | SpxStatusBar, SpxDoctor | Stable |
| `api.state.vcs?.branch` | SpxStatusBar, SpxDoctor | Stable (optional chaining required) |
| `api.state.mcp()` | SpxDoctor | Stable |
| `api.state.lsp()` | SpxDoctor | Stable |
| `api.state.path.directory` | SpxUI, SpxMemory, SpxSkills | Stable |
| `api.keymap.register()` | SpxAutoAccept | Stable |
| `api.slots.register()` | SpxStatusBar | Stable |
| `api.theme` | SpxStatusBar (colors) | Stable |
| `api.client` | SpxPluginHost | Stable |

---

## Not used (by design)

| API | Reason avoided |
|-----|---------------|
| `api.app` | Too close to OpenCode internals |
| `api.mode` | Not needed; SpxOpenCode tracks its own accept mode |
| `api.route` | Not needed |
| `api.renderer` | Not needed |
| `api.lifecycle` | Not needed |

Avoiding these APIs reduces the surface area for upstream breaking changes.

---

## Conclusion

SpxOpenCode's architecture (all-plugin, no core modification) is the strongest possible compatibility guarantee. Two files require attention on each upstream merge: `builtins.ts` (additive) and `keybind.ts` (one moved binding). The `scripts/upstream-sync.sh` script documents and automates the process.
