# Pixel Agents — Analysis

> This document records the analysis that preceded the Pixel Agents Foundation implementation (Fase 12, 2026-06-27). It exists for future contributors who want to understand why the design is the way it is.

## What "Pixel Agents" means in SpxOpenCode

A Pixel Agent is a lightweight, stateful observer registered in the TUI. It reacts to editor events (build success, test failures, quota exceeded, etc.) and emits structured actions. In the local mode — the only mode active by default — those reactions are fully deterministic and involve zero AI calls.

The name "pixel" reflects the minimal footprint philosophy: agents should be pixel-sized in cost, invisible in normal operation, and visible only when they have something useful to say.

## Why implement this now

The SpxOpenCode plugin API reached stability in v1.0-rc.1. The event system that already existed in OpenCode (build, test, provider events) makes it possible to wire reactive logic without touching OpenCode core. Pixel Agents are the first SpxOpenCode feature that closes that loop: plugin → event → reaction.

The decision was made explicitly by the project owner on 2026-06-27 as a roadmap override (Fase 12). All restrictions from the previous "not on the roadmap" entry remain in effect except for the infrastructure layer described here.

## What was explicitly excluded

These will not be built in this phase or any phase without a new explicit authorization:

- Complete agents with personalities or characters
- Tamagotchi-style companions
- Office Mode / document-aware context injection
- AI-powered speech (no calls to premium providers or Groq in this phase)
- XP / humor systems
- Any UI beyond what already exists

## Design constraints that shaped the implementation

**Zero cost in default state.** `enabled: false` is the default. Nothing runs until the user explicitly opts in. Even when enabled, LOCAL mode makes zero AI calls — all reactions are static switch statements.

**No AI calls at the foundation layer.** The `PixelAgentAdapter` interface is async to allow future providers, but `LocalPixelAgentAdapter` resolves immediately with a deterministic value. No network, no model, no API key required.

**In-memory persistence only.** `InMemoryPixelAgentMemoryStore` uses a plain `Map`. No SQLite, no file I/O, no disk writes. Memory resets on process restart. This matches the zero-dependency philosophy and avoids the permission surface that file writes would open.

**Provider mode is config-controlled, not code-controlled.** The config parser enforces that `mode: "premium"` only resolves if `premiumAllowed: true` is also set. An admin who doesn't set `premiumAllowed` cannot accidentally activate premium AI calls even if they set the mode string.

**Event quota enforced by the host, not the adapter.** `maxEventsPerSession` is checked in `PixelAgentHost.receive()` before the adapter is called. This ensures the cost ceiling is enforced at the infrastructure layer regardless of what adapter is plugged in.

## What the foundation layer provides

The six files under `packages/tui/src/feature-plugins/spx/pixel-agents/`:

| File | Responsibility |
|------|---------------|
| `types.ts` | Core interfaces and branded types |
| `config.ts` | Config parser with safe defaults and mode enforcement |
| `events.ts` | Typed event bus, 11 event types |
| `adapter.ts` | `PixelAgentAdapter` interface + `LocalPixelAgentAdapter` (zero AI) |
| `persistence.ts` | `PixelAgentMemoryStore` interface + `InMemoryPixelAgentMemoryStore` |
| `host.ts` | `PixelAgentHost` — registers agents, routes events, enforces quota |

## What is deliberately missing

- No SpxPlugin wrapper — agents are not yet wired into the plugin lifecycle
- No UI panel — Pixel Agents do not appear in `:spx` or any TUI screen
- No Groq adapter — `PixelAgentProviderMode = "groq"` exists as a type only
- No OpenCode event binding — `host.receive()` is public but nothing calls it yet

These gaps are intentional. The foundation layer defines the contracts. Wiring them into the running system is a separate phase.

## Future phases (planned, not authorized yet)

- **Pixel Agents UI** — visual indicator in SpxStatusBar; `:pixel` TUI panel
- **Tamagotchi System** — personality-driven idle state (requires UI + local state machine)
- **Groq Personality Mode** — optional Groq adapter behind explicit `groqEnabled: true` + API key
