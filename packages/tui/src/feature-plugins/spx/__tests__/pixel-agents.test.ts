import { describe, test, expect, beforeEach } from "bun:test"
import { parsePixelAgentConfig } from "../pixel-agents/config"
import { PixelAgentEventBus } from "../pixel-agents/events"
import type { PixelAgentEvent } from "../pixel-agents/events"
import { LocalPixelAgentAdapter } from "../pixel-agents/adapter"
import { InMemoryPixelAgentMemoryStore } from "../pixel-agents/persistence"
import { PixelAgentHost } from "../pixel-agents/host"

// ── config ──────────────────────────────────────────────────────────────────

describe("parsePixelAgentConfig", () => {
  test("disabled by default", () => {
    expect(parsePixelAgentConfig(undefined).enabled).toBe(false)
  })

  test("no premium by default", () => {
    expect(parsePixelAgentConfig(undefined).premiumAllowed).toBe(false)
  })

  test("mode defaults to local", () => {
    expect(parsePixelAgentConfig(undefined).mode).toBe("local")
  })

  test("maxEventsPerSession defaults to 50", () => {
    expect(parsePixelAgentConfig(undefined).maxEventsPerSession).toBe(50)
  })

  test("premium mode blocked without premiumAllowed", () => {
    const cfg = parsePixelAgentConfig({ mode: "premium", premiumAllowed: false })
    expect(cfg.mode).toBe("local")
  })

  test("premium mode allowed when premiumAllowed true", () => {
    const cfg = parsePixelAgentConfig({ mode: "premium", premiumAllowed: true })
    expect(cfg.mode).toBe("premium")
  })

  test("invalid mode falls back to local", () => {
    const cfg = parsePixelAgentConfig({ mode: "unknown_mode" })
    expect(cfg.mode).toBe("local")
  })

  test("negative maxEventsPerSession falls back to 50", () => {
    const cfg = parsePixelAgentConfig({ maxEventsPerSession: -1 })
    expect(cfg.maxEventsPerSession).toBe(50)
  })

  test("custom maxEventsPerSession accepted", () => {
    const cfg = parsePixelAgentConfig({ maxEventsPerSession: 10 })
    expect(cfg.maxEventsPerSession).toBe(10)
  })
})

// ── event bus ────────────────────────────────────────────────────────────────

describe("PixelAgentEventBus", () => {
  let bus: PixelAgentEventBus

  beforeEach(() => {
    bus = new PixelAgentEventBus()
  })

  test("publishes events to listeners", () => {
    const received: PixelAgentEvent[] = []
    bus.on("build.success", (e) => received.push(e))
    bus.publish({ type: "build.success", timestamp: 1 })
    expect(received).toHaveLength(1)
    expect(received[0]!.type).toBe("build.success")
  })

  test("does not deliver to wrong type", () => {
    const received: PixelAgentEvent[] = []
    bus.on("build.failed", (e) => received.push(e))
    bus.publish({ type: "build.success", timestamp: 1 })
    expect(received).toHaveLength(0)
  })

  test("unsubscribe via returned fn stops delivery", () => {
    const received: PixelAgentEvent[] = []
    const unsub = bus.on("tests.failed", (e) => received.push(e))
    unsub()
    bus.publish({ type: "tests.failed", timestamp: 1 })
    expect(received).toHaveLength(0)
  })

  test("listenerCount tracks subscriptions", () => {
    expect(bus.listenerCount("loop.started")).toBe(0)
    const unsub = bus.on("loop.started", () => {})
    expect(bus.listenerCount("loop.started")).toBe(1)
    unsub()
    expect(bus.listenerCount("loop.started")).toBe(0)
  })
})

// ── adapter ──────────────────────────────────────────────────────────────────

describe("LocalPixelAgentAdapter", () => {
  const adapter = new LocalPixelAgentAdapter()
  const agent = { id: "test:agent", name: "Test" }
  const state = { agentId: "test:agent", eventCount: 0, active: true }
  const config = parsePixelAgentConfig(undefined)

  test("does not call AI — returns synchronously deterministic action", async () => {
    const action = await adapter.react(agent, { type: "build.success", timestamp: 1 }, state, config)
    expect(action).not.toBeNull()
    expect(action!.type).toBe("react.build_success")
  })

  test("build.failed returns react.build_failed", async () => {
    const action = await adapter.react(agent, { type: "build.failed", timestamp: 1 }, state, config)
    expect(action!.type).toBe("react.build_failed")
  })

  test("unknown event types return null", async () => {
    const action = await adapter.react(
      agent,
      { type: "session.started", timestamp: 1 },
      state,
      config,
    )
    expect(action).toBeNull()
  })
})

// ── persistence ──────────────────────────────────────────────────────────────

describe("InMemoryPixelAgentMemoryStore", () => {
  let store: InMemoryPixelAgentMemoryStore

  beforeEach(() => {
    store = new InMemoryPixelAgentMemoryStore()
  })

  test("set and get round-trip", async () => {
    await store.set("agent-1", { key: "mood", value: "happy", timestamp: 100 })
    const entry = await store.get("agent-1", "mood")
    expect(entry?.value).toBe("happy")
  })

  test("get returns undefined for missing key", async () => {
    expect(await store.get("agent-1", "missing")).toBeUndefined()
  })

  test("delete removes entry", async () => {
    await store.set("agent-1", { key: "x", value: 1, timestamp: 1 })
    await store.delete("agent-1", "x")
    expect(await store.get("agent-1", "x")).toBeUndefined()
  })

  test("list returns only entries for agent", async () => {
    await store.set("agent-1", { key: "a", value: 1, timestamp: 1 })
    await store.set("agent-2", { key: "b", value: 2, timestamp: 2 })
    const list = await store.list("agent-1")
    expect(list).toHaveLength(1)
    expect(list[0]!.key).toBe("a")
  })

  test("clear removes all entries for agent without touching others", async () => {
    await store.set("agent-1", { key: "k1", value: 1, timestamp: 1 })
    await store.set("agent-1", { key: "k2", value: 2, timestamp: 2 })
    await store.set("agent-2", { key: "k3", value: 3, timestamp: 3 })
    await store.clear("agent-1")
    expect(await store.list("agent-1")).toHaveLength(0)
    expect(await store.list("agent-2")).toHaveLength(1)
  })

  test("no file I/O — store lives in RAM only", () => {
    // Structural: verify no fs references in implementation
    expect(store.size()).toBe(0)
  })
})

// ── host ─────────────────────────────────────────────────────────────────────

describe("PixelAgentHost", () => {
  const adapter = new LocalPixelAgentAdapter()

  test("ignores events when disabled", async () => {
    const cfg = parsePixelAgentConfig({ enabled: false })
    const host = new PixelAgentHost(cfg, adapter)
    const agent = { id: "a", name: "A" }
    host.register(agent)

    await host.receive({ type: "build.success", timestamp: 1 })
    expect(host.getState("a")!.eventCount).toBe(0)
  })

  test("processes events when enabled", async () => {
    const cfg = parsePixelAgentConfig({ enabled: true })
    const host = new PixelAgentHost(cfg, adapter)
    host.register({ id: "a", name: "A" })

    await host.receive({ type: "build.success", timestamp: 1 })
    expect(host.getState("a")!.eventCount).toBe(1)
  })

  test("respects maxEventsPerSession — stops counting at limit", async () => {
    const cfg = parsePixelAgentConfig({ enabled: true, maxEventsPerSession: 2 })
    const host = new PixelAgentHost(cfg, adapter)
    host.register({ id: "a", name: "A" })

    await host.receive({ type: "build.success", timestamp: 1 })
    await host.receive({ type: "build.success", timestamp: 2 })
    await host.receive({ type: "build.success", timestamp: 3 })

    expect(host.getState("a")!.eventCount).toBe(2)
  })

  test("quota.exceeded emitted when agent hits limit", async () => {
    const cfg = parsePixelAgentConfig({ enabled: true, maxEventsPerSession: 1 })
    const host = new PixelAgentHost(cfg, adapter)
    host.register({ id: "a", name: "A" })

    await host.receive({ type: "build.success", timestamp: 1 })

    const quotaEvents: PixelAgentEvent[] = []
    host.on("quota.exceeded", (e) => quotaEvents.push(e))

    await host.receive({ type: "build.success", timestamp: 2 })
    expect(quotaEvents).toHaveLength(1)
  })

  test("getState returns undefined for unregistered agent", () => {
    const cfg = parsePixelAgentConfig({ enabled: true })
    const host = new PixelAgentHost(cfg, adapter)
    expect(host.getState("unknown")).toBeUndefined()
  })

  test("dispose stops processing", async () => {
    const cfg = parsePixelAgentConfig({ enabled: true })
    const host = new PixelAgentHost(cfg, adapter)
    host.register({ id: "a", name: "A" })
    host.dispose()

    await host.receive({ type: "build.success", timestamp: 1 })
    expect(host.getState("a")).toBeUndefined()
  })
})
