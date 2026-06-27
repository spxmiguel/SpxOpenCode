/**
 * Pixel Agents — core type definitions.
 *
 * Foundation layer only: interfaces and value types.
 * No AI calls, no UI, no characters — this file defines the contracts.
 */

/** Unique identifier for a Pixel Agent. Use "vendor:name" style. */
export type PixelAgentId = string

/** Provider mode controls whether (and how) agents may call AI. */
export type PixelAgentProviderMode = "local" | "groq" | "premium"

/**
 * Optional personality hint — shapes tone when a provider is active.
 * Unused in local mode (no AI calls made).
 */
export interface PixelAgentPersonality {
  name: string
  tone?: string
  traits?: string[]
}

/** A single memory entry stored per agent. */
export interface PixelAgentMemory {
  key: string
  value: unknown
  timestamp: number
}

/** A named character definition — display only, no AI calls. */
export interface PixelAgentCharacter {
  id: string
  name: string
  personality: PixelAgentPersonality
}

/** A registered Pixel Agent definition. */
export interface PixelAgent {
  id: PixelAgentId
  name: string
  personality?: PixelAgentPersonality
  /** Character id to look up in the character registry. */
  character?: string
}

/** Live runtime state tracked by the host per agent per session. */
export interface PixelAgentState {
  agentId: PixelAgentId
  eventCount: number
  active: boolean
}

/** An action emitted by an adapter in response to an event. */
export interface PixelAgentAction {
  type: string
  payload?: unknown
}

/** Runtime configuration snapshot passed to adapters. */
export interface PixelAgentRuntime {
  mode: PixelAgentProviderMode
  maxEventsPerSession: number
  persistMemory: boolean
}
