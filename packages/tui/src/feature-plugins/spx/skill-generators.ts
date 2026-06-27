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

const COMMIT_TYPE_LABELS: Record<string, string> = {
  feat: "Features",
  fix: "Bug Fixes",
  perf: "Performance",
  refactor: "Refactoring",
  docs: "Documentation",
  test: "Tests",
  chore: "Chores",
  ci: "CI/CD",
  build: "Build",
}

const TYPE_ORDER = ["feat", "fix", "perf", "refactor", "docs", "test", "chore", "ci", "build"]

export function generateChangelog(dir: string): string {
  const lastTag = run("git describe --tags --abbrev=0 2>/dev/null", dir)
  const range = lastTag ? `${lastTag}..HEAD` : "HEAD"
  const rawLog = run(`git log ${range} --pretty=format:"%s"`, dir)

  if (!rawLog) {
    return lastTag
      ? `No commits since ${lastTag}.`
      : "No commits found. Is this a git repository?"
  }

  const today = new Date().toISOString().slice(0, 10)
  const header = `## [Unreleased] — ${today}`

  const lines = rawLog.split("\n").filter(Boolean)
  const breaking: string[] = []
  const grouped: Record<string, string[]> = {}

  for (const line of lines) {
    const match = line.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s+(.+)$/)
    if (!match) {
      ;(grouped["other"] ??= []).push(line)
      continue
    }
    const [, type, scope, bang, subject] = match
    const entry = scope ? `${scope}: ${subject}` : subject
    if (bang || line.toLowerCase().includes("breaking change")) {
      breaking.push(`${type}(${scope ?? "*"}): ${subject}`)
    } else {
      ;(grouped[type] ??= []).push(entry)
    }
  }

  const sections: string[] = [header, ""]

  if (breaking.length > 0) {
    sections.push("### Breaking Changes")
    breaking.forEach((l) => sections.push(`- ${l}`))
    sections.push("")
  }

  for (const type of TYPE_ORDER) {
    const entries = grouped[type]
    if (!entries || entries.length === 0) continue
    sections.push(`### ${COMMIT_TYPE_LABELS[type] ?? type}`)
    entries.forEach((e) => sections.push(`- ${e}`))
    sections.push("")
  }

  if (grouped["other"] && grouped["other"].length > 0) {
    sections.push("### Other")
    grouped["other"].forEach((e) => sections.push(`- ${e}`))
    sections.push("")
  }

  return sections.join("\n").trimEnd()
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
