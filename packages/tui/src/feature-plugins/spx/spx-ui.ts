import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import type { TuiPlugin, TuiDialogStack } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { acceptMode } from "./accept-mode-store"
import { loadAllowlist } from "./allowlist"
import { lastPluginLoadResult } from "./spx-plugin-host"

const id = "spx:ui"

function buildConfigReport(projectDir: string): string {
  const lines: string[] = ["SpxOpenCode Configuration", ""]

  // --- Accept mode ---
  const mode = acceptMode()
  const modeDesc: Record<string, string> = {
    manual: "MANUAL  — all tool calls require explicit approval",
    auto: "AUTO    — approves tools matching .spx/allowlist.json, others manual",
    yolo: "YOLO    — approves everything except dangerous patterns",
  }
  lines.push("Accept Mode")
  lines.push(`  ${modeDesc[mode] ?? mode}`)
  lines.push(`  Toggle: shift+tab`)
  lines.push("")

  // --- Allowlist ---
  const allowlist = loadAllowlist(projectDir)
  lines.push("Allowlist  (.spx/allowlist.json)")
  if (allowlist === null) {
    lines.push("  Not configured — AUTO mode will use one-time approvals only")
  } else if (allowlist.patterns.length === 0) {
    lines.push("  File exists but patterns array is empty")
  } else {
    for (const p of allowlist.patterns) {
      lines.push(`  • ${p}`)
    }
  }
  lines.push("")

  // --- Skills ---
  const skillsDir = join(projectDir, "spx", "skills")
  lines.push("Skills  (spx/skills/)")
  if (!existsSync(skillsDir)) {
    lines.push("  Not installed — create spx/skills/ and add .md skill files")
  } else {
    const skillFiles = readdirSync(skillsDir).filter((f) => f.endsWith(".md"))
    if (skillFiles.length === 0) {
      lines.push("  Directory exists but no .md files found")
    } else {
      for (const f of skillFiles) {
        lines.push(`  • ${f}`)
      }
    }
  }
  lines.push("")

  // --- Community plugins ---
  const pluginsDir = join(projectDir, ".spx", "plugins")
  const pluginResult = lastPluginLoadResult()
  lines.push("Community Plugins  (.spx/plugins/)")
  if (!existsSync(pluginsDir)) {
    lines.push("  Not installed — create .spx/plugins/ and add compiled .js plugins")
  } else if (!pluginResult) {
    lines.push("  Directory exists but host plugin has not run yet")
  } else {
    if (pluginResult.plugins.length === 0 && pluginResult.errors.length === 0) {
      lines.push("  No plugins installed")
    }
    for (const { plugin } of pluginResult.plugins) {
      lines.push(`  ✓ ${plugin.id}${plugin.name ? ` — ${plugin.name}` : ""}`)
    }
    for (const { file, reason } of pluginResult.errors) {
      lines.push(`  ✗ ${file}: ${reason}`)
    }
  }
  lines.push("")

  // --- Memory ---
  const memDir = join(projectDir, ".spx", "memory")
  lines.push("Memory  (.spx/memory/)")
  if (!existsSync(memDir)) {
    lines.push("  No session memories yet — run a session to create the first one")
  } else {
    const memFiles = readdirSync(memDir).filter((f) => f.endsWith(".json"))
    if (memFiles.length === 0) {
      lines.push("  Directory exists but no session memories found")
    } else {
      lines.push(`  ${memFiles.length} session memory file(s) — run /recall to view`)
    }
  }
  lines.push("")

  lines.push("Docs: https://github.com/spxmiguel/SpxOpenCode/blob/main/docs/")
  lines.push("Help: /doctor  |  Recall: /recall  |  Health: /doctor")

  return lines.join("\n")
}

const tui: TuiPlugin = async (api) => {
  api.command!.register(() => [
    {
      title: "SpxOpenCode Config",
      value: "spx.config",
      description: "Show current SpxOpenCode settings and plugin status",
      category: "SpxOpenCode",
      slash: { name: "spx", aliases: ["spx-config"] },
      async onSelect(_dialog?: TuiDialogStack) {
        const report = buildConfigReport(api.state.path.directory)
        await api.attention.notify({
          title: "SpxOpenCode Config",
          message: report,
          notification: { when: "always" },
        })
      },
    },
  ])
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
