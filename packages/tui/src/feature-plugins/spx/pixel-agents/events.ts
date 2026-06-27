/** All event types the Pixel Agent system understands. */
export type PixelAgentEventType =
  | "build.success"
  | "build.failed"
  | "tests.success"
  | "tests.failed"
  | "quota.exceeded"
  | "provider.changed"
  | "session.started"
  | "session.finished"
  | "loop.started"
  | "loop.finished"
  | "doctor.completed"

export interface PixelAgentEvent {
  type: PixelAgentEventType
  timestamp: number
  payload?: unknown
}

type Listener = (event: PixelAgentEvent) => void

/** Typed in-process event bus — no external dependencies, no persistence. */
export class PixelAgentEventBus {
  private listeners = new Map<PixelAgentEventType, Listener[]>()

  on(type: PixelAgentEventType, listener: Listener): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, [])
    this.listeners.get(type)!.push(listener)
    return () => this.off(type, listener)
  }

  off(type: PixelAgentEventType, listener: Listener): void {
    const arr = this.listeners.get(type)
    if (!arr) return
    const idx = arr.indexOf(listener)
    if (idx !== -1) arr.splice(idx, 1)
  }

  publish(event: PixelAgentEvent): void {
    const arr = this.listeners.get(event.type)
    if (!arr) return
    for (const listener of [...arr]) listener(event)
  }

  listenerCount(type: PixelAgentEventType): number {
    return this.listeners.get(type)?.length ?? 0
  }
}
