import { describe, test, expect } from "bun:test"
import { readFileSync } from "fs"
import { join } from "path"

const ROOT = join(import.meta.dir, "../../../../../../..")
const REPO_URL = "https://github.com/spxmiguel/SpxOpenCode"
const ENTRY_POINT = "packages/opencode/src/index.ts"
const SH = readFileSync(join(ROOT, "scripts/install.sh"), "utf8")
const PS1 = readFileSync(join(ROOT, "scripts/install.ps1"), "utf8")
const README = readFileSync(join(ROOT, "README.md"), "utf8")

describe("installer scripts", () => {
  test("install.sh references correct repo URL", () => {
    expect(SH).toContain(REPO_URL)
  })

  test("install.ps1 references correct repo URL", () => {
    expect(PS1).toContain(REPO_URL)
  })

  test("install.sh references correct entry point", () => {
    expect(SH).toContain(ENTRY_POINT)
  })

  test("install.ps1 references correct entry point", () => {
    expect(PS1).toContain(ENTRY_POINT)
  })

  test("install.sh uses bun run --conditions=browser", () => {
    expect(SH).toContain("bun run --conditions=browser")
  })

  test("install.ps1 uses bun run --conditions=browser", () => {
    expect(PS1).toContain("bun run --conditions=browser")
  })

  test("install.sh install dir is ~/.spxopencode", () => {
    expect(SH).toContain(".spxopencode")
  })

  test("install.ps1 install dir is .spxopencode", () => {
    expect(PS1).toContain(".spxopencode")
  })

  test("install.sh has alpha warning", () => {
    expect(SH.toLowerCase()).toContain("alpha")
  })

  test("install.ps1 has alpha warning", () => {
    expect(PS1.toLowerCase()).toContain("alpha")
  })

  test("install.sh exposes spxopencode command", () => {
    expect(SH).toContain("spxopencode")
  })

  test("install.ps1 exposes spxopencode command", () => {
    expect(PS1).toContain("spxopencode")
  })

  test("install.sh exposes spx alias", () => {
    expect(SH).toContain("/spx")
  })

  test("install.ps1 exposes spx alias", () => {
    expect(PS1).toContain("spx.cmd")
  })

  test("install.sh does not use sudo", () => {
    expect(SH).not.toContain("sudo")
  })
})

describe("README quick install section", () => {
  test("README has curl one-liner pointing to install.sh", () => {
    expect(README).toContain(
      "curl -fsSL https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.sh | bash"
    )
  })

  test("README has irm one-liner pointing to install.ps1", () => {
    expect(README).toContain(
      "irm https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.ps1 | iex"
    )
  })

  test("README references docs/installation.md", () => {
    expect(README).toContain("docs/installation.md")
  })

  test("README has alpha warning", () => {
    expect(README.toLowerCase()).toContain("alpha")
  })

  test("README has uninstall instructions", () => {
    expect(README).toContain("rm -rf ~/.spxopencode")
  })
})

describe("URL consistency", () => {
  test("sh and ps1 reference same repo", () => {
    const shRepo = SH.match(/https:\/\/github\.com\/[^.]+\.git/)?.[0]
    const ps1Repo = PS1.match(/https:\/\/github\.com\/[^.]+\.git/)?.[0]
    expect(shRepo).toBeDefined()
    expect(ps1Repo).toBeDefined()
    expect(shRepo).toBe(ps1Repo)
  })

  test("sh and ps1 reference same entry point", () => {
    expect(SH).toContain(ENTRY_POINT)
    expect(PS1).toContain(ENTRY_POINT)
  })
})
