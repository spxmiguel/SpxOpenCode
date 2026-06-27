import type { PixelAgentCharacter } from "./types"

export const BUILTIN_CHARACTERS: PixelAgentCharacter[] = [
  {
    id: "spx:companion",
    name: "Companion",
    personality: {
      name: "Companion",
      tone: "friendly",
      traits: ["helpful", "encouraging", "calm"],
    },
  },
  {
    id: "spx:sentinel",
    name: "Sentinel",
    personality: {
      name: "Sentinel",
      tone: "watchful",
      traits: ["precise", "alert", "concise"],
    },
  },
  {
    id: "spx:sage",
    name: "Sage",
    personality: {
      name: "Sage",
      tone: "thoughtful",
      traits: ["analytical", "patient", "thorough"],
    },
  },
]

const BUILTIN_MAP = new Map(BUILTIN_CHARACTERS.map((c) => [c.id, c]))

/** Build a character registry from builtin definitions merged with user-supplied overrides/additions. */
export function buildCharacterRegistry(
  userChars: PixelAgentCharacter[] = [],
): Map<string, PixelAgentCharacter> {
  const registry = new Map(BUILTIN_MAP)
  for (const c of userChars) {
    if (c.id && c.name) {
      registry.set(c.id, c)
    }
  }
  return registry
}

/** Parse raw config array into validated PixelAgentCharacter list. */
export function parseCharacters(raw: unknown): PixelAgentCharacter[] {
  if (!Array.isArray(raw)) return []
  const result: PixelAgentCharacter[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const r = item as Record<string, unknown>
    if (typeof r.id !== "string" || !r.id) continue
    if (typeof r.name !== "string" || !r.name) continue
    const p = r.personality
    if (!p || typeof p !== "object") continue
    const pr = p as Record<string, unknown>
    if (typeof pr.name !== "string" || !pr.name) continue
    result.push({
      id: r.id,
      name: r.name,
      personality: {
        name: pr.name,
        tone: typeof pr.tone === "string" ? pr.tone : undefined,
        traits: Array.isArray(pr.traits)
          ? pr.traits.filter((t): t is string => typeof t === "string")
          : undefined,
      },
    })
  }
  return result
}
