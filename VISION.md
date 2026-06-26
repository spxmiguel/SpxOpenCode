# SpxOpenCode Vision

## Why this project exists

OpenCode is an excellent AI coding assistant. It is fast, extensible, and open source. But its plugin system is underutilized — most productivity improvements that developers need every day are not in OpenCode itself and no one has built them yet.

SpxOpenCode exists to fill that gap.

Not by forking OpenCode into something unrecognizable. Not by adding layers of opinionated AI orchestration on top. But by writing the plugins that should have existed, following OpenCode's own conventions, and staying close enough to upstream that merging is never painful.

## What problem it solves

OpenCode out of the box requires:
- Manual approval of every tool-use permission request
- No visible session context (mode, branch, providers) at a glance
- No friendly error classification when providers fail
- No health check command for diagnosing configuration issues

SpxOpenCode solves each of these with a single plugin that can be disabled.

## What we will NOT add

These are firm limits. Any feature proposal that crosses them is rejected regardless of how useful it seems:

- **No background polling.** Plugins must not run on timers or intervals. Every action starts with a user trigger or an OpenCode event.
- **No constant AI calls.** No feature may issue AI requests without explicit user intent. Token costs belong to the user.
- **No UI reimplementation.** We do not rebuild OpenCode's TUI. We extend it via official slots.
- **No GUI or web interface.** SpxOpenCode lives in the terminal. Always.
- **No cloud sync.** User data stays local. `.spx/` is the only persistence layer.
- **No vendor lock-in.** No feature may require a specific provider, model, or API key beyond what OpenCode already requires.
- **No feature that degrades OpenCode behavior.** If a SpxOpenCode plugin breaks or is disabled, OpenCode must work exactly as it did before.

## How we avoid becoming a Frankenstein

Frankenstein projects happen when:
1. Every contributor adds their favorite feature without a filter
2. Upstream changes break internal hacks that were never meant to be permanent
3. The "plugin" layer grows until it is the application and the original is vestigial

SpxOpenCode prevents this through:

**Plugin-first architecture.** Every SpxOpenCode feature is a `BuiltinTuiPlugin`. Each plugin has an ID, a file, and an `enabled` flag. Nothing is wired deep into OpenCode internals.

**Minimal upstream surface.** Only two OpenCode-owned files are modified: `builtins.ts` (to register plugins) and `keybind.ts` (to add one keybind). Every other change lives in `packages/tui/src/feature-plugins/spx/`.

**No hidden state.** Plugins communicate through `accept-mode-store.ts` (a shared SolidJS signal) or through `api.kv`. No module-level globals, no singleton services.

**Explicit VISION.md.** This document. New contributors read it before proposing features. Maintainers refer to it when reviewing PRs.

## Principles that will never be broken

1. **OpenCode First** — OpenCode compatibility is non-negotiable. Plugins extend; they do not replace.
2. **Plugin First** — If it can be a plugin, it must be a plugin.
3. **User triggers actions** — No autonomous AI calls. The user controls when AI is invoked.
4. **Cost transparency** — Any feature that costs tokens must say so, upfront, every time.
5. **Disableable by default** — Every SpxOpenCode feature can be disabled with one line change.
6. **Local by default** — No network requests without explicit user action.

## How to evaluate a new feature

Ask in order:

1. Does it violate any principle above? → Reject.
2. Does OpenCode already do this, or is it planned? → Reject or wait.
3. Can it be implemented without modifying OpenCode-owned files? → If not, document why and minimize the diff.
4. Does it require background AI calls? → Reject.
5. Can it be disabled without breaking anything? → Must be yes.
6. Does it introduce a new upstream file dependency that will break on OpenCode update? → Rethink.
7. Is there an existing open source tool that does this better? → Integrate instead of reimplement.

If a feature passes all 7 questions, it is a candidate for the roadmap.

## How we maintain compatibility with OpenCode

SpxOpenCode tracks upstream `https://github.com/anomalyco/opencode` on the `main` branch.

When upstream updates:
1. Merge or rebase onto the latest upstream commit
2. Resolve conflicts in `builtins.ts` and `keybind.ts` — both changes are additive, conflicts are mechanical
3. Verify that `packages/tui/src/feature-plugins/spx/` still compiles
4. Run SpxOpenCode plugins manually for a quick smoke test

We do not pin to a specific OpenCode version. We track HEAD. This means we accept occasional breakage in exchange for staying current.

## Long-term goal

SpxOpenCode v1.0 is a stable, well-documented fork that a developer can install instead of vanilla OpenCode and never notice a regression — only improvements.

After v1.0, the goal is to upstream the most universally useful plugins back to OpenCode, making SpxOpenCode itself progressively smaller as its best ideas become part of the platform it extends.
