import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { createMemo, Show } from "solid-js"
import { acceptMode } from "./accept-mode-store"

const id = "spx:status-bar"

function AcceptModeIndicator(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current

  const label = createMemo(() => {
    switch (acceptMode()) {
      case "manual":
        return { text: "● manual", color: theme().textMuted }
      case "auto":
        return { text: "● auto", color: theme().success }
      case "yolo":
        return { text: "● YOLO", color: theme().error }
    }
  })

  return (
    <text fg={label().color} flexShrink={0}>
      {label().text}
    </text>
  )
}

function GitBranch(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current
  const branch = createMemo(() => props.api.state.vcs?.branch)

  return (
    <Show when={branch()}>
      {(b) => (
        <text fg={theme().textMuted} flexShrink={0}>
          ⎇ {b()}
        </text>
      )}
    </Show>
  )
}

function ProviderCount(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current
  const count = createMemo(() => props.api.state.provider.length)

  return (
    <Show when={count() > 0}>
      <text fg={theme().textMuted} flexShrink={0}>
        {count()} providers
      </text>
    </Show>
  )
}

function View(props: { api: TuiPluginApi }) {
  return (
    <box
      width="100%"
      paddingLeft={2}
      paddingRight={2}
      flexDirection="row"
      flexShrink={0}
      gap={2}
    >
      <AcceptModeIndicator api={props.api} />
      <GitBranch api={props.api} />
      <box flexGrow={1} />
      <ProviderCount api={props.api} />
    </box>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 200,
    slots: {
      home_footer() {
        return <View api={api} />
      },
    },
  })
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
