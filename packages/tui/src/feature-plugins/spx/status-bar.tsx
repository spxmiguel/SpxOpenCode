import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { createMemo, Show } from "solid-js"
import { acceptMode, lastError } from "./accept-mode-store"

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
  const color = createMemo(() => (count() === 0 ? theme().error : theme().textMuted))
  const label = createMemo(() => (count() === 0 ? "no providers" : `${count()} providers`))

  return (
    <text fg={color()} flexShrink={0}>
      {label()}
    </text>
  )
}

function LastErrorIndicator(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current

  return (
    <Show when={lastError()}>
      {(err) => (
        <text fg={theme().error} flexShrink={0}>
          ⚠ {err()}
        </text>
      )}
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
      <LastErrorIndicator api={props.api} />
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
