# Plugin System

SpxOpenCode extends OpenCode through its `BuiltinTuiPlugin` system. All SPX features are plugins — none are hardcoded into core.

## Plugin interface

```typescript
interface BuiltinTuiPlugin {
  id: string
  tui: TuiPlugin
  enabled?: boolean
}
```

`TuiPlugin` is defined by OpenCode. SpxOpenCode uses it without modification.

## Registration

Plugins are registered in `packages/tui/src/feature-plugins/builtins.ts`:

```typescript
import { SpxStatusBar } from "./spx/status-bar"
import { SpxAutoAccept } from "./spx/auto-accept"
import { SpxFallback } from "./spx/fallback"
import { SpxDoctor } from "./spx/doctor"

export const BUILTIN_PLUGINS: BuiltinTuiPlugin[] = [
  // ... upstream plugins ...
  { id: "spx-status-bar",  tui: SpxStatusBar,  enabled: true },
  { id: "spx-auto-accept", tui: SpxAutoAccept, enabled: true },
  { id: "spx-fallback",    tui: SpxFallback,   enabled: true },
  { id: "spx-doctor",      tui: SpxDoctor,     enabled: true },
]
```

To disable a plugin: set `enabled: false`. No other change required.

## Shared state

Plugins that need to communicate use `packages/tui/src/feature-plugins/spx/accept-mode-store.ts`:

```typescript
import { createSignal } from "solid-js"

export type AcceptMode = "MANUAL" | "AUTO" | "YOLO"
export const [acceptMode, setAcceptMode] = createSignal<AcceptMode>("MANUAL")
```

This is a SolidJS signal — reactive, framework-native, no external state library required.

## Writing a new SPX plugin

1. Create `packages/tui/src/feature-plugins/spx/my-plugin.ts`
2. Export a `TuiPlugin` conforming to OpenCode's interface
3. Add one entry to `builtins.ts`

Guidelines:
- No background timers or intervals
- No AI calls without user intent
- No modification of OpenCode-owned files beyond `builtins.ts` and `keybind.ts`
- If you need shared state, extend `accept-mode-store.ts` or create a new store

## Upstream compatibility rule

SPX plugins import from OpenCode as consumers, not patchers. If a new OpenCode version renames an API your plugin uses, update the import — do not monkey-patch the OpenCode module.
