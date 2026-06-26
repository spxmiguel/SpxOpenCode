import { join } from "node:path"
import type { TuiPlugin, TuiDialogStack } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { loadSkillsDir, type SkillLoadResult } from "./skill-loader"

const id = "spx:doctor"

type CheckResult = {
  name: string
  ok: boolean
  message: string
  fix?: string
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

async function runChecks(api: Parameters<TuiPlugin>[0]): Promise<CheckResult[]> {
  const results: CheckResult[] = []

  // Providers
  const providers = api.state.provider
  if (providers.length === 0) {
    results.push({
      name: "Providers",
      ok: false,
      message: "No providers configured.",
      fix: "Run `opencode auth login` to add a provider.",
    })
  } else {
    results.push({
      name: "Providers",
      ok: true,
      message: `${providers.length} provider(s) configured.`,
    })
  }

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
