# Provider System

SpxOpenCode uses OpenCode's provider system without modification. This document explains how providers interact with SPX plugins.

## What SpxOpenCode adds

SpxOpenCode does not implement its own provider routing. It adds:

1. **Fallback handler** — classifies provider errors and displays human-readable messages
2. **Status bar provider count** — reads active provider count from OpenCode state and displays it

Neither feature changes how providers are configured or called.

## Configuring providers

Provider configuration is identical to vanilla OpenCode. Edit your OpenCode config file (typically `~/.config/opencode/config.json`) to add providers and API keys.

SpxOpenCode inherits all providers OpenCode supports:
- Anthropic (Claude)
- OpenAI
- Google Gemini
- Ollama (local)
- Any OpenAI-compatible endpoint

## Fallback handler error classification

When a provider call fails, `SpxFallback` classifies the error into one of:

| Class | Cause | Suggested action |
|-------|-------|-----------------|
| `rate_limit` | 429 from provider | Wait or switch provider |
| `auth` | 401 / invalid API key | Check key in config |
| `network` | Connection refused / timeout | Check connectivity |
| `model` | Model not found / deprecated | Update model name |
| `unknown` | Any other error | See raw message |

The raw error is always available in the expanded error view.

## Zero vendor lock-in

SpxOpenCode has no preferred provider. No SPX feature requires Anthropic, OpenAI, or any specific model. The fallback handler works the same regardless of which provider failed.

No SpxOpenCode feature will ever issue AI calls on its own. Token costs stay in the user's control.
