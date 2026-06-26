import { createSignal } from "solid-js"

export type AcceptMode = "manual" | "auto" | "yolo"

export const ACCEPT_MODE_KEY = "spx.accept.mode"

const [acceptMode, setAcceptModeSignal] = createSignal<AcceptMode>("manual")

export { acceptMode }

export function setAcceptMode(mode: AcceptMode) {
  setAcceptModeSignal(mode)
}
