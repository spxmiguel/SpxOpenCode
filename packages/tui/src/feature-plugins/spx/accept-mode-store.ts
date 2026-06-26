import { createSignal } from "solid-js"

export type AcceptMode = "manual" | "auto" | "yolo"

export const ACCEPT_MODE_KEY = "spx.accept.mode"

const [acceptMode, setAcceptModeSignal] = createSignal<AcceptMode>("manual")

export { acceptMode }

export function setAcceptMode(mode: AcceptMode) {
  setAcceptModeSignal(mode)
}

export const [lastError, setLastError] = createSignal<string | null>(null)

let _clearErrorTimer: ReturnType<typeof setTimeout> | undefined

export function reportError(title: string, ttlMs = 30_000) {
  if (_clearErrorTimer !== undefined) clearTimeout(_clearErrorTimer)
  setLastError(title)
  _clearErrorTimer = setTimeout(() => {
    setLastError(null)
    _clearErrorTimer = undefined
  }, ttlMs)
}

export const LOOP_KEY = "spx.loop.active"
export const [loopActive, setLoopActive] = createSignal<boolean>(false)
