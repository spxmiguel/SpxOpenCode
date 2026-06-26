# Auto by SpxMiguel

A model router built into SpxOpenCode's model selector. Picks the most appropriate AI model for your task using local keyword heuristics — no AI, no network calls, no hidden switching.

## How it works

1. Open the model selector (default keybind: `/model`)
2. Pick **"Auto by SpxMiguel"** at the top of the list
3. Type a short description of what you're working on
4. The router classifies your task and recommends a model
5. If that provider is connected, it switches automatically and shows a toast with the reason
6. If the provider is not connected, it stays on your current model and tells you why

## Heuristics table

| Task type      | Keywords (any match)                                          | Routes to     |
| -------------- | ------------------------------------------------------------- | ------------- |
| Architecture   | architect, refactor, design, structure, module, interface, system | Claude (Anthropic) |
| UI/UX          | ui, ux, component, button, form, layout, style, css, animation | Antigravity   |
| Research       | research, explain, "how does", "what is", compare, understand | Gemini (Google) |
| Implementation | implement, add, build, create, fix, bug, feature, function    | Codex (OpenAI) |
| Analysis       | analyze, review, audit, performance, metrics, data, log, trace | DeepSeek      |
| Unknown        | (nothing matched)                                             | Current model (no switch) |

Matching is case-insensitive. The **first** rule that matches wins.

## Transparency

Auto never switches silently. Every routing decision produces a visible toast:

```
Auto → claude-sonnet-4-5 (architecture/refactor)
```

If the provider is not connected:

```
Auto: staying on current model (anthropic not connected)
```

If no keywords matched:

```
Auto: staying on current model (unknown task type)
```

## Fallback behavior

- Provider not connected → keep current model, show warning toast
- No matching keyword → keep current model, show info toast
- Routed model fails at runtime → existing fallback system handles it (same as any other model error)
- No infinite loop: auto-router runs once per user interaction, never retries automatically

## How to add new rules

Edit `packages/tui/src/feature-plugins/spx/auto-router.ts`:

```typescript
// 1. Add a new reason type (optional — reuse existing ones if close enough)
export type RouteReason = "architecture" | "ui" | "research" | "implementation" | "analysis" | "unknown" | "YOUR_NEW_REASON"

// 2. Add keywords to the KEYWORDS map
const KEYWORDS: Record<RouteReason, string[]> = {
  // ...existing...
  your_new_reason: ["keyword1", "keyword2"],
}

// 3. Add a route in ROUTES
const ROUTES: Record<RouteReason, RouteTarget> = {
  // ...existing...
  your_new_reason: { providerID: "your-provider", modelID: "your-model" },
}
```

The order in `KEYWORDS` determines priority — earlier entries win on ties. Put more specific rules before general ones.

## Why no AI for routing decisions

Using AI to decide which AI to call creates a circular dependency and adds latency. Keyword heuristics are:

- **Fast**: runs in <1ms locally
- **Deterministic**: same input always produces same output, easy to test
- **Transparent**: the rules are visible in source code
- **Cheap**: zero tokens consumed

The trade-off is that keyword matching can be wrong for ambiguous prompts. When in doubt, leave it on your current model and route manually.

## Known limitations

- No context: only uses the short description you type, not your current session history
- No learning: rules don't adapt to your past choices
- Provider availability: if the recommended provider isn't connected, no switch happens
- Single match: first keyword match wins; complex tasks that span multiple categories get classified by whichever category's keyword appears first in the description
