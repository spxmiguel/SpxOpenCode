import type { PixelAgentId, PixelAgentMemory } from "./types"

/** Persistence contract for agent memory. All methods are async for future backends. */
export interface PixelAgentMemoryStore {
  get(agentId: PixelAgentId, key: string): Promise<PixelAgentMemory | undefined>
  set(agentId: PixelAgentId, memory: PixelAgentMemory): Promise<void>
  delete(agentId: PixelAgentId, key: string): Promise<void>
  list(agentId: PixelAgentId): Promise<PixelAgentMemory[]>
  clear(agentId: PixelAgentId): Promise<void>
}

/** In-process memory store — RAM only, no file I/O, no SQLite. Resets on process restart. */
export class InMemoryPixelAgentMemoryStore implements PixelAgentMemoryStore {
  private store = new Map<string, PixelAgentMemory>()

  private storeKey(agentId: PixelAgentId, key: string): string {
    return `${agentId}::${key}`
  }

  async get(agentId: PixelAgentId, key: string): Promise<PixelAgentMemory | undefined> {
    return this.store.get(this.storeKey(agentId, key))
  }

  async set(agentId: PixelAgentId, memory: PixelAgentMemory): Promise<void> {
    this.store.set(this.storeKey(agentId, memory.key), memory)
  }

  async delete(agentId: PixelAgentId, key: string): Promise<void> {
    this.store.delete(this.storeKey(agentId, key))
  }

  async list(agentId: PixelAgentId): Promise<PixelAgentMemory[]> {
    const prefix = `${agentId}::`
    const results: PixelAgentMemory[] = []
    for (const [k, v] of this.store) {
      if (k.startsWith(prefix)) results.push(v)
    }
    return results
  }

  async clear(agentId: PixelAgentId): Promise<void> {
    const prefix = `${agentId}::`
    for (const k of [...this.store.keys()]) {
      if (k.startsWith(prefix)) this.store.delete(k)
    }
  }

  /** Total entries across all agents — useful for tests and diagnostics. */
  size(): number {
    return this.store.size
  }
}
