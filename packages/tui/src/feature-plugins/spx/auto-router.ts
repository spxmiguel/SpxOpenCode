export type RouteReason = "architecture" | "ui" | "research" | "implementation" | "analysis" | "unknown"

export type RouteTarget = {
  providerID: string
  modelID: string
}

export type RouteResult = RouteTarget & {
  reason: RouteReason
  label: string
}

export type AvailableProvider = {
  providerID: string
  modelIDs: string[]
}

const KEYWORDS: Record<Exclude<RouteReason, "unknown">, string[]> = {
  architecture: ["architect", "refactor", "design", "structure", "module", "interface", "system"],
  ui: ["ui", "ux", "component", "button", "form", "layout", "style", "css", "animation", "visual"],
  research: ["research", "explain", "how does", "what is", "compare", "understand", "why"],
  implementation: ["implement", "add", "build", "create", "fix", "bug", "feature", "function"],
  analysis: ["analyze", "review", "audit", "performance", "metrics", "data", "log", "trace"],
}

// Ordered preference list per reason — first available match wins.
// Never hardcodes a single provider; always falls through to alternatives.
const PRIORITY: Record<Exclude<RouteReason, "unknown">, Array<RouteTarget>> = {
  architecture: [
    { providerID: "anthropic", modelID: "claude-opus-4-8" },
    { providerID: "anthropic", modelID: "claude-sonnet-4-6" },
    { providerID: "anthropic", modelID: "claude-sonnet-4-5" },
    { providerID: "anthropic", modelID: "claude-haiku-4-5" },
    { providerID: "google", modelID: "gemini-2.0-flash" },
    { providerID: "openai", modelID: "gpt-4o" },
  ],
  ui: [
    { providerID: "anthropic", modelID: "claude-sonnet-4-6" },
    { providerID: "anthropic", modelID: "claude-sonnet-4-5" },
    { providerID: "google", modelID: "gemini-2.0-flash" },
    { providerID: "openai", modelID: "gpt-4o" },
  ],
  research: [
    { providerID: "google", modelID: "gemini-2.5-pro" },
    { providerID: "google", modelID: "gemini-2.0-flash" },
    { providerID: "anthropic", modelID: "claude-sonnet-4-6" },
    { providerID: "anthropic", modelID: "claude-sonnet-4-5" },
    { providerID: "openai", modelID: "gpt-4o" },
  ],
  implementation: [
    { providerID: "openai", modelID: "gpt-4o" },
    { providerID: "openai", modelID: "gpt-4" },
    { providerID: "anthropic", modelID: "claude-sonnet-4-6" },
    { providerID: "anthropic", modelID: "claude-sonnet-4-5" },
    { providerID: "google", modelID: "gemini-2.0-flash" },
  ],
  analysis: [
    { providerID: "anthropic", modelID: "claude-sonnet-4-6" },
    { providerID: "anthropic", modelID: "claude-sonnet-4-5" },
    { providerID: "openai", modelID: "gpt-4o" },
    { providerID: "google", modelID: "gemini-2.0-flash" },
  ],
}

const LABELS: Record<RouteReason, string> = {
  architecture: "architecture/refactor",
  ui: "UI/UX",
  research: "research/explain",
  implementation: "implementation",
  analysis: "analysis",
  unknown: "unknown task type",
}

export function classify(prompt: string): RouteReason {
  const lower = prompt.toLowerCase()
  for (const [reason, keywords] of Object.entries(KEYWORDS) as [Exclude<RouteReason, "unknown">, string[]][]) {
    if (keywords.some((kw) => (kw.includes(" ") ? lower.includes(kw) : new RegExp(`\\b${kw}\\b`).test(lower)))) return reason
  }
  return "unknown"
}

/**
 * Select the best available model for a prompt.
 * Never picks an unavailable provider — only selects from `available`.
 * Falls back to any active model when the priority list has no match.
 */
export function routeWithProviders(
  prompt: string,
  available: AvailableProvider[],
  fallback: RouteTarget,
): RouteResult {
  const reason = classify(prompt)
  const label = LABELS[reason]

  if (reason === "unknown" || available.length === 0) {
    return { ...fallback, reason, label }
  }

  // Walk priority list — first entry whose provider+model is available wins
  for (const candidate of PRIORITY[reason]) {
    const p = available.find((a) => a.providerID === candidate.providerID)
    if (p && p.modelIDs.includes(candidate.modelID)) {
      return { providerID: candidate.providerID, modelID: candidate.modelID, reason, label }
    }
  }

  // Priority list had no match — pick any active model from any available provider
  for (const p of available) {
    if (p.modelIDs.length > 0) {
      return { providerID: p.providerID, modelID: p.modelIDs[0]!, reason, label }
    }
  }

  // No active models anywhere — stay on current
  return { ...fallback, reason, label }
}

/** Build AvailableProvider list from api.state.provider (active models only). */
export function buildAvailableProviders(
  providers: Array<{ name: string; models: Record<string, { status: string }> }>,
): AvailableProvider[] {
  return providers
    .map((p) => ({
      providerID: p.name,
      modelIDs: Object.entries(p.models)
        .filter(([, m]) => m.status === "active")
        .map(([id]) => id),
    }))
    .filter((p) => p.modelIDs.length > 0)
}

/**
 * Legacy wrapper — routes without availability context.
 * Kept for unit tests; prefer routeWithProviders in production.
 */
export function route(prompt: string, fallback: RouteTarget): RouteResult {
  const reason = classify(prompt)
  const label = LABELS[reason]
  if (reason === "unknown") return { ...fallback, reason, label }
  const first = PRIORITY[reason][0]!
  return { providerID: first.providerID, modelID: first.modelID, reason, label }
}
