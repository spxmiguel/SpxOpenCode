import type { TuiPlugin } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { ACCEPT_MODE_KEY, setAcceptMode, acceptMode, type AcceptMode } from "./accept-mode-store"
import { loadAllowlist, matchesAllowlist } from "./allowlist"

const id = "spx:auto-accept"

const DANGER_PATTERNS = [
  /rm\s+-[rRfF]*[rR][fF]?/i,
  /\bsudo\b/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  />>\s*\/dev\//i,
  /:\s*>\s*\//i,
  /\bfdisk\b/i,
  /\bparted\b/i,
  /\bshred\b/i,
  /\bwipefs\b/i,
  /del\s+\/[sqf]/i,
  /rmdir\s+\/[sq]/i,
  /\brd\s+\/[sq]/i,
  /\bdiskpart\b/i,
  /format\s+[a-zA-Z]:/i,
  /\/(etc|usr|bin|boot|dev|proc|sys|lib)(\/|$)/,
  /\/[Ss]ystem\//,
  /\/[Ll]ibrary\//,
  /[Cc]:[/\\][Ww]indows[/\\]/,
  /[Cc]:[/\\][Ss]ystem32[/\\]/,
  /[Cc]:[/\\][Pp]rogram [Ff]iles[/\\]/,
]

export function isDangerous(patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (DANGER_PATTERNS.some((re) => re.test(pattern))) return true
  }
  return false
}

const tui: TuiPlugin = async (api) => {
  const saved = api.kv.get(ACCEPT_MODE_KEY, "manual") as AcceptMode
  setAcceptMode(saved ?? "manual")

  function cycleMode() {
    const mode = acceptMode()
    const next: AcceptMode = mode === "manual" ? "auto" : mode === "auto" ? "yolo" : "manual"
    setAcceptMode(next)
    api.kv.set(ACCEPT_MODE_KEY, next)
    api.ui.toast({
      title: "Accept mode",
      message: `Switched to ${next.toUpperCase()}`,
      duration: 2000,
    })
  }

  api.keymap.registerLayer({
    commands: [
      {
        name: "spx.accept.cycle",
        title: "Cycle accept mode",
        desc: "Cycle between Manual / Auto / YOLO permission modes",
        category: "SpxOpenCode",
        run: cycleMode,
      },
    ],
    bindings: api.tuiConfig.keybinds.gather("spx.accept.cycle", ["spx.accept.cycle"]),
  })

  api.event.on("permission.asked", (info: any) => {
    const mode = acceptMode()
    if (mode === "manual") return

    const patterns: string[] = info.patterns ?? []

    if (mode === "yolo") {
      if (isDangerous(patterns)) {
        api.ui.toast({
          variant: "error",
          title: "YOLO blocked",
          message: `Dangerous command blocked: ${patterns.join(", ")}`,
          duration: 4000,
        })
        api.client.permission.reply({
          reply: "reject",
          requestID: info.id,
        })
        return
      }
      api.client.permission.reply({
        reply: "always",
        requestID: info.id,
        directory: api.state.path.directory,
      })
      return
    }

    if (mode === "auto") {
      const allowlist = loadAllowlist(api.state.path.directory)
      const persistent = allowlist !== null && matchesAllowlist(allowlist, patterns)
      api.client.permission.reply({
        reply: persistent ? "always" : "once",
        requestID: info.id,
        directory: persistent ? api.state.path.directory : undefined,
      })
    }
  })
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
