import { createSignal } from "solid-js"
import type { RouteReason } from "./auto-router"

export const [autoChosenModel, setAutoChosenModel] = createSignal<{
  providerID: string
  modelID: string
} | null>(null)

export const [autoLastReason, setAutoLastReason] = createSignal<{
  reason: RouteReason
  label: string
} | null>(null)
