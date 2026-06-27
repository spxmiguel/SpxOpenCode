import { mkdirSync, writeFileSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import type { Message } from "@opencode-ai/sdk/v2"
import type { TuiPlugin, TuiDialogStack } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"

const id = "spx:memory"

type AssistantMsg = Extract<Message, { role: "assistant" }>
type UserMsg = Extract<Message, { role: "user" }>

type MemoryEntry = {
  sessionID: string
  title: string
  date: string
  dir: string
  branch: string | null
  messageCount: number
  assistantCount: number
  totalCost: number
  totalTokens: { input: number; output: number }
  models: string[]
  summaries: string[]
  changes: { additions: number; deletions: number; files: number } | null
}

function formatEntry(e: MemoryEntry, index: number): string {
  const lines: string[] = [
    `[${index}] ${e.title || e.sessionID.slice(0, 8)} — ${e.date}`,
    `    Branch: ${e.branch ?? "(none)"}  Messages: ${e.messageCount}  Cost: $${e.totalCost.toFixed(4)}`,
    `    Tokens: ${e.totalTokens.input} in / ${e.totalTokens.output} out`,
    `    Models: ${e.models.join(", ") || "(unknown)"}`,
  ]
  if (e.changes) {
    lines.push(`    Changes: +${e.changes.additions} -${e.changes.deletions} across ${e.changes.files} file(s)`)
  }
  if (e.summaries.length > 0) {
    lines.push(`    Topics:`)
    for (const s of e.summaries) {
      lines.push(`      • ${s}`)
    }
  }
  return lines.join("\n")
}

const tui: TuiPlugin = async (api) => {
  function writeMemory(sessionID: string): void {
    try {
      const dir = api.state.path.directory
      const memDir = join(dir, ".spx", "memory")
      mkdirSync(memDir, { recursive: true })

      const session = api.state.session.get(sessionID)
      const messages = api.state.session.messages(sessionID)

      const assistants = messages.filter((m): m is AssistantMsg => m.role === "assistant")
      const users = messages.filter((m): m is UserMsg => m.role === "user")

      const totalCost = assistants.reduce((sum, m) => sum + m.cost, 0)
      const totalInput = assistants.reduce((sum, m) => sum + m.tokens.input, 0)
      const totalOutput = assistants.reduce((sum, m) => sum + m.tokens.output, 0)
      const models = [...new Set(assistants.map((m) => m.modelID).filter(Boolean))]
      const summaries = users.map((m) => m.summary?.title).filter((t): t is string => Boolean(t))

      const date = new Date().toISOString().slice(0, 10)

      const entry: MemoryEntry = {
        sessionID,
        title: session?.title ?? "",
        date,
        dir,
        branch: api.state.vcs?.branch ?? null,
        messageCount: messages.length,
        assistantCount: assistants.length,
        totalCost,
        totalTokens: { input: totalInput, output: totalOutput },
        models,
        summaries,
        changes: session?.summary
          ? {
              additions: session.summary.additions,
              deletions: session.summary.deletions,
              files: session.summary.files,
            }
          : null,
      }

      // filename includes date + short session id for easy sorting and dedup
      const filename = `${date}-${sessionID.slice(0, 8)}.json`
      writeFileSync(join(memDir, filename), JSON.stringify(entry, null, 2), "utf-8")
    } catch {
      // memory is best-effort — never surface errors to user
    }
  }

  // Write memory whenever session goes idle (AI done responding)
  api.event.on("session.idle", (event) => {
    writeMemory(event.properties.sessionID)
  })

  api.command!.register(() => [
    {
      title: "SpxMemory: Recall Sessions",
      value: "spx.memory.recall",
      description: "Show recent session summaries from .spx/memory/",
      category: "SpxOpenCode",
      slash: { name: "recall", aliases: ["spx-recall"] },
      async onSelect(_dialog?: TuiDialogStack) {
        try {
          const memDir = join(api.state.path.directory, ".spx", "memory")
          const files = readdirSync(memDir)
            .filter((f) => f.endsWith(".json"))
            .sort()
            .reverse()
            .slice(0, 5)

          if (files.length === 0) {
            await api.attention.notify({
              title: "SpxMemory: No memories yet",
              message:
                "No session memories in .spx/memory/\nMemories are written automatically when the AI finishes responding.",
              notification: { when: "always" },
            })
            return
          }

          const entries = files.map((f) => JSON.parse(readFileSync(join(memDir, f), "utf-8")) as MemoryEntry)
          const formatted = entries.map((e, i) => formatEntry(e, i + 1)).join("\n\n")
          const report = [`SpxMemory — last ${entries.length} session(s)`, "", formatted].join("\n")

          await api.attention.notify({
            title: `SpxMemory: ${entries.length} session(s)`,
            message: report,
            notification: { when: "always" },
          })
        } catch {
          await api.attention.notify({
            title: "SpxMemory: Error",
            message: "Could not read .spx/memory/ — run a session first to create memories.",
            notification: { when: "always" },
          })
        }
      },
    },
  ])
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
