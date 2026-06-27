import { createSignal } from "solid-js"
import type { PixelAgentEvent } from "./pixel-agents/events"

export const [pixelAgentsEnabled, setPixelAgentsEnabled] = createSignal(false)
export const [pixelAgentCount, setPixelAgentCount] = createSignal(0)
export const [pixelRecentEvents, setPixelRecentEvents] = createSignal<PixelAgentEvent[]>([])
