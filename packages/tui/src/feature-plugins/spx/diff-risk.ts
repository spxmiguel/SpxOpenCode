export type RiskLevel = "low" | "medium" | "high"

const HIGH_PATTERNS: RegExp[] = [
  /package\.json$/,
  /\.(lock|lockb)$/,
  /package-lock\.json$/,
  /^\.github\//,
  /\/auth(\/|\.)/i,
  /auth\.(ts|js|tsx|jsx)$/i,
  /migration/i,
  /\.env($|\.)/,
  /^Dockerfile/,
  /docker-compose/,
  /\/secrets?\//i,
]

const MEDIUM_PATTERNS: RegExp[] = [
  /\.(ya?ml|toml|ini|cfg|conf)$/,
  /tsconfig/,
  /\/middleware\//i,
  /middleware\.(ts|js|tsx|jsx)$/i,
  /schema\.(ts|js|tsx|jsx|sql|graphql)$/i,
  /\.config\.(ts|js|mjs|cjs)$/,
  /(webpack|vite|rollup|esbuild)\.(config|js|ts)/i,
]

export function classifyRisk(filePath: string): RiskLevel {
  const normalized = filePath.replace(/\\/g, "/")
  if (HIGH_PATTERNS.some((p) => p.test(normalized))) return "high"
  if (MEDIUM_PATTERNS.some((p) => p.test(normalized))) return "medium"
  return "low"
}

export function overallRisk(levels: RiskLevel[]): RiskLevel {
  if (levels.includes("high")) return "high"
  if (levels.includes("medium")) return "medium"
  return "low"
}

export function riskLabel(level: RiskLevel): string {
  switch (level) {
    case "high":
      return "⚠ high"
    case "medium":
      return "~ medium"
    case "low":
      return "✓ low"
  }
}
