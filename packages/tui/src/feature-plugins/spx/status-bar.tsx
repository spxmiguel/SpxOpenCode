import { join } from "node:path"
import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { createMemo, createSignal, Show } from "solid-js"
import { ACCEPT_MODE_KEY, acceptMode, lastError, loopActive, setAcceptMode, type AcceptMode } from "./accept-mode-store"
import { autoChosenModel } from "./auto-chosen-store"
import { lastDoctorOk } from "./doctor"
import { loadSkillsDir } from "./skill-loader"
import { useLocal } from "../../context/local"

const id = "spx:status-bar"

const [skillsCount, setSkillsCount] = createSignal(0)

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

  function cycle() {
    const mode = acceptMode()
    const next: AcceptMode = mode === "manual" ? "auto" : mode === "auto" ? "yolo" : "manual"
    setAcceptMode(next)
    props.api.kv.set(ACCEPT_MODE_KEY, next)
    props.api.ui.toast({ title: "Accept mode", message: `Switched to ${next.toUpperCase()}`, duration: 2000 })
  }

  return (
    <text fg={label().color} flexShrink={0} onMouseUp={cycle}>
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
        <text fg={theme().textMuted} flexShrink={1}>
          ⎇ {b()}
        </text>
      )}
    </Show>
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

function LoopIndicator(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current

  return (
    <Show when={loopActive()}>
      <text fg={theme().success} flexShrink={1}>
        ↺ loop
      </text>
    </Show>
  )
}

function AutoIndicator(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current

  return (
    <Show when={autoChosenModel() !== null}>
      <text fg={theme().success} flexShrink={1}>
        ◈ Auto
      </text>
    </Show>
  )
}

function DoctorIndicator(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current
  const ok = lastDoctorOk

  return (
    <Show when={ok() !== null}>
      <text fg={ok() ? theme().success : theme().error} flexShrink={1}>
        {ok() ? "✓ doc" : "✗ doc"}
      </text>
    </Show>
  )
}

function SkillsCountIndicator(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current

  return (
    <Show when={skillsCount() > 0}>
      <text fg={theme().textMuted} flexShrink={1}>
        {skillsCount()} skills
      </text>
    </Show>
  )
}

function CurrentModel(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current
  const local = useLocal()
  const model = createMemo(() => {
    const m = local.model.current()
    if (!m) return null
    if (m.providerID === "auto") return null
    return m.modelID
  })

  return (
    <Show when={model()}>
      {(id) => (
        <text fg={theme().textMuted} flexShrink={1}>
          ◈ {id()}
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
      <LoopIndicator api={props.api} />
      <AutoIndicator api={props.api} />
      <DoctorIndicator api={props.api} />
      <SkillsCountIndicator api={props.api} />
      <CurrentModel api={props.api} />
      <ProviderCount api={props.api} />
    </box>
  )
}

const tui: TuiPlugin = async (api) => {
  const skillsDir = join(process.cwd(), "spx", "skills")
  loadSkillsDir(skillsDir).then((r) => setSkillsCount(r.skills.length))

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
