import type { TuiPlugin } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { reportError } from "./accept-mode-store"

const id = "spx:fallback"

type FriendlyError = {
  title: string
  message: string
}

export function classify(error: any): FriendlyError | undefined {
  const name: string = error?.name ?? ""
  const statusCode: number | undefined = error?.statusCode
  const msg: string = (error?.message ?? "").toLowerCase()
  const body: string = (error?.responseBody ?? "").toLowerCase()

  if (name === "ProviderHeaderTimeoutError") {
    return {
      title: "Provider timeout",
      message: "No response from provider. Check connection or try a different model.",
    }
  }

  if (name === "ProviderResponseStreamError") {
    return {
      title: "Stream interrupted",
      message: "Response stream broke. The provider may be overloaded — retry shortly.",
    }
  }

  if (statusCode === 401 || msg.includes("unauthorized") || msg.includes("invalid api key")) {
    return {
      title: "Auth error",
      message: "Provider rejected credentials. Run `opencode auth login` to re-authenticate.",
    }
  }

  if (statusCode === 403 || msg.includes("forbidden")) {
    return {
      title: "Access denied",
      message: "No permission for this resource. Check your plan and provider settings.",
    }
  }

  if (statusCode === 429 || msg.includes("rate limit") || body.includes("rate_limit")) {
    return {
      title: "Rate limited",
      message: "Too many requests. Slow down or upgrade your plan.",
    }
  }

  if (statusCode === 413 || body.includes("context_length_exceeded") || msg.includes("context")) {
    return {
      title: "Context overflow",
      message: "Input too long for this model. Start a new session or summarize earlier messages.",
    }
  }

  if (body.includes("insufficient_quota") || msg.includes("quota")) {
    return {
      title: "Quota exceeded",
      message: "You've used up your API quota. Check billing at your provider's dashboard.",
    }
  }

  if (body.includes("usage_not_included")) {
    return {
      title: "Plan restriction",
      message: "Your current plan doesn't include API access. Upgrade to use this model.",
    }
  }

  if (body.includes("server_is_overloaded") || body.includes("server_error")) {
    return {
      title: "Provider overloaded",
      message: "Server is busy. Retry in a few seconds.",
    }
  }

  return undefined
}

const tui: TuiPlugin = async (api) => {
  api.event.on("session.error", (event: any) => {
    const error = event?.error ?? event
    const friendly = classify(error)
    if (!friendly) return

    reportError(friendly.title)
    api.attention.notify({
      title: friendly.title,
      message: friendly.message,
      notification: { when: "always" },
    })
  })
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
