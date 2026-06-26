import type { TuiPlugin } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { ACCEPT_MODE_KEY, setAcceptMode, acceptMode, type AcceptMode } from "./accept-mode-store"

const id = "spx:auto-accept"

const DANGER_PATTERNS = [
  /rm\s+-rf/i,
  /rm\s+-r/i,
  /sudo\s+rm/i,
  /mkfs/i,
  /dd\s+if=/i,
  />>\s*\/dev\//i,
  /:\s*>\s*\//i,
  /format\s+[a-z]:/i,
  /fdisk/i,
  /parted/i,
  /shred/i,
  /wipefs/i,
]

const DANGER_PATHS = ["/etc/", "/usr/", "/bin/", "/boot/", "/dev/", "/proc/", "/sys/", "/lib/"]

function isDangerous(patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (DANGER_PATTERNS.some((re) => re.test(pattern))) return true
    if (DANGER_PATHS.some((p) => pattern.includes(p))) return true
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
      api.client.permission.reply({
        reply: "once",
        requestID: info.id,
      })
    }
  })
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
