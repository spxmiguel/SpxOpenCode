export type RouteReason = "architecture" | "ui" | "research" | "implementation" | "analysis" | "unknown"

export type RouteTarget = {
  providerID: string
  modelID: string
}

export type RouteResult = RouteTarget & {
  reason: RouteReason
  label: string
}

const KEYWORDS: Record<Exclude<RouteReason, "unknown">, string[]> = {
  architecture: ["architect", "refactor", "design", "structure", "module", "interface", "system"],
  ui: ["ui", "ux", "component", "button", "form", "layout", "style", "css", "animation", "visual"],
  research: ["research", "explain", "how does", "what is", "compare", "understand", "why"],
  implementation: ["implement", "add", "build", "create", "fix", "bug", "feature", "function"],
  analysis: ["analyze", "review", "audit", "performance", "metrics", "data", "log", "trace"],
}

const ROUTES: Record<Exclude<RouteReason, "unknown">, RouteTarget> = {
  architecture: { providerID: "anthropic", modelID: "claude-sonnet-4-5" },
  ui: { providerID: "antigravity", modelID: "antigravity-1" },
  research: { providerID: "google", modelID: "gemini-2.0-flash" },
  implementation: { providerID: "openai", modelID: "codex-mini" },
  analysis: { providerID: "deepseek", modelID: "deepseek-chat" },
}

const LABELS: Record<RouteReason, string> = {
  architecture: "architecture/refactor",
  ui: "UI/UX",
  research: "research/explain",
  implementation: "implementation",
  analysis: "analysis",
  unknown: "unknown task type",
}

function classify(prompt: string): RouteReason {
  const lower = prompt.toLowerCase()
  for (const [reason, keywords] of Object.entries(KEYWORDS) as [Exclude<RouteReason, "unknown">, string[]][]) {
    if (keywords.some((kw) => lower.includes(kw))) return reason
  }
  return "unknown"
}

export function route(prompt: string, fallback: RouteTarget): RouteResult {
  const reason = classify(prompt)
  if (reason === "unknown") {
    return { ...fallback, reason, label: LABELS.unknown }
  }
  return { ...ROUTES[reason], reason, label: LABELS[reason] }
}
