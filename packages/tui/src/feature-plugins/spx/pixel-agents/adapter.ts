import type { PixelAgent, PixelAgentAction, PixelAgentState } from "./types"
import type { PixelAgentEvent } from "./events"
import type { PixelAgentConfig } from "./config"

/** Contract all adapters must implement. */
export interface PixelAgentAdapter {
  react(
    agent: PixelAgent,
    event: PixelAgentEvent,
    state: PixelAgentState,
    config: PixelAgentConfig,
  ): Promise<PixelAgentAction | null>
}

/**
 * Local adapter — deterministic reactions, zero AI calls.
 * Maps event types to structured actions with no external I/O.
 */
export class LocalPixelAgentAdapter implements PixelAgentAdapter {
  async react(
    _agent: PixelAgent,
    event: PixelAgentEvent,
    _state: PixelAgentState,
    _config: PixelAgentConfig,
  ): Promise<PixelAgentAction | null> {
    switch (event.type) {
      case "build.success":
        return { type: "react.build_success" }
      case "build.failed":
        return { type: "react.build_failed" }
      case "tests.success":
        return { type: "react.tests_success" }
      case "tests.failed":
        return { type: "react.tests_failed" }
      case "quota.exceeded":
        return { type: "react.quota_exceeded" }
      case "doctor.completed":
        return { type: "react.doctor_completed" }
      default:
        return null
    }
  }
}

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = "llama3-8b-8192"
const LOCAL_FALLBACK = new LocalPixelAgentAdapter()

interface GroqChatResponse {
  choices?: Array<{ message?: { content?: string } }>
}

/**
 * Groq adapter — calls Groq chat completions for personality-flavored reactions.
 * Only active when config.groqEnabled=true AND config.groqApiKey is set.
 * Falls back to LocalPixelAgentAdapter on any network or API error.
 * Zero Groq calls in local or premium mode.
 */
export class GroqPixelAgentAdapter implements PixelAgentAdapter {
  async react(
    agent: PixelAgent,
    event: PixelAgentEvent,
    state: PixelAgentState,
    config: PixelAgentConfig,
  ): Promise<PixelAgentAction | null> {
    if (!config.groqEnabled || !config.groqApiKey) {
      return LOCAL_FALLBACK.react(agent, event, state, config)
    }

    const personality = agent.personality
    const systemPrompt = personality
      ? `You are ${personality.name}. Tone: ${personality.tone ?? "neutral"}. Traits: ${(personality.traits ?? []).join(", ")}.`
      : "You are a helpful Pixel Agent."

    const userPrompt = `Event received: ${event.type}. Respond with a single short action label (snake_case, no spaces, max 40 chars). Only output the label, nothing else.`

    try {
      const res = await fetch(GROQ_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.groqApiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 20,
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(5000),
      })

      if (!res.ok) {
        return LOCAL_FALLBACK.react(agent, event, state, config)
      }

      const data = (await res.json()) as GroqChatResponse
      const raw = data.choices?.[0]?.message?.content?.trim() ?? ""
      const label = raw.replace(/[^a-z0-9_.]/gi, "_").slice(0, 40) || "react.groq_response"

      return { type: `react.groq.${label}`, payload: { agentId: agent.id, event: event.type } }
    } catch {
      return LOCAL_FALLBACK.react(agent, event, state, config)
    }
  }
}
