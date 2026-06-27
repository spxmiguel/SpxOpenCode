# Auto by SpxMiguel

Availability-aware model router built into SpxOpenCode. Picks the best available model for your task using local keyword heuristics — no AI, no network calls, no hidden switching.

**FASE 13 hard constraints:**
- Never selects unavailable provider
- Never increases cost
- Every decision reproducible from local rules only
- Always shows: model chosen / reason / alternatives

## How it works

1. Type `/auto <task description>` in any session
2. Router classifies task → picks best **available** model from PRIORITY table
3. Toast shows: model chosen, reason, up to 3 alternatives
4. StatusBar shows `◈ AUTO ▸ modelID (reason)` while active
5. On `session.error`: recalculates excluding failed provider, announces fallback

## Keyword classification

| Task type      | Keywords (any match)                                              |
| -------------- | ----------------------------------------------------------------- |
| `architecture` | architect, refactor, design, structure, module, interface, system |
| `ui`           | ui, ux, component, button, form, layout, style, css, animation, visual |
| `research`     | research, explain, how does, what is, compare, understand, why    |
| `implementation` | implement, add, build, create, fix, bug, feature, function      |
| `analysis`     | analyze, review, audit, performance, metrics, data, log, trace    |
| `unknown`      | (nothing matched) → stays on current model                        |

Matching is case-insensitive. First rule that matches wins.

## Provider priority (first available wins)

| Reason           | Priority order                            |
| ---------------- | ----------------------------------------- |
| `architecture`   | anthropic → google → openai               |
| `ui`             | anthropic → google → openai               |
| `research`       | google → anthropic → openai               |
| `implementation` | openai → anthropic → google               |
| `analysis`       | anthropic → openai → google               |

Within a provider, the specific model is also ranked (e.g. `claude-opus-4-8` before `claude-sonnet-4-6`). If the top-ranked model isn't available, walks down the list until a match is found. If the full priority list has no available match, picks any active model from any active provider. If no providers are active, stays on current model.

## Transparency

Every `/auto` invocation produces a toast:

```
◈ Auto → claude-sonnet-4-6
Reason: Architecture (refactor) | Alternatives: google/gemini-2.0-flash, openai/gpt-4o
```

On session error fallback:

```
◈ Auto fallback → gemini-2.0-flash
anthropic failed — switched to google
```

StatusBar (bottom-right) shows `◈ AUTO ▸ modelID (label)` while auto mode is active.

## Fallback behavior

- No matching keywords → stays on current model (reason: `unknown`)
- No providers available → stays on current model
- Provider fails at runtime → recalculates excluding failed provider, announces switch
- No infinite loop: re-routes once on error, does not retry automatically

## How to add new rules

Edit `packages/tui/src/feature-plugins/spx/auto-router.ts`:

```typescript
// 1. Add reason to RouteReason union
export type RouteReason = "architecture" | "ui" | "research" | "implementation" | "analysis" | "unknown" | "YOUR_REASON"

// 2. Add keywords to KEYWORDS
const KEYWORDS: Record<Exclude<RouteReason, "unknown">, string[]> = {
  // ...existing...
  your_reason: ["keyword1", "keyword2"],
}

// 3. Add LABELS entry
const LABELS: Record<RouteReason, string> = {
  // ...existing...
  your_reason: "Your Reason Label",
}

// 4. Add PRIORITY entry (ordered provider+model preference list)
const PRIORITY: Record<Exclude<RouteReason, "unknown">, Array<RouteTarget>> = {
  // ...existing...
  your_reason: [
    { providerID: "anthropic", modelID: "claude-sonnet-4-6" },
    { providerID: "google", modelID: "gemini-2.0-flash" },
  ],
}
```

## Why no AI for routing decisions

Using AI to decide which AI to call adds latency and cost. Keyword heuristics are:

- **Fast**: runs in <1ms locally
- **Deterministic**: same input always produces same output, easy to test
- **Transparent**: rules visible in source code
- **Cheap**: zero tokens consumed
- **Safe**: never selects a provider that isn't connected

The trade-off is keyword matching can be wrong for ambiguous prompts. When in doubt, route manually.

## Known limitations

- No context: only uses the short description you type, not session history
- No learning: rules don't adapt to past choices
- Single match: first keyword match wins; complex tasks get classified by whichever keyword appears first
