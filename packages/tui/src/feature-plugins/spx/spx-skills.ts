import type { TuiPlugin, TuiDialogStack } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { generateCommitMessage, generatePrDescription, generateChangelog, copyToClipboard } from "./skill-generators"

const id = "spx:skills"

const tui: TuiPlugin = async (api) => {
  api.command!.register(() => [
    {
      title: "Skill: Generate Commit Message",
      value: "spx.skill.commit",
      description: "Generate conventional commit message from staged diff (no AI)",
      category: "SpxOpenCode",
      slash: { name: "skill:commit", aliases: ["commit-msg"] },
      async onSelect(_dialog?: TuiDialogStack) {
        const dir = api.state.path.directory
        const message = generateCommitMessage(dir)
        const copied = copyToClipboard(message)
        await api.attention.notify({
          title: copied ? "Commit Message (copied to clipboard)" : "Commit Message",
          message,
          notification: { when: "always" },
        })
      },
    },
    {
      title: "Skill: Generate Changelog",
      value: "spx.skill.changelog",
      description: "Generate CHANGELOG entry from git log since last tag (conventional commits)",
      category: "SpxOpenCode",
      slash: { name: "skill:changelog", aliases: ["changelog"] },
      async onSelect(_dialog?: TuiDialogStack) {
        const dir = api.state.path.directory
        const entry = generateChangelog(dir)
        const copied = copyToClipboard(entry)
        await api.attention.notify({
          title: copied ? "Changelog Entry (copied to clipboard)" : "Changelog Entry",
          message: entry,
          notification: { when: "always" },
        })
      },
    },
    {
      title: "Skill: Generate PR Description",
      value: "spx.skill.pr",
      description: "Generate PR description template from git log (no AI)",
      category: "SpxOpenCode",
      slash: { name: "skill:pr", aliases: ["pr-desc"] },
      async onSelect(_dialog?: TuiDialogStack) {
        const dir = api.state.path.directory
        const desc = generatePrDescription(dir)
        const copied = copyToClipboard(desc)
        await api.attention.notify({
          title: copied ? "PR Description (copied to clipboard)" : "PR Description",
          message: desc,
          notification: { when: "always" },
        })
      },
    },
  ])
}

const plugin: BuiltinTuiPlugin = { id, tui }
export default plugin
