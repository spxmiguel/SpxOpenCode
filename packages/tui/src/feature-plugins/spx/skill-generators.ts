import { execSync } from "node:child_process"

function run(cmd: string, cwd: string): string {
  try {
    return execSync(cmd, { cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim()
  } catch {
    return ""
  }
}

function inferType(files: string[]): string {
  if (files.some((f) => /\.(test|spec)\.[tj]sx?$/.test(f) || f.includes("__tests__") || f.includes("/test/"))) return "test"
  if (files.every((f) => /\.(md|txt|rst)$/i.test(f))) return "docs"
  if (files.some((f) => /\.(json|yaml|yml|toml|ini)$/.test(f) || /config|setup|\.rc$/.test(f))) return "chore"
  return "feat"
}

function inferScope(files: string[]): string | null {
  if (files.length === 0) return null
  const parts = files.map((f) => f.split("/"))
  const maxLen = Math.min(...parts.map((p) => p.length - 1))
  let depth = 0
  while (depth < maxLen && parts.every((p) => p[depth] === parts[0][depth])) depth++
  const common = parts[0].slice(0, depth).filter((s) => s && s !== "src" && s !== "packages")
  return common.length > 0 ? common.join("/") : null
}

export function generateCommitMessage(dir: string): string {
  const rawFiles = run("git diff --staged --name-only", dir)
  const files = rawFiles ? rawFiles.split("\n").filter(Boolean) : []

  if (files.length === 0) {
    return [
      "chore: update files",
      "",
      "No staged changes found. Stage files with `git add` first.",
    ].join("\n")
  }

  const type = inferType(files)
  const scope = inferScope(files)
  const stat = run("git diff --staged --stat", dir)

  const header = scope ? `${type}(${scope}): ` : `${type}: `
  const fileHint =
    files.length === 1
      ? files[0].split("/").pop() ?? files[0]
      : `${files.length} files`

  const subject = `${header}<describe change> (${fileHint})`

  return stat ? `${subject}\n\n${stat}` : subject
}

export function generatePrDescription(dir: string): string {
  const branch = run("git rev-parse --abbrev-ref HEAD", dir) || "current-branch"
  const mainRef = run("git rev-parse --verify main", dir) ? "main" : run("git rev-parse --verify master", dir) ? "master" : "main"

  const commits = run(`git log ${mainRef}..HEAD --oneline`, dir)
  const stat = run(`git diff --stat ${mainRef}..HEAD`, dir)

  const commitLines = commits
    ? commits.split("\n").map((l) => `- ${l}`).join("\n")
    : "- (no commits ahead of main)"

  return [
    `## Summary`,
    ``,
    `Branch: \`${branch}\``,
    ``,
    commitLines,
    ``,
    `## Changes`,
    ``,
    stat || "(no diff)",
    ``,
    `## Test plan`,
    ``,
    `- [ ] Manual test: `,
    `- [ ] No regressions in: `,
  ].join("\n")
}

export function copyToClipboard(text: string): boolean {
  try {
    if (process.platform === "darwin") {
      execSync("pbcopy", { input: text, stdio: ["pipe", "pipe", "pipe"] })
    } else {
      execSync("xclip -selection clipboard", { input: text, stdio: ["pipe", "pipe", "pipe"] })
    }
    return true
  } catch {
    return false
  }
}
