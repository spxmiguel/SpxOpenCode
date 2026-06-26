import { describe, test, expect, beforeEach } from "bun:test"
import { isDangerous } from "../auto-accept"
import { classify } from "../fallback"
import { acceptMode, setAcceptMode, lastError, reportError } from "../accept-mode-store"
import type { AcceptMode } from "../accept-mode-store"

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
