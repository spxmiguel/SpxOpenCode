import type { PixelAgentProviderMode } from "./types"

export interface PixelAgentConfig {
  enabled: boolean
  mode: PixelAgentProviderMode
  premiumAllowed: boolean
  groqEnabled: boolean
  groqApiKey?: string
  maxEventsPerSession: number
  persistMemory: boolean
}

const DEFAULTS: PixelAgentConfig = {
  enabled: false,
  mode: "local",
  premiumAllowed: false,
  groqEnabled: false,
  maxEventsPerSession: 50,
  persistMemory: false,
}

const VALID_MODES: PixelAgentProviderMode[] = ["local", "groq", "premium"]

export function parsePixelAgentConfig(raw: unknown): PixelAgentConfig {
  if (!raw || typeof raw !== "object") return { ...DEFAULTS }
  const r = raw as Record<string, unknown>

  const mode: PixelAgentProviderMode =
    VALID_MODES.includes(r.mode as PixelAgentProviderMode)
      ? (r.mode as PixelAgentProviderMode)
      : DEFAULTS.mode

  // premium mode requires explicit opt-in via premiumAllowed
  const premiumAllowed = typeof r.premiumAllowed === "boolean" ? r.premiumAllowed : DEFAULTS.premiumAllowed
  const resolvedMode: PixelAgentProviderMode =
    mode === "premium" && !premiumAllowed ? "local" : mode

  return {
    enabled: typeof r.enabled === "boolean" ? r.enabled : DEFAULTS.enabled,
    mode: resolvedMode,
    premiumAllowed,
    groqEnabled: typeof r.groqEnabled === "boolean" ? r.groqEnabled : DEFAULTS.groqEnabled,
    groqApiKey: typeof r.groqApiKey === "string" ? r.groqApiKey : undefined,
    maxEventsPerSession:
      typeof r.maxEventsPerSession === "number" && r.maxEventsPerSession > 0
        ? Math.floor(r.maxEventsPerSession)
        : DEFAULTS.maxEventsPerSession,
    persistMemory: typeof r.persistMemory === "boolean" ? r.persistMemory : DEFAULTS.persistMemory,
  }
}
