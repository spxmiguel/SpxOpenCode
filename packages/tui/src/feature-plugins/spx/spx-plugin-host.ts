import { join } from "node:path"
import { createSignal } from "solid-js"
import type { TuiPlugin } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import type { SpxApi } from "./spx-api"
import { loadPluginsDir, type PluginLoadResult } from "./spx-plugin-loader"

const id = "spx:plugin-host"

export const [lastPluginLoadResult, setLastPluginLoadResult] = createSignal<PluginLoadResult | null>(null)

const tui: TuiPlugin = async (api) => {
  const pluginsDir = join(api.state.path.directory, ".spx", "plugins")
  const result = await loadPluginsDir(pluginsDir)
  setLastPluginLoadResult(result)

  const spxApi: SpxApi = {
    attention: api.attention,
    command: api.command,
    event: api.event,
    kv: api.kv,
    slots: api.slots,
    state: api.state,
    keymap: api.keymap,
    client: api.client,
    theme: api.theme,
    ui: { toast: api.ui.toast },
  }

  await Promise.all(
    result.plugins.map(async ({ file, plugin }) => {
      try {
        await plugin.tui(spxApi)
      } catch (err) {
        result.errors.push({
          file,
          reason: `tui() threw: ${err instanceof Error ? err.message : String(err)}`,
        })
      }
    }),
  )
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
