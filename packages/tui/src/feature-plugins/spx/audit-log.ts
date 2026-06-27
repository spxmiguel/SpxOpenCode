import { appendFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"

const sessionStart = new Date()
const sessionTag = `${sessionStart.toISOString().slice(0, 10)}-${sessionStart.getTime()}`

let auditPath: string | null = null

function getPath(projectDir: string): string {
  if (!auditPath) {
    const dir = join(projectDir, ".spx", "audit")
    mkdirSync(dir, { recursive: true })
    auditPath = join(dir, `${sessionTag}.jsonl`)
  }
  return auditPath
}

export interface AuditEntry {
  ts: string
  mode: "yolo" | "auto"
  patterns: string[]
  reply: "always" | "once"
}

export function writeAuditEntry(projectDir: string, entry: AuditEntry): void {
  try {
    appendFileSync(getPath(projectDir), JSON.stringify(entry) + "\n", "utf-8")
  } catch {
    // audit failure must never disrupt tool approval flow
  }
}
