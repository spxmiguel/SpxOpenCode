# Companion Agents — Design Specification

> **Status:** Design only. Not implemented. This document defines the architecture for a future optional feature.

## Purpose

Companion agents are optional, low-cost agents that provide contextual awareness, humor, and session personality. They are not productivity tools — they are atmosphere. The entire companion system is opt-in and must never increase token costs without explicit user action.

## Core rule

> 95% of companion behaviors must work locally, with zero AI calls.

Any companion feature that requires an AI call is in the GROQ or PREMIUM tier and must be explicitly enabled by the user with their own API key.

## Modes

### LOCAL (default)

- Zero AI calls
- Zero additional cost
- Runs on local logic, heuristics, and prewritten scripts
- Examples: status messages based on session duration, deterministic reactions to known events (long session, error spike, first session)

### GROQ (optional)

- Requires user to provide a Groq API key in config
- Used only for: dialog lines, humor, short speeches
- Never used for: productivity tasks, code generation, tool use
- Must be explicitly enabled: `companions.groq.enabled = true`
- Cost is the user's Groq credits, not OpenCode tokens

### PREMIUM (future, very restricted)

- Only when explicitly requested by the user for a specific interaction
- Never background, never scheduled, never autonomous
- Likely never implemented — included for completeness

## Architecture

### Events

Companions react to events emitted by OpenCode or SpxOpenCode. They never poll.

| Event | Description |
|-------|-------------|
| `session.start` | New session opened |
| `session.end` | Session closed |
| `session.long` | Session exceeded threshold (e.g. 2 hours) |
| `error.provider` | Provider call failed |
| `mode.change` | Accept mode changed |
| `doctor.complete` | Doctor check finished |

### States

A companion has a simple state machine:

```
IDLE → REACTING → IDLE
          ↓
       SPEAKING (if dialog enabled)
          ↓
         IDLE
```

No companion stays in a non-IDLE state between events. No background processing.

### Personalities

Companion personality is a static configuration, not an AI-generated trait. Personalities are:

- **SILENT** — no output at all (default)
- **MINIMAL** — one-line status updates on key events (LOCAL only)
- **CHATTY** — short dialog on events (GROQ tier, opt-in)

### Persistence

Companions may persist one thing locally: a counter of sessions, used for milestone messages ("100th session!"). Stored in `.spx/companion-state.json`. No other persistence.

### Computational cost

| Tier | Cost per event | AI calls |
|------|---------------|----------|
| LOCAL | ~0ms | None |
| GROQ | ~200-500ms | 1 (small model) |
| PREMIUM | ~1-3s | 1 (large model) |

GROQ and PREMIUM companions must show a cost indicator before any call.

## What companions will NOT do

- Issue tool use
- Read or write code
- Access the conversation history
- Provide opinions on code quality
- Run on a schedule
- Use the main OpenCode session's AI budget

## Pixel Agents integration

> **Note:** Pixel Agents is an external project. At the time of writing, no local copy was found for review. If Pixel Agents provides reusable companion components (animation, dialog, state machine), SpxOpenCode should integrate rather than reimplement. This section will be updated once the Pixel Agents project is reviewed.

Until then: do not reimplement UI animation or dialog management that Pixel Agents already handles.

## Implementation order (when scheduled)

1. LOCAL mode, MINIMAL personality
2. Event system (subscribe to OpenCode events)
3. `.spx/companion-state.json` persistence
4. GROQ tier (after LOCAL is stable)
5. Pixel Agents integration (if applicable)

## Open questions

- Does Pixel Agents have a plugin interface SpxOpenCode can use?
- What is the performance cost of companion reaction at session start?
- Should companions be a separate optional package (`spx-companions`) or always bundled?
