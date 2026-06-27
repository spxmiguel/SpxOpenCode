# Pixel Agents — Architecture

> Foundation layer only. Agents are not yet wired into the plugin lifecycle or UI.

## Overview

Pixel Agents are lightweight, stateful observers that react to editor events. They are:

- **Disabled by default** — `config.enabled` must be explicitly set to `true`
- **Zero cost in LOCAL mode** — no AI calls, no network, no API key
- **In-process only** — no background threads, no file I/O, no SQLite

## Module map

```
packages/tui/src/feature-plugins/spx/pixel-agents/
├── types.ts        — core interfaces
├── config.ts       — config parser with safe defaults
├── events.ts       — typed event bus
├── adapter.ts      — adapter interface + LocalPixelAgentAdapter
├── persistence.ts  — memory store interface + InMemoryPixelAgentMemoryStore
└── host.ts         — PixelAgentHost: registers agents, routes events, enforces quota
```

## Data flow

```
External event
      │
      ▼
PixelAgentHost.receive(event)
      │
      ├─── disabled? → return
      │
      ├─── publish to PixelAgentEventBus (for external listeners via host.on())
      │
      └─── for each registered agent:
               │
               ├─── eventCount >= maxEventsPerSession? → emit quota.exceeded, skip
               │
               └─── adapter.react(agent, event, state, config)
                         │
                         ▼
                    PixelAgentAction | null
```

## Provider modes

| Mode | AI calls | Requires |
|------|----------|----------|
| `local` | None | Nothing |
| `groq` | Groq API | `groqEnabled: true` + `groqApiKey` |
| `premium` | Premium model | `premiumAllowed: true` |

`local` is the default and the only mode with a shipping implementation. Groq and premium modes are typed but have no adapter implementation yet.

## Config defaults

```typescript
{
  enabled: false,           // must opt in explicitly
  mode: "local",            // zero AI calls
  premiumAllowed: false,    // premium blocked
  groqEnabled: false,       // Groq blocked
  maxEventsPerSession: 50,  // hard cap per agent
  persistMemory: false,     // RAM only
}
```

## Safety invariants

1. `mode: "premium"` with `premiumAllowed: false` is silently downgraded to `"local"` by the config parser.
2. `maxEventsPerSession` is enforced by `PixelAgentHost.receive()` before the adapter is called — no adapter can bypass it.
3. `PixelAgentHost` with `config.enabled === false` returns immediately from `receive()` without touching agents.

## Extending

To add a new adapter (e.g., Groq):

```typescript
import type { PixelAgentAdapter } from "./adapter"

class GroqPixelAgentAdapter implements PixelAgentAdapter {
  async react(agent, event, state, config): Promise<PixelAgentAction | null> {
    if (!config.groqEnabled || !config.groqApiKey) return null
    // ... call Groq API
  }
}
```

To add a new event type, extend `PixelAgentEventType` in `events.ts`.

To add persistent memory, implement `PixelAgentMemoryStore` (e.g., SQLite-backed).
