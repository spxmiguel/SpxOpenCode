# Contributing to SpxOpenCode

Thanks for your interest in SpxOpenCode. Before contributing, read these rules — they are non-negotiable.

---

## Core Rules

Every contribution must satisfy all of these:

1. **Does not degrade OpenCode behavior.** SpxOpenCode must work as vanilla OpenCode if all `spx:*` plugins are disabled.
2. **Does not generate constant AI calls.** New features may not poll AI providers in the background.
3. **Does not increase cost without justification.** If a feature requires AI calls, it must be opt-in and the cost must be documented.
4. **Is implemented as a plugin or module.** Avoid modifying files in `packages/` that OpenCode owns unless strictly necessary. All new functionality goes in `packages/tui/src/feature-plugins/spx/` or `spx/`.
5. **Is disableable via config.** Every SpxOpenCode feature must be possible to turn off.

---

## Getting Started

```bash
git clone https://github.com/spxmiguel/SpxOpenCode.git
cd SpxOpenCode
bun install
bun run dev
```

---

## Where to Put New Code

| Type | Location |
|------|----------|
| TUI plugin | `packages/tui/src/feature-plugins/spx/<name>.ts` |
| Shared state | `packages/tui/src/feature-plugins/spx/<name>-store.ts` |
| Pixel Agents | `packages/tui/src/feature-plugins/spx/pixel-agents/` |
| Future modules | `spx/<subsystem>/` |
| Documentation | `docs/` |

Register new plugins in `packages/tui/src/feature-plugins/builtins.ts`.

---

## Plugin Checklist

Before submitting a new plugin:

- [ ] Plugin `id` prefixed with `spx:` (e.g. `spx:my-feature`)
- [ ] No top-level code that runs outside the `TuiPlugin` function
- [ ] No polling or background intervals
- [ ] Works correctly when other `spx:*` plugins are disabled
- [ ] Tested manually against the OpenCode TUI
- [ ] Added to `builtins.ts`
- [ ] Described in the PR description with: what it does, what keybind/command it uses, what config key disables it

---

## Commit Style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(spx): add SpxSkills plugin with /skill:commit command
fix(spx): guard against undefined vcs state in status bar
docs: update ROADMAP with v0.3 skills entries
```

Scope `spx` for SpxOpenCode-specific changes. Use the OpenCode scope for any upstream-touching changes.

---

## Pull Requests

- Target `main` for SpxOpenCode features
- Target `dev` for experimental or WIP work
- PRs that modify OpenCode-owned files require explicit justification in the PR description
- One feature per PR

---

## Issues

Use the appropriate label:

| Label | When |
|-------|------|
| `bug` | Something that worked and now doesn't |
| `enhancement` | New SpxOpenCode feature request |
| `good first issue` | Bounded task, no deep OpenCode knowledge needed |
| `help wanted` | Good contribution opportunity, needs ownership |
| `epic` | Multi-PR initiative |

---

## Upstream Sync

SpxOpenCode tracks OpenCode upstream at `https://github.com/anomalyco/opencode`.
The `upstream` remote should already be set up in your clone. Verify with:

```bash
git remote -v
# upstream  https://github.com/anomalyco/opencode.git (fetch)
```

If missing:
```bash
git remote add upstream https://github.com/anomalyco/opencode.git
```

### Sync script

```bash
./scripts/upstream-sync.sh           # preview + merge
./scripts/upstream-sync.sh --dry-run # preview only, no merge
```

The script:
1. Fetches upstream `main`
2. Reports how many commits behind and which files changed
3. Warns if any SpxOpenCode-owned files (`spx/` plugin dir) changed upstream
4. Merges with `--no-ff` so the upstream pull is a distinct commit
5. Runs `pnpm tsc --noEmit` to verify nothing broke

### Conflict resolution rules

| Files | Resolution |
|-------|------------|
| `packages/tui/src/feature-plugins/spx/*` | Keep SpxOpenCode version |
| All other `packages/*` | Keep upstream version |
| `ROADMAP.md`, `CONTRIBUTING.md`, `docs/` | Keep SpxOpenCode version |
| `package.json`, `tsconfig.json`, lock files | Keep upstream version, re-apply SpxOpenCode additions |

### Principles

1. All SpxOpenCode changes must remain in `spx:*` plugin files
2. Never modify OpenCode-owned files to accommodate SpxOpenCode behavior — wrap instead
3. After sync, verify all SpxOpenCode plugins still register and `/doctor` passes

---

## Questions

Open an issue with the `question` label or start a Discussion.
