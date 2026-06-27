# Pixel Events — Reference

All 11 event types understood by the Pixel Agent system.

## Event structure

```typescript
interface PixelAgentEvent {
  type: PixelAgentEventType
  timestamp: number   // Date.now()
  payload?: unknown   // event-specific data
}
```

## Event types

| Type | When emitted | Typical `payload` |
|------|-------------|------------------|
| `build.success` | Build/compile succeeded | — |
| `build.failed` | Build/compile failed | error info |
| `tests.success` | Test run passed | — |
| `tests.failed` | Test run failed | failure summary |
| `quota.exceeded` | Agent hit `maxEventsPerSession` | `{ agentId }` |
| `provider.changed` | Active AI provider switched | provider name |
| `session.started` | New editor session began | — |
| `session.finished` | Editor session ended | — |
| `loop.started` | Agentic loop started | — |
| `loop.finished` | Agentic loop finished | — |
| `doctor.completed` | `:doctor` command finished | health summary |

## LocalPixelAgentAdapter reactions

In LOCAL mode, the adapter maps events to deterministic actions:

| Event | Action type |
|-------|------------|
| `build.success` | `react.build_success` |
| `build.failed` | `react.build_failed` |
| `tests.success` | `react.tests_success` |
| `tests.failed` | `react.tests_failed` |
| `quota.exceeded` | `react.quota_exceeded` |
| `doctor.completed` | `react.doctor_completed` |
| All others | `null` (no reaction) |

## Subscribing to events

```typescript
// via PixelAgentHost (recommended)
const unsub = host.on("build.failed", (event) => {
  console.log("build failed at", event.timestamp)
})
unsub() // unsubscribe

// via PixelAgentEventBus directly
const bus = new PixelAgentEventBus()
bus.on("tests.success", handler)
bus.publish({ type: "tests.success", timestamp: Date.now() })
```

## Publishing events (future integration)

The host's `receive()` method is the entry point. It is not yet wired to any OpenCode lifecycle hook. Future integration:

```typescript
// in a SpxPlugin.setup():
api.event.on("build:success", () => {
  host.receive({ type: "build.success", timestamp: Date.now() })
})
```
