# Pixel Agents — API Reference

All types and classes exported from the `pixel-agents/` module.

## Types (`types.ts`)

### `PixelAgentId`
```typescript
type PixelAgentId = string
```
Unique agent identifier. Convention: `"vendor:name"` (e.g., `"spx:companion"`).

### `PixelAgentProviderMode`
```typescript
type PixelAgentProviderMode = "local" | "groq" | "premium"
```
Controls whether agents may call AI. Only `"local"` has a shipping implementation.

### `PixelAgent`
```typescript
interface PixelAgent {
  id: PixelAgentId
  name: string
  personality?: PixelAgentPersonality
}
```

### `PixelAgentPersonality`
```typescript
interface PixelAgentPersonality {
  name: string
  tone?: string
  traits?: string[]
}
```
Personality hint — consumed by AI adapters only. Unused in LOCAL mode.

### `PixelAgentMemory`
```typescript
interface PixelAgentMemory {
  key: string
  value: unknown
  timestamp: number
}
```
Single memory entry scoped to an agent.

### `PixelAgentState`
```typescript
interface PixelAgentState {
  agentId: PixelAgentId
  eventCount: number
  active: boolean
}
```
Live runtime state tracked per agent per session.

### `PixelAgentAction`
```typescript
interface PixelAgentAction {
  type: string
  payload?: unknown
}
```
Action emitted by an adapter in response to an event.

### `PixelAgentRuntime`
```typescript
interface PixelAgentRuntime {
  mode: PixelAgentProviderMode
  maxEventsPerSession: number
  persistMemory: boolean
}
```

---

## Config (`config.ts`)

### `PixelAgentConfig`
```typescript
interface PixelAgentConfig {
  enabled: boolean
  mode: PixelAgentProviderMode
  premiumAllowed: boolean
  groqEnabled: boolean
  groqApiKey?: string
  maxEventsPerSession: number
  persistMemory: boolean
}
```

### `parsePixelAgentConfig(raw: unknown): PixelAgentConfig`
Parses an unknown config object with safe defaults. Enforces: premium mode requires `premiumAllowed: true`; negative or zero `maxEventsPerSession` falls back to 50.

---

## Events (`events.ts`)

### `PixelAgentEventType`
Union of 11 string literals. See [pixel-events.md](./pixel-events.md) for the full list.

### `PixelAgentEvent`
```typescript
interface PixelAgentEvent {
  type: PixelAgentEventType
  timestamp: number
  payload?: unknown
}
```

### `class PixelAgentEventBus`
In-process typed event bus.

| Method | Signature | Description |
|--------|-----------|-------------|
| `on` | `(type, listener) => () => void` | Subscribe; returns unsubscribe fn |
| `off` | `(type, listener) => void` | Unsubscribe |
| `publish` | `(event) => void` | Deliver event to all listeners of that type |
| `listenerCount` | `(type) => number` | Number of active listeners for a type |

---

## Adapter (`adapter.ts`)

### `PixelAgentAdapter` (interface)
```typescript
interface PixelAgentAdapter {
  react(
    agent: PixelAgent,
    event: PixelAgentEvent,
    state: PixelAgentState,
    config: PixelAgentConfig,
  ): Promise<PixelAgentAction | null>
}
```

### `class LocalPixelAgentAdapter`
Implements `PixelAgentAdapter`. Deterministic, zero AI calls. Returns `null` for unhandled event types.

---

## Persistence (`persistence.ts`)

### `PixelAgentMemoryStore` (interface)
All methods are async (permits future SQLite/file backends).

| Method | Signature |
|--------|-----------|
| `get` | `(agentId, key) => Promise<PixelAgentMemory \| undefined>` |
| `set` | `(agentId, memory) => Promise<void>` |
| `delete` | `(agentId, key) => Promise<void>` |
| `list` | `(agentId) => Promise<PixelAgentMemory[]>` |
| `clear` | `(agentId) => Promise<void>` |

### `class InMemoryPixelAgentMemoryStore`
RAM-only implementation. Uses compound keys `"${agentId}::${key}"`. Resets on process restart.

Additional method: `size(): number` — total entries across all agents.

---

## Host (`host.ts`)

### `class PixelAgentHost`
```typescript
constructor(config: PixelAgentConfig, adapter: PixelAgentAdapter)
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `register` | `(agent: PixelAgent) => void` | Register an agent |
| `receive` | `(event: PixelAgentEvent) => Promise<void>` | Route event to all agents |
| `on` | `(type, listener) => () => void` | Subscribe to internal event bus |
| `getState` | `(agentId) => PixelAgentState \| undefined` | Read live state |
| `registeredAgentIds` | `() => PixelAgentId[]` | List registered IDs |
| `dispose` | `() => void` | Tear down; clears all state |

`receive()` is a no-op if `config.enabled === false` or after `dispose()`.
