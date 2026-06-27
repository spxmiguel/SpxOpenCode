import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { buildAvailableProviders, routeWithProviders } from "./auto-router"
import { setAutoChosenModel, setAutoLastReason } from "./auto-chosen-store"

const id = "spx:auto"

function getAvailableProviders(api: TuiPluginApi) {
  return buildAvailableProviders(
    api.state.provider.map((p) => ({
      name: p.name,
      models: p.models as Record<string, { status: string }>,
    })),
  )
}

const tui: TuiPlugin = async (api) => {
  // /auto — pick best available model, announce decision
  api.command!.register(() => [
    {
      title: "Auto by SpxMiguel — route task to best model",
      value: "spx.auto.route",
      slash: { name: "auto" },
      async onSelect() {
        const available = getAvailableProviders(api)
        const fallback = { providerID: "current", modelID: "current" }
        const result = routeWithProviders("", available, fallback)

        setAutoChosenModel({ providerID: result.providerID, modelID: result.modelID })
        setAutoLastReason({ reason: result.reason, label: result.label })

        const alternatives = available
          .flatMap((p) => p.modelIDs.map((m) => `${p.providerID}/${m}`))
          .filter((s) => s !== `${result.providerID}/${result.modelID}`)
          .slice(0, 3)
          .join(", ")

        const altText = alternatives ? ` | Alt: ${alternatives}` : ""

        api.ui.toast({
          title: `◈ Auto → ${result.modelID}`,
          message: `Reason: ${result.label} (${result.reason})${altText}`,
          duration: 6000,
        })
      },
    },
  ])

  // On session error, exclude failed provider and reselect
  api.event.on("session.error", (event: any) => {
    const error = event?.error ?? event
    const failedProvider: string | undefined = error?.providerID ?? error?.provider

    if (!failedProvider) return

    const available = getAvailableProviders(api).filter((p) => p.providerID !== failedProvider)
    if (available.length === 0) return

    const current = { providerID: "current", modelID: "current" }
    const result = routeWithProviders("", available, current)

    if (result.providerID === "current") return

    setAutoChosenModel({ providerID: result.providerID, modelID: result.modelID })
    setAutoLastReason({ reason: result.reason, label: result.label })

    api.ui.toast({
      title: `◈ Auto fallback → ${result.modelID}`,
      message: `${failedProvider} failed — switched to ${result.providerID}`,
      duration: 5000,
    })
  })
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
