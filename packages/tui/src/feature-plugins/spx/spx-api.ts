/**
 * SpxOpenCode Plugin API — stable contract for third-party plugins.
 *
 * This file is the public interface SpxOpenCode commits to maintaining.
 * Changes that remove or rename fields in SpxApi or SpxPlugin require a major
 * version bump. Additive changes (new optional fields) are non-breaking.
 *
 * Quick start:
 *   import { defineSpxPlugin } from "@spxopencode/plugin" // or copy this file
 *
 *   export default defineSpxPlugin({
 *     id: "acme:hello",
 *     name: "Hello World",
 *     description: "Shows a greeting",
 *     tui(api) {
 *       api.command!.register(() => [{
 *         title: "Hello",
 *         value: "acme.hello",
 *         description: "Say hello",
 *         category: "Acme",
 *         slash: { name: "hello" },
 *         async onSelect() {
 *           await api.attention.notify({ title: "Hello!", message: "World", notification: { when: "always" } })
 *         },
 *       }])
 *     },
 *   })
 *
 * Place the compiled .js file in: <project>/.spx/plugins/acme-hello.js
 */

import type { TuiPluginApi } from "@opencode-ai/plugin/tui"

/**
 * Stable subset of the OpenCode TUI API guaranteed by SpxOpenCode.
 * Only use fields defined here — direct `TuiPluginApi` access may break on upstream changes.
 */
export type SpxApi = Pick<
  TuiPluginApi,
  | "attention" // modal notifications (notify, sound, etc.)
  | "command" // slash commands (deprecated upstream, stable in SpxOpenCode)
  | "event" // subscribe to session/message/permission events
  | "kv" // persistent key-value store, survives restarts
  | "slots" // UI slot registration (status bar, sidebars)
  | "state" // providers, sessions, paths, vcs, MCP, LSP
  | "keymap" // register keybindings and command layers
  | "client" // raw OpenCode client (permission, session control)
  | "theme" // current theme colors and metadata
> & {
  /** Ephemeral toast notifications (subset of ui — JSX components excluded for stability). */
  ui: { toast: TuiPluginApi["ui"]["toast"] }
}

/**
 * Shape that a community SpxOpenCode plugin must export as its default export.
 *
 * The `id` field must be globally unique. Use "vendor:plugin-name" style.
 * The TUI calls `tui(api)` once at startup. Register all hooks/commands inside it.
 */
export type SpxPlugin = {
  /** Unique identifier — "vendor:plugin-name". Must match filename convention. */
  id: string
  /** Display name shown in /doctor and plugin lists. */
  name?: string
  /** One-line description of what this plugin does. */
  description?: string
  /** Plugin entrypoint — called once after OpenCode TUI initializes. */
  tui: (api: SpxApi) => Promise<void> | void
}

/**
 * Type-safe helper — wraps a plugin object with the SpxPlugin type so TypeScript
 * validates it without a separate type annotation.
 *
 * @example
 *   export default defineSpxPlugin({ id: "me:my-plugin", tui(api) { ... } })
 */
export function defineSpxPlugin(plugin: SpxPlugin): SpxPlugin {
  return plugin
}
