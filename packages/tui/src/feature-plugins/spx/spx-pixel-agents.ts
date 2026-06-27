import type { TuiPlugin } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { parsePixelAgentConfig } from "./pixel-agents/config"
import { PixelAgentHost } from "./pixel-agents/host"
import { LocalPixelAgentAdapter } from "./pixel-agents/adapter"
import type { PixelAgentEvent, PixelAgentEventType } from "./pixel-agents/events"
import { buildCharacterRegistry, BUILTIN_CHARACTERS } from "./pixel-agents/characters"
import { setPixelAgentsEnabled, setPixelAgentCount, setPixelRecentEvents, pixelRecentEvents } from "./pixel-agents-store"

const id = "spx:pixel-agents"

const PIXEL_CONFIG_KEY = "pixel_agents_config"
const MAX_RECENT_EVENTS = 20

const ALL_EVENT_TYPES: PixelAgentEventType[] = [
  "build.success",
  "build.failed",
  "tests.success",
  "tests.failed",
  "quota.exceeded",
  "provider.changed",
  "session.started",
  "session.finished",
  "loop.started",
  "loop.finished",
  "doctor.completed",
]

export let pixelHost: PixelAgentHost | null = null

const tui: TuiPlugin = async (api) => {
  const rawConfig = api.kv.get(PIXEL_CONFIG_KEY, {})
  const config = parsePixelAgentConfig(rawConfig)

  const characters = buildCharacterRegistry(config.characters)
  const host = new PixelAgentHost(config, new LocalPixelAgentAdapter())
  pixelHost = host

  setPixelAgentsEnabled(config.enabled)
  setPixelAgentCount(host.registeredAgentIds().length)

  for (const type of ALL_EVENT_TYPES) {
    host.on(type, (event: PixelAgentEvent) => {
      setPixelRecentEvents((prev) => {
        const next = [event, ...prev]
        return next.length > MAX_RECENT_EVENTS ? next.slice(0, MAX_RECENT_EVENTS) : next
      })
      setPixelAgentCount(host.registeredAgentIds().length)
    })
  }

  api.command!.register(() => [
    {
      title: "Pixel Agents Panel",
      value: "spx.pixel-agents",
      description: "Show Pixel Agents status, registered agents, and recent events",
      category: "SpxOpenCode",
      slash: { name: "pixel", aliases: ["pixel-agents"] },
      async onSelect() {
        const lines: string[] = ["Pixel Agents", ""]
        lines.push(`Status: ${config.enabled ? "ENABLED" : "DISABLED"}`)
        lines.push(`Mode: ${config.mode}`)
        lines.push(`Max events/session: ${config.maxEventsPerSession}`)
        lines.push("")

        const agentIds = host.registeredAgentIds()
        lines.push(`Registered agents: ${agentIds.length}`)
        if (agentIds.length === 0) {
          lines.push("  (none registered)")
        } else {
          for (const agentId of agentIds) {
            const state = host.getState(agentId)
            const status = state?.active ? "active" : "inactive"
            const eventCount = state?.eventCount ?? 0
            const agent = host.getAgent(agentId)
            const charId = agent?.character
            const char = charId ? characters.get(charId) : undefined
            const charLabel = char ? `  char: ${char.name} (${char.personality.tone ?? "—"})` : ""
            lines.push(`  • ${agentId}  [${status}]  events: ${eventCount}/${config.maxEventsPerSession}${charLabel}`)
          }
        }

        const allCharIds = [...characters.keys()]
        lines.push("")
        lines.push(`Characters (${allCharIds.length}):`)
        for (const charId of allCharIds) {
          const c = characters.get(charId)!
          const traits = c.personality.traits?.join(", ") ?? "—"
          const tone = c.personality.tone ?? "—"
          lines.push(`  • ${c.id}  "${c.name}"  tone: ${tone}  traits: [${traits}]`)
        }
        lines.push("")

        const recent = pixelRecentEvents()
        lines.push(`Recent events (last ${MAX_RECENT_EVENTS}):`)
        if (recent.length === 0) {
          lines.push("  (none)")
        } else {
          for (const evt of recent.slice(0, 10)) {
            const t = new Date(evt.timestamp).toISOString().slice(11, 19)
            lines.push(`  [${t}] ${evt.type}`)
          }
        }

        if (!config.enabled) {
          lines.push("")
          lines.push("To enable: api.kv.set('pixel_agents_config', { enabled: true })")
        }

        await api.attention.notify({
          title: "Pixel Agents",
          message: lines.join("\n"),
          notification: { when: "always" },
        })
      },
    },
  ])
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
