import { describe, test, expect, beforeEach } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { mkdir, mkdtemp, writeFile, rm } from "node:fs/promises"
import { isDangerous } from "../auto-accept"
import { classify } from "../fallback"
import { acceptMode, setAcceptMode, lastError, reportError } from "../accept-mode-store"
import type { AcceptMode } from "../accept-mode-store"
import { parseSkill, loadSkillsDir } from "../skill-loader"
import { checkSkillsHealth } from "../doctor"

// ---------------------------------------------------------------------------
// isDangerous
// ---------------------------------------------------------------------------

describe("isDangerous", () => {
  test("blocks rm -rf", () => {
    expect(isDangerous(["rm -rf /tmp/test"])).toBe(true)
  })

  test("blocks sudo", () => {
    expect(isDangerous(["sudo apt install vim"])).toBe(true)
  })

  test("blocks diskpart (Windows)", () => {
    expect(isDangerous(["diskpart"])).toBe(true)
  })

  test("blocks del /s (Windows)", () => {
    expect(isDangerous(["del /s C:\\Users\\foo"])).toBe(true)
  })

  test("blocks C:\\Windows\\ path", () => {
    expect(isDangerous(["copy file.exe C:\\Windows\\System32\\"])).toBe(true)
  })

  test("blocks /System/ path (macOS)", () => {
    expect(isDangerous(["rm /System/Library/foo"])).toBe(true)
  })

  test("blocks /Library/ path (macOS)", () => {
    expect(isDangerous(["chmod 777 /Library/Application Support/"])).toBe(true)
  })

  test("blocks /etc/ path", () => {
    expect(isDangerous(["cat /etc/passwd"])).toBe(true)
  })

  test("allows safe commands", () => {
    expect(isDangerous(["git status"])).toBe(false)
    expect(isDangerous(["ls -la"])).toBe(false)
    expect(isDangerous(["npm install"])).toBe(false)
    expect(isDangerous(["bun run dev"])).toBe(false)
  })

  test("allows empty array", () => {
    expect(isDangerous([])).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// classify
// ---------------------------------------------------------------------------

describe("classify", () => {
  test("classifies 401 as auth error", () => {
    const result = classify({ statusCode: 401 })
    expect(result?.title).toBe("Auth error")
  })

  test("classifies 429 as rate limited", () => {
    const result = classify({ statusCode: 429 })
    expect(result?.title).toBe("Rate limited")
  })

  test("classifies quota message", () => {
    const result = classify({ responseBody: "insufficient_quota" })
    expect(result?.title).toBe("Quota exceeded")
  })

  test("classifies context overflow", () => {
    const result = classify({ responseBody: "context_length_exceeded" })
    expect(result?.title).toBe("Context overflow")
  })

  test("classifies ProviderHeaderTimeoutError", () => {
    const result = classify({ name: "ProviderHeaderTimeoutError" })
    expect(result?.title).toBe("Provider timeout")
  })

  test("returns undefined for unknown errors", () => {
    expect(classify({ message: "something random" })).toBeUndefined()
  })

  test("returns undefined for null", () => {
    expect(classify(null)).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// cycleMode logic
// ---------------------------------------------------------------------------

describe("cycleMode logic", () => {
  function cycle(current: AcceptMode): AcceptMode {
    return current === "manual" ? "auto" : current === "auto" ? "yolo" : "manual"
  }

  test("manual → auto", () => expect(cycle("manual")).toBe("auto"))
  test("auto → yolo", () => expect(cycle("auto")).toBe("yolo"))
  test("yolo → manual", () => expect(cycle("yolo")).toBe("manual"))
})

// ---------------------------------------------------------------------------
// reportError / lastError signal
// ---------------------------------------------------------------------------

describe("reportError", () => {
  beforeEach(() => {
    // Reset error state before each test
    setAcceptMode("manual")
  })

  test("sets lastError immediately", () => {
    reportError("Test error", 60_000)
    expect(lastError()).toBe("Test error")
  })

  test("overwrites previous error", () => {
    reportError("First error", 60_000)
    reportError("Second error", 60_000)
    expect(lastError()).toBe("Second error")
  })
})

// ---------------------------------------------------------------------------
// parseSkill
// ---------------------------------------------------------------------------

const VALID_SKILL = `---
id: test-skill
name: Test Skill
description: A test skill
version: 1.0.0
tags: [test, example]
---

Skill body here.
`

describe("parseSkill", () => {
  test("parses valid skill", () => {
    const result = parseSkill(VALID_SKILL, "test.md")
    if ("reason" in result) throw new Error(result.reason)
    expect(result.id).toBe("test-skill")
    expect(result.name).toBe("Test Skill")
    expect(result.tags).toEqual(["test", "example"])
    expect(result.body).toBe("Skill body here.")
    expect(result.source).toBe("test.md")
  })

  test("error on missing frontmatter", () => {
    const result = parseSkill("No frontmatter here", "bad.md")
    expect("reason" in result).toBe(true)
    if ("reason" in result) expect(result.reason).toContain("missing frontmatter")
  })

  test("error on missing id", () => {
    const content = VALID_SKILL.replace("id: test-skill\n", "")
    const result = parseSkill(content, "no-id.md")
    expect("reason" in result).toBe(true)
    if ("reason" in result) expect(result.reason).toContain("missing required field: id")
  })

  test("error on missing name", () => {
    const content = VALID_SKILL.replace("name: Test Skill\n", "")
    const result = parseSkill(content, "no-name.md")
    expect("reason" in result).toBe(true)
    if ("reason" in result) expect(result.reason).toContain("missing required field: name")
  })

  test("error on missing version", () => {
    const content = VALID_SKILL.replace("version: 1.0.0\n", "")
    const result = parseSkill(content, "no-version.md")
    expect("reason" in result).toBe(true)
    if ("reason" in result) expect(result.reason).toContain("missing required field: version")
  })

  test("error on missing tags", () => {
    const content = VALID_SKILL.replace("tags: [test, example]\n", "")
    const result = parseSkill(content, "no-tags.md")
    expect("reason" in result).toBe(true)
    if ("reason" in result) expect(result.reason).toContain("missing required field: tags")
  })
})

// ---------------------------------------------------------------------------
// loadSkillsDir
// ---------------------------------------------------------------------------

describe("loadSkillsDir", () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "spx-test-skills-"))
  })

  test("loads valid skill", async () => {
    await writeFile(join(dir, "test.md"), VALID_SKILL)
    const result = await loadSkillsDir(dir)
    expect(result.skills).toHaveLength(1)
    expect(result.errors).toHaveLength(0)
    expect(result.skills[0].id).toBe("test-skill")
  })

  test("ignores non-md files", async () => {
    await writeFile(join(dir, "test.md"), VALID_SKILL)
    await writeFile(join(dir, "readme.txt"), "not a skill")
    await writeFile(join(dir, "script.js"), "console.log()")
    const result = await loadSkillsDir(dir)
    expect(result.skills).toHaveLength(1)
  })

  test("reports missing frontmatter as error", async () => {
    await writeFile(join(dir, "bad.md"), "No frontmatter here")
    const result = await loadSkillsDir(dir)
    expect(result.skills).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].reason).toContain("missing frontmatter")
  })

  test("reports missing required field as error", async () => {
    const content = VALID_SKILL.replace("name: Test Skill\n", "")
    await writeFile(join(dir, "no-name.md"), content)
    const result = await loadSkillsDir(dir)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].reason).toContain("missing required field: name")
  })

  test("reports duplicate id as error", async () => {
    await writeFile(join(dir, "a.md"), VALID_SKILL)
    await writeFile(join(dir, "b.md"), VALID_SKILL)
    const result = await loadSkillsDir(dir)
    expect(result.skills).toHaveLength(1)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].reason).toContain("duplicate id")
  })

  test("nonexistent dir returns empty result", async () => {
    const result = await loadSkillsDir("/nonexistent/path/that/does/not/exist")
    expect(result.skills).toHaveLength(0)
    expect(result.errors).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// checkSkillsHealth
// ---------------------------------------------------------------------------

describe("checkSkillsHealth", () => {
  test("ok with loaded skills", () => {
    const result = checkSkillsHealth({
      skills: [{ id: "s1", name: "S1", description: "d", version: "1.0.0", tags: ["t"], body: "", source: "s1.md" }],
      errors: [],
    })
    expect(result.ok).toBe(true)
    expect(result.message).toContain("s1")
  })

  test("ok when empty (no skills dir or empty dir)", () => {
    const result = checkSkillsHealth({ skills: [], errors: [] })
    expect(result.ok).toBe(true)
    expect(result.message).toContain("empty")
  })

  test("error when skills have errors", () => {
    const result = checkSkillsHealth({
      skills: [],
      errors: [{ source: "bad.md", reason: "missing frontmatter" }],
    })
    expect(result.ok).toBe(false)
    expect(result.fix).toContain("bad.md")
  })

  test("partial error: some ok, some invalid", () => {
    const result = checkSkillsHealth({
      skills: [{ id: "s1", name: "S1", description: "d", version: "1.0.0", tags: ["t"], body: "", source: "s1.md" }],
      errors: [{ source: "bad.md", reason: "missing required field: id" }],
    })
    expect(result.ok).toBe(false)
    expect(result.message).toContain("1 skill(s) loaded")
    expect(result.message).toContain("1 invalid")
  })
})
