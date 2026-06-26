import { createSignal } from "solid-js"

export const [autoChosenModel, setAutoChosenModel] = createSignal<{
  providerID: string
  modelID: string
} | null>(null)
