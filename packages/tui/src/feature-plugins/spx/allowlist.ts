import { readFileSync } from "node:fs"
import { join } from "node:path"

export interface Allowlist {
  patterns: string[]
}

let cached: Allowlist | null | undefined = undefined

function globMatch(pattern: string, value: string): boolean {
  if (!pattern.includes("*")) return pattern === value
  const re = new RegExp("^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$")
  return re.test(value)
}

export function loadAllowlist(projectDir: string): Allowlist | null {
  if (cached !== undefined) return cached
  const path = join(projectDir, ".spx", "allowlist.json")
  try {
    const text = readFileSync(path, "utf-8")
    const data = JSON.parse(text)
    cached = Array.isArray(data?.patterns) ? { patterns: data.patterns } : null
  } catch {
    cached = null
  }
  return cached
}

export function matchesAllowlist(allowlist: Allowlist, toolPatterns: string[]): boolean {
  return toolPatterns.some((tool) => allowlist.patterns.some((entry) => globMatch(entry, tool)))
}
