# FAQ

## Is SpxOpenCode a replacement for OpenCode?

No. It is a fork with added plugins. It runs everything OpenCode runs. If you disable all SPX plugins, it is functionally identical to vanilla OpenCode.

## Will SpxOpenCode stay in sync with upstream OpenCode?

Yes. Staying current with upstream is a primary maintenance goal. The upstream surface is minimal (two files: `builtins.ts` and `keybind.ts`) so merges are mechanical.

## Do SPX plugins send data anywhere?

No. SPX plugins are local-only. No telemetry, no analytics, no cloud calls. The fallback handler reads error messages locally and classifies them with a local lookup — it does not call an AI or external service.

## What is YOLO mode?

YOLO mode auto-approves all tool use without prompting. It is equivalent to running with `--dangerously-skip-permissions` in some other tools. Use it only in sandboxed or throwaway environments where you trust the model completely.

## Can I use SpxOpenCode with Ollama?

Yes. SpxOpenCode inherits OpenCode's provider list, which includes Ollama. Configure Ollama in your OpenCode config and SpxOpenCode will use it.

## Why does the status bar show "3 providers"?

That count reflects how many providers are currently configured and active in your OpenCode config. If you have Anthropic + OpenAI + Ollama configured, you'll see 3.

## SpxDoctor says something is wrong. What do I do?

Read the doctor output carefully — each check explains what it found and what to do. If a check fails that you don't understand, open an issue on GitHub with the doctor output.

## How do I disable a specific SPX feature?

Open `packages/tui/src/feature-plugins/builtins.ts` and set `enabled: false` for the plugin you want to disable. No restart needed if you rebuild.

## Can I contribute a plugin?

Yes. Read [CONTRIBUTING.md](../CONTRIBUTING.md) and [docs/plugin-system.md](./plugin-system.md). New plugins must pass the 7-question filter in [VISION.md](../VISION.md).

## Why is this not just a PR to OpenCode?

Some of these plugins are too opinionated for OpenCode's core. The fork model lets us ship faster and experiment without going through upstream review for every change. The goal is to upstream the best ideas eventually.

## Where do I report a bug?

[GitHub Issues](https://github.com/spxmiguel/SpxOpenCode/issues). Use the bug report template and include SpxDoctor output if relevant.
