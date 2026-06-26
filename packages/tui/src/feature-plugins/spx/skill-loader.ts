import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"

const REQUIRED_FIELDS = ["id", "name", "description", "version", "tags"] as const

export type Skill = {
  id: string
  name: string
  description: string
  version: string
  tags: string[]
  body: string
  source: string
}

export type SkillError = {
  source: string
  reason: string
}

export type SkillLoadResult = {
  skills: Skill[]
  errors: SkillError[]
}

function parseFrontmatter(
  content: string,
): { meta: Record<string, string | string[]>; body: string } | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return null

  const meta: Record<string, string | string[]> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const val = line.slice(colonIdx + 1).trim()
    if (val.startsWith("[") && val.endsWith("]")) {
      meta[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    } else {
      meta[key] = val
    }
  }

  return { meta, body: match[2].trim() }
}

export function parseSkill(content: string, source: string): Skill | SkillError {
  const parsed = parseFrontmatter(content)
  if (!parsed) {
    return { source, reason: "missing frontmatter (expected --- ... ---)" }
  }

  const { meta, body } = parsed

  for (const field of REQUIRED_FIELDS) {
    const val = meta[field]
    if (val === undefined || val === null || val === "") {
      return { source, reason: `missing required field: ${field}` }
    }
    if (Array.isArray(val) && val.length === 0) {
      return { source, reason: `missing required field: ${field}` }
    }
  }

  const tags = meta.tags
  return {
    id: meta.id as string,
    name: meta.name as string,
    description: meta.description as string,
    version: meta.version as string,
    tags: Array.isArray(tags) ? tags : [tags as string],
    body,
    source,
  }
}

export async function loadSkillsDir(dirPath: string): Promise<SkillLoadResult> {
  const result: SkillLoadResult = { skills: [], errors: [] }

  let entries: string[]
  try {
    entries = await readdir(dirPath)
  } catch {
    return result
  }

  const mdFiles = entries.filter((f) => f.endsWith(".md"))
  const seenIds = new Map<string, string>()

  for (const file of mdFiles) {
    let content: string
    try {
      content = await readFile(join(dirPath, file), "utf-8")
    } catch (e) {
      result.errors.push({ source: file, reason: `read error: ${String(e)}` })
      continue
    }

    const parsed = parseSkill(content, file)
    if ("reason" in parsed) {
      result.errors.push(parsed)
    } else {
      const existing = seenIds.get(parsed.id)
      if (existing) {
        result.errors.push({
          source: file,
          reason: `duplicate id "${parsed.id}" (first seen in ${existing})`,
        })
      } else {
        seenIds.set(parsed.id, file)
        result.skills.push(parsed)
      }
    }
  }

  return result
}
