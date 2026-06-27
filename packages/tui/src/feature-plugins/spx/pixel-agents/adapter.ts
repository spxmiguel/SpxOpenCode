import type { PixelAgent, PixelAgentAction, PixelAgentState } from "./types"
import type { PixelAgentEvent } from "./events"
import type { PixelAgentConfig } from "./config"

/** Contract all adapters must implement. */
export interface PixelAgentAdapter {
  react(
    agent: PixelAgent,
    event: PixelAgentEvent,
    state: PixelAgentState,
    config: PixelAgentConfig,
  ): Promise<PixelAgentAction | null>
}

/**
 * Local adapter — deterministic reactions, zero AI calls.
 * Maps event types to structured actions with no external I/O.
 */
export class LocalPixelAgentAdapter implements PixelAgentAdapter {
  async react(
    _agent: PixelAgent,
    event: PixelAgentEvent,
    _state: PixelAgentState,
    _config: PixelAgentConfig,
  ): Promise<PixelAgentAction | null> {
    switch (event.type) {
      case "build.success":
        return { type: "react.build_success" }
      case "build.failed":
        return { type: "react.build_failed" }
      case "tests.success":
        return { type: "react.tests_success" }
      case "tests.failed":
        return { type: "react.tests_failed" }
      case "quota.exceeded":
        return { type: "react.quota_exceeded" }
      case "doctor.completed":
        return { type: "react.doctor_completed" }
      default:
        return null
    }
  }
}
