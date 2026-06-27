import { join } from "node:path"
import { createSignal } from "solid-js"
import type { TuiPlugin, TuiDialogStack } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { loadSkillsDir, type SkillLoadResult } from "./skill-loader"
import { lastPluginLoadResult } from "./spx-plugin-host"
import type { PluginLoadResult } from "./spx-plugin-loader"

export const [lastDoctorOk, setLastDoctorOk] = createSignal<boolean | null>(null)

const id = "spx:doctor"

type CheckResult = {
  name: string
  ok: boolean
  message: string
  fix?: string
}

export function checkPluginsHealth(result: PluginLoadResult | null): CheckResult {
  if (!result) {
    return { name: "Community Plugins", ok: true, message: "Not yet loaded (host plugin pending init)." }
  }
  if (result.plugins.length === 0 && result.errors.length === 0) {
    return { name: "Community Plugins", ok: true, message: "No community plugins installed (.spx/plugins/ empty or missing)." }
  }
  if (result.errors.length > 0 && result.plugins.length === 0) {
    return {
      name: "Community Plugins",
      ok: false,
      message: `All ${result.errors.length} community plugin(s) failed to load.`,
      fix: result.errors.map((e) => `${e.file}: ${e.reason}`).join("; "),
    }
  }
  if (result.errors.length > 0) {
    return {
      name: "Community Plugins",
      ok: false,
      message: `${result.plugins.length} plugin(s) loaded, ${result.errors.length} invalid.`,
      fix: result.errors.map((e) => `${e.file}: ${e.reason}`).join("; "),
    }
  }
  return {
    name: "Community Plugins",
    ok: true,
    message: `${result.plugins.length} plugin(s) loaded: ${result.plugins.map((p) => p.plugin.id).join(", ")}.`,
  }
}

export function checkSkillsHealth(result: SkillLoadResult): CheckResult {
  if (result.skills.length === 0 && result.errors.length === 0) {
    return { name: "Skills", ok: true, message: "No skills installed (spx/skills/ empty)." }
  }
  if (result.errors.length > 0 && result.skills.length === 0) {
    return {
      name: "Skills",
      ok: false,
      message: `Skills dir found but all ${result.errors.length} skill(s) failed to load.`,
      fix: result.errors.map((e) => `${e.source}: ${e.reason}`).join("; "),
    }
  }
  if (result.errors.length > 0) {
    return {
      name: "Skills",
      ok: false,
      message: `${result.skills.length} skill(s) loaded, ${result.errors.length} invalid.`,
      fix: result.errors.map((e) => `${e.source}: ${e.reason}`).join("; "),
    }
  }
  return {
    name: "Skills",
    ok: true,
    message: `${result.skills.length} skill(s) loaded: ${result.skills.map((s) => s.id).join(", ")}.`,
  }
}

async function pingLatency(url: string): Promise<number | null> {
  try {
    const t0 = Date.now()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    await fetch(url, { method: "HEAD", signal: controller.signal }).catch(() => {})
    clearTimeout(timer)
    return Date.now() - t0
  } catch {
    return null
  }
}

async function checkProviders(api: Parameters<TuiPlugin>[0]): Promise<CheckResult[]> {
  const results: CheckResult[] = []
  const providers = api.state.provider

  if (providers.length === 0) {
    results.push({
      name: "Providers",
      ok: false,
      message: "No providers configured.",
      fix: "Run `opencode auth login` to add a provider.",
    })
    return results
  }

  await Promise.all(
    providers.map(async (p) => {
      const models = Object.values(p.models)
      const active = models.filter((m) => m.status === "active").length
      const deprecated = models.filter((m) => m.status === "deprecated").length
      const apiUrl = models[0]?.api?.url ?? null
      const latency = apiUrl ? await pingLatency(apiUrl) : null
      const latencyStr = latency !== null ? `${latency}ms` : "unreachable"
      const modelStr = `${active} active${deprecated > 0 ? `, ${deprecated} deprecated` : ""} of ${models.length} models`
      results.push({
        name: `Provider: ${p.name}`,
        ok: active > 0,
        message: `${modelStr} — latency: ${latencyStr}`,
        fix: active === 0 ? "No active models available for this provider." : undefined,
      })
    }),
  )

  return results
}

async function runChecks(api: Parameters<TuiPlugin>[0]): Promise<CheckResult[]> {
  const results: CheckResult[] = []

  // Providers (v2: per-provider latency + model availability)
  const providerResults = await checkProviders(api)
  results.push(...providerResults)

  // VCS / Git
  const branch = api.state.vcs?.branch
  if (branch) {
    results.push({
      name: "Git",
      ok: true,
      message: `On branch: ${branch}`,
    })
  } else {
    results.push({
      name: "Git",
      ok: false,
      message: "Not inside a git repository (or no branch detected).",
      fix: "Run `git init` or open a project inside a git repo.",
    })
  }

  // MCP
  const mcpItems = api.state.mcp()
  if (mcpItems.length === 0) {
    results.push({
      name: "MCP",
      ok: true,
      message: "No MCP servers configured (optional).",
    })
  } else {
    const failed = mcpItems.filter((m) => m.status === "failed")
    if (failed.length > 0) {
      results.push({
        name: "MCP",
        ok: false,
        message: `${failed.length} MCP server(s) failed: ${failed.map((m) => m.name).join(", ")}`,
        fix: "Check MCP server configuration and restart.",
      })
    } else {
      const connected = mcpItems.filter((m) => m.status === "connected").length
      results.push({
        name: "MCP",
        ok: true,
        message: `${connected}/${mcpItems.length} MCP server(s) connected.`,
      })
    }
  }

  // LSP
  const lspItems = api.state.lsp()
  if (lspItems.length === 0) {
    results.push({
      name: "LSP",
      ok: true,
      message: "No LSP servers configured (optional).",
    })
  } else {
    const failed = lspItems.filter((l) => l.status === "error")
    if (failed.length > 0) {
      results.push({
        name: "LSP",
        ok: false,
        message: `${failed.length} LSP server(s) failed: ${failed.map((l) => l.id).join(", ")}`,
        fix: "Check LSP configuration in opencode.json.",
      })
    } else {
      results.push({
        name: "LSP",
        ok: true,
        message: `${lspItems.length} LSP server(s) running.`,
      })
    }
  }

  const skillsDir = join(process.cwd(), "spx", "skills")
  const skillsResult = await loadSkillsDir(skillsDir)
  results.push(checkSkillsHealth(skillsResult))

  results.push(checkPluginsHealth(lastPluginLoadResult()))

  const problems = results.filter((c) => !c.ok).length
  setLastDoctorOk(problems === 0)

  return results
}

function formatReport(checks: CheckResult[]): string {
  const lines: string[] = ["SpxOpenCode Doctor Report", ""]
  for (const c of checks) {
    const icon = c.ok ? "✓" : "✗"
    lines.push(`${icon} ${c.name}: ${c.message}`)
    if (!c.ok && c.fix) {
      lines.push(`  → ${c.fix}`)
    }
  }
  const problems = checks.filter((c) => !c.ok).length
  lines.push("")
  if (problems === 0) {
    lines.push("All checks passed.")
  } else {
    lines.push(`${problems} problem(s) found.`)
  }
  return lines.join("\n")
}

const tui: TuiPlugin = async (api) => {
  api.command!.register(() => [
    {
      title: "SpxOpenCode Doctor",
      value: "spx.doctor",
      description: "Check providers, git, MCP, LSP health",
      category: "SpxOpenCode",
      slash: { name: "doctor", aliases: ["spx-doctor"] },
      async onSelect(_dialog?: TuiDialogStack) {
        api.ui.toast({
          title: "Doctor",
          message: "Running checks...",
          duration: 1500,
        })

        const checks = await runChecks(api)
        const report = formatReport(checks)
        const problems = checks.filter((c) => !c.ok).length

        await api.attention.notify({
          title: problems === 0 ? "Doctor: All OK" : `Doctor: ${problems} problem(s)`,
          message: report,
          notification: { when: "always" },
        })
      },
    },
  ])
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
