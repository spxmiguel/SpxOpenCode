import { TextAttributes } from "@opentui/core"
import type { TuiPlugin } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { Logo } from "../../component/logo"
import { useTheme } from "../../context/theme"

const id = "spx:home"

function SpxBrand() {
  const { theme } = useTheme()

  return (
    <box flexDirection="column" alignItems="center" gap={1}>
      <box flexDirection="row" gap={1}>
        <text fg={theme.accent} attributes={TextAttributes.BOLD}>
          {"◈"}
        </text>
        <text fg={theme.text} attributes={TextAttributes.BOLD}>
          {"SpxOpenCode"}
        </text>
      </box>
      <Logo />
      <text fg={theme.textMuted}>{"by @spxmiguel · autonomous dev terminal"}</text>
    </box>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 200,
    slots: {
      home_logo() {
        return <SpxBrand />
      },
    },
  })
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
