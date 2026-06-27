import { readdirSync } from "node:fs"
import { join } from "node:path"
import type { SpxPlugin } from "./spx-api"

export type PluginLoadError = {
  file: string
  reason: string
}

export type PluginLoadResult = {
  plugins: Array<{ file: string; plugin: SpxPlugin }>
  errors: PluginLoadError[]
}

function isSpxPlugin(value: unknown): value is SpxPlugin {
  if (!value || typeof value !== "object") return false
  const p = value as Record<string, unknown>
  return typeof p["id"] === "string" && typeof p["tui"] === "function"
}

export async function loadPluginsDir(dir: string): Promise<PluginLoadResult> {
  const result: PluginLoadResult = { plugins: [], errors: [] }

  let files: string[]
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".js"))
  } catch {
    // directory doesn't exist — not an error
    return result
  }

  await Promise.all(
    files.map(async (file) => {
      const fullPath = join(dir, file)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = (await import(fullPath)) as { default?: unknown }
        const exported = mod.default

        if (!isSpxPlugin(exported)) {
          result.errors.push({
            file,
            reason: "default export is not a valid SpxPlugin (needs id: string and tui: function)",
          })
          return
        }

        result.plugins.push({ file, plugin: exported })
      } catch (err) {
        result.errors.push({
          file,
          reason: err instanceof Error ? err.message : String(err),
        })
      }
    }),
  )

  return result
}
