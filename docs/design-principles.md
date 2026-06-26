# Design Principles

These are the principles that guide every architectural decision in SpxOpenCode. When there is a conflict between two good ideas, these principles are the tiebreaker.

## OpenCode First

OpenCode compatibility is non-negotiable. Every SpxOpenCode feature must work without degrading OpenCode's behavior. If a plugin breaks, OpenCode continues working. If an upstream change breaks a plugin, the plugin is the thing that changes — not a workaround that patches OpenCode internals.

*Implication:* We do not maintain a fork of OpenCode's core logic. We register plugins and add keybinds.

## Plugin First

If a feature can be a plugin, it must be a plugin. No feature gets hardcoded into core unless the plugin API genuinely cannot support it.

*Implication:* Every SPX feature has an `enabled` flag and an independent file. Disabling it is one line.

## Performance First

SpxOpenCode must not be perceptibly slower than OpenCode. Plugins run on events, not timers. No background work.

*Implication:* No polling, no intervals, no scheduled tasks. Startup time is not increased by plugin registration.

## UX First

When a feature degrades the user experience — even slightly — it does not ship. This includes: visual noise, slower responses, unexpected popups, modes the user didn't opt into.

*Implication:* Default configuration is conservative. New capabilities require explicit opt-in.

## Optional Everything

Every feature is optional. SpxOpenCode with all plugins disabled is identical to OpenCode. SpxOpenCode with one plugin disabled still works correctly.

*Implication:* Plugins cannot depend on each other at runtime. Shared state is opt-in (the accept-mode store is an exception because both auto-accept and status bar need it — documented explicitly).

## Zero Vendor Lock-in

No SpxOpenCode feature may require a specific provider, model, API key, or cloud service beyond what OpenCode requires.

*Implication:* Fallback handler works identically across all providers. Status bar shows the count OpenCode reports, regardless of which providers are active.

## Low Token Cost

SpxOpenCode must not increase token usage. No feature issues AI requests autonomously. No feature adds system prompt overhead by default.

*Implication:* Companions (if implemented) run locally by default. AI-powered companion features require explicit opt-in and a separately configured API key.

## Minimal Core Changes

Upstream OpenCode files modified: two (`builtins.ts`, `keybind.ts`). This number must not grow without strong justification and explicit documentation of why.

*Implication:* When a new feature seems to require touching a third upstream file, that is a signal to rethink the approach.

## Upstream Friendly

SpxOpenCode changes must be mergeable. When OpenCode releases an update, syncing forward should be a 5-minute operation, not a day of conflict resolution.

*Implication:* Changes to `builtins.ts` and `keybind.ts` are purely additive. No line is removed. No logic is restructured. Only new entries are added.
