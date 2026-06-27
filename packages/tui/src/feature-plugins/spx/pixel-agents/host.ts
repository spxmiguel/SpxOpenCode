import type { PixelAgent, PixelAgentId, PixelAgentState } from "./types"
import type { PixelAgentAdapter } from "./adapter"
import type { PixelAgentConfig } from "./config"
import { PixelAgentEventBus, type PixelAgentEvent, type PixelAgentEventType } from "./events"

type Listener = (event: PixelAgentEvent) => void

/**
 * Central host that routes events to registered agents via an adapter.
 * Disabled by default (config.enabled must be true to process any event).
 * Enforces maxEventsPerSession per agent — silently drops events past quota.
 * No AI calls — all intelligence is delegated to the adapter.
 */
export class PixelAgentHost {
  private agents = new Map<PixelAgentId, PixelAgent>()
  private states = new Map<PixelAgentId, PixelAgentState>()
  private bus = new PixelAgentEventBus()
  private disposed = false

  constructor(
    private readonly config: PixelAgentConfig,
    private readonly adapter: PixelAgentAdapter,
  ) {}

  register(agent: PixelAgent): void {
    if (this.disposed) return
    this.agents.set(agent.id, agent)
    this.states.set(agent.id, { agentId: agent.id, eventCount: 0, active: true })
  }

  async receive(event: PixelAgentEvent): Promise<void> {
    if (this.disposed) return
    if (!this.config.enabled) return

    this.bus.publish(event)

    for (const [id, agent] of this.agents) {
      const state = this.states.get(id)!
      if (!state.active) continue
      if (state.eventCount >= this.config.maxEventsPerSession) {
        this.bus.publish({ type: "quota.exceeded", timestamp: Date.now(), payload: { agentId: id } })
        continue
      }

      state.eventCount++
      await this.adapter.react(agent, event, state, this.config)
    }
  }

  on(type: PixelAgentEventType, listener: Listener): () => void {
    return this.bus.on(type, listener)
  }

  getState(agentId: PixelAgentId): PixelAgentState | undefined {
    return this.states.get(agentId)
  }

  getAgent(agentId: PixelAgentId): PixelAgent | undefined {
    return this.agents.get(agentId)
  }

  registeredAgentIds(): PixelAgentId[] {
    return [...this.agents.keys()]
  }

  dispose(): void {
    this.disposed = true
    this.agents.clear()
    this.states.clear()
  }
}
