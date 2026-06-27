import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { mkdtemp, rm } from "node:fs/promises"
import { execSync } from "node:child_process"
import { generateCommitMessage, generatePrDescription, generateChangelog } from "../skill-generators"

function git(cmd: string, cwd: string) {
  execSync(cmd, { cwd, stdio: "pipe" })
}

function gitOut(cmd: string, cwd: string): string {
  return execSync(cmd, { cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim()
}

function commit(msg: string, cwd: string) {
  execSync(`git commit --allow-empty -m "${msg}"`, {
    cwd,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Test",
      GIT_AUTHOR_EMAIL: "test@test.com",
      GIT_COMMITTER_NAME: "Test",
      GIT_COMMITTER_EMAIL: "test@test.com",
    },
    stdio: "pipe",
  })
}

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "spx-skill-gen-"))
  git("git init", dir)
  git("git config user.email test@test.com", dir)
  git("git config user.name Test", dir)
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

// ---------------------------------------------------------------------------
// generateChangelog
// ---------------------------------------------------------------------------

describe("generateChangelog", () => {
  test("no commits → informative fallback", () => {
    const result = generateChangelog(dir)
    expect(result).toMatch(/no commits/i)
  })

  test("conventional commits grouped by type", () => {
    commit("feat(ui): add logo overlay", dir)
    commit("fix(router): handle empty provider list", dir)
    commit("docs(readme): update install instructions", dir)
    commit("chore: bump bun version", dir)

    const result = generateChangelog(dir)
    expect(result).toContain("### Features")
    expect(result).toContain("ui: add logo overlay")
    expect(result).toContain("### Bug Fixes")
    expect(result).toContain("router: handle empty provider list")
    expect(result).toContain("### Documentation")
    expect(result).toContain("readme: update install instructions")
    expect(result).toContain("### Chores")
    expect(result).toContain("bump bun version")
  })

  test("breaking change (! suffix) promoted to top section", () => {
    commit("feat(auth)!: drop Node 16 support", dir)
    commit("fix: minor patch", dir)

    const result = generateChangelog(dir)
    expect(result).toContain("### Breaking Changes")
    const breakIdx = result.indexOf("### Breaking Changes")
    const featIdx = result.indexOf("### Features")
    expect(breakIdx).toBeLessThan(featIdx === -1 ? Infinity : featIdx)
  })

  test("no-scope commit parsed correctly", () => {
    commit("feat: add skill:changelog command", dir)

    const result = generateChangelog(dir)
    expect(result).toContain("### Features")
    expect(result).toContain("add skill:changelog command")
  })

  test("non-conventional commit goes to Other section", () => {
    commit("Initial commit", dir)

    const result = generateChangelog(dir)
    expect(result).toContain("### Other")
    expect(result).toContain("Initial commit")
  })

  test("since last tag — only includes commits after tag", () => {
    commit("feat: before tag", dir)
    execSync("git tag v0.1.0", { cwd: dir, stdio: "pipe" })
    commit("fix: after tag", dir)
    commit("feat: also after tag", dir)

    const result = generateChangelog(dir)
    expect(result).not.toContain("before tag")
    expect(result).toContain("after tag")
    expect(result).toContain("also after tag")
  })

  test("no commits since tag → no-commit fallback", () => {
    commit("feat: initial", dir)
    execSync("git tag v1.0.0", { cwd: dir, stdio: "pipe" })

    const result = generateChangelog(dir)
    expect(result).toMatch(/no commits since v1\.0\.0/i)
  })

  test("header contains today's date in YYYY-MM-DD format", () => {
    commit("fix: something", dir)

    const today = new Date().toISOString().slice(0, 10)
    const result = generateChangelog(dir)
    expect(result).toContain(`## [Unreleased] — ${today}`)
  })

  test("non-git directory → no-commit fallback", () => {
    const result = generateChangelog("/tmp")
    // /tmp is not a git repo — should not crash, returns fallback message
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// generateCommitMessage
// ---------------------------------------------------------------------------

describe("generateCommitMessage", () => {
  test("no staged files → placeholder message", () => {
    commit("initial", dir)
    const result = generateCommitMessage(dir)
    expect(result).toMatch(/no staged changes/i)
  })

  test("staged file → generates type:scope header", async () => {
    const { writeFile } = await import("node:fs/promises")
    await writeFile(join(dir, "foo.ts"), "export const x = 1")
    git("git add foo.ts", dir)

    const result = generateCommitMessage(dir)
    expect(result).toMatch(/^(feat|fix|chore|test|docs|refactor|perf|ci|build)/)
  })
})

// ---------------------------------------------------------------------------
// generatePrDescription
// ---------------------------------------------------------------------------

describe("generatePrDescription", () => {
  test("returns string with expected sections", () => {
    commit("initial commit", dir)

    const result = generatePrDescription(dir)
    expect(result).toContain("## Summary")
    expect(result).toContain("## Changes")
    expect(result).toContain("## Test plan")
  })

  test("includes current branch name", () => {
    commit("initial", dir)
    const branch = gitOut("git rev-parse --abbrev-ref HEAD", dir)

    const result = generatePrDescription(dir)
    expect(result).toContain(branch)
  })
})
