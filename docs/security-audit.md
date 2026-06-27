# Security Audit

**Date:** 2026-06-27  
**SpxOpenCode version:** v1.0-rc.1

---

## Summary

SpxOpenCode adds two distinct security-relevant surfaces: the YOLO danger pattern list and the community plugin loader. Both are reviewed here.

**Security verdict: ACCEPTABLE for RC.** Known limitations documented. No remote code execution, no credential exposure, no network calls from SpxOpenCode itself.

---

## YOLO mode danger pattern list

**File:** `packages/tui/src/feature-plugins/spx/auto-accept.ts`  
**Function:** `isDangerous(command: string): boolean`

### What it does

In YOLO mode, every tool call is auto-approved with `always` scope — except for commands matching danger patterns, which are rejected.

### Current patterns (regex-based)

```
rm -rf, rm -r, sudo rm
mkfs
dd if=
>> /dev/
: > /
del /s, rmdir /q, rd /s
diskpart, format <drive>:
fdisk, parted
shred, wipefs
/System/, /Library/
/etc/, /usr/, /bin/, /boot/, /dev/, /proc/, /sys/, /lib/
```

### Strengths

- Pattern matching runs locally in <1 ms — no network call, no AI call
- Rejection is hard (`reject` scope, not `once`) — cannot be re-approved by user in the same session without switching mode
- Patterns tested in `spx.test.ts` (10 test cases for `isDangerous`)

### Known limitations

1. **String matching only.** A determined attacker (or confused AI) can bypass patterns using shell encoding: `r''m -rf /`, `$(echo 'rm') -rf /`, hex escapes, etc. YOLO mode is a convenience tool, not a security boundary.

2. **Does not intercept MCP tool calls that write files.** Only the command string passed to the shell tool is checked. An MCP server's `write_file` tool writing to `/etc/hosts` would not be blocked.

3. **Pattern list is not exhaustive.** `truncate -s 0 /important/file`, `chmod -R 777 /`, `chown` commands, and many other destructive patterns are not blocked.

4. **No coverage for Windows PowerShell one-liners.** `Remove-Item -Recurse -Force` is not in the pattern list.

### Recommendation

Document YOLO mode as a **convenience feature that reduces prompts for safe operations**, not a security guarantee. Users who need a hard security boundary should use Manual mode with explicit per-tool approval. This is already stated in docs/shortcuts.md.

---

## Community plugin loader

**Files:**  
- `packages/tui/src/feature-plugins/spx/spx-plugin-host.ts`  
- `packages/tui/src/feature-plugins/spx/spx-plugin-loader.ts`

### What it does

Loads `.js` files from `.spx/plugins/` in the current project directory via dynamic `import()`. Each loaded file's default export is validated against the `SpxPlugin` shape and, if valid, called with the `SpxApi` subset.

### Security model

Community plugins run **with the same privileges as SpxOpenCode** — which is the same as the OpenCode process itself. There is no sandbox.

### Threat model

| Threat | Risk | Mitigation |
|--------|------|-----------|
| Malicious plugin from untrusted source | High | User explicitly places file in `.spx/plugins/` — local file system only, no auto-download |
| Plugin reads sensitive env vars | High (if installed) | No mitigation — same process |
| Plugin exfiltrates data via network | High (if installed) | No mitigation — same process |
| Plugin calls dangerous shell commands | High (if installed) | No mitigation — same process |
| Plugin crashes SpxOpenCode | Low | Load errors are caught; plugin is skipped, session continues |
| Plugin modifies SpxOpenCode internal state | Medium | `SpxApi` surface is limited — plugins cannot access `api.app`, `api.mode`, `api.lifecycle` |

### Current mitigations

1. **Local file system only.** Plugins must be manually placed in `.spx/plugins/`. SpxOpenCode does not download plugins from any source.
2. **Shape validation.** Files not exporting a valid `SpxPlugin` object are rejected at load time with a descriptive error.
3. **Error isolation.** A plugin that throws during `tui()` is caught and logged — it does not crash other plugins or the session.
4. **Restricted API surface.** `SpxApi` exposes ~10 of ~18 `TuiPluginApi` members — the most dangerous internals (`api.app`, `api.renderer`, `api.lifecycle`) are not exposed.

### Limitations

1. **No sandboxing.** A malicious plugin has full access to the Node.js/Bun runtime. This is the same threat model as `npm install` running a postinstall script.
2. **No signature verification.** There is no way to verify that a plugin file was not tampered with after the user placed it.
3. **`SpxApi` restriction is advisory, not enforced.** A plugin can call `(api as any).app` if it exists on the actual runtime object.

### Recommendation

Document clearly: **only install plugins from sources you trust**. This is the same advice given for npm packages, shell scripts, and any other executable code. SpxOpenCode should add a prominent warning to `docs/plugin-system.md` (already exists; verify content).

---

## Credential and secret handling

SpxOpenCode does not:
- Read, store, or transmit API keys or credentials
- Access environment variables beyond what OpenCode already reads
- Write to any location outside `.spx/` in the project directory and `.spxopencode/` in the home directory

The YOLO audit log (`.spx/audit/`) records tool calls and their inputs. If a tool call includes a secret in its arguments (e.g., `curl -H "Authorization: Bearer sk-..."`) that input will appear in the audit log. **Users should be aware that audit logs may contain sensitive data.**

---

## Dependency surface

SpxOpenCode adds no npm dependencies beyond what OpenCode already uses. All SpxOpenCode code is TypeScript compiled into the existing OpenCode bundle. The only external runtime dependency is the Node.js/Bun `fs` module (already available).

---

## Issue #8: Integration test for YOLO danger patterns

Open GitHub issue #8 requests an integration test verifying that YOLO mode correctly rejects dangerous commands end-to-end (not just `isDangerous()` unit tests). This is a gap — the unit tests cover `isDangerous()` but not the full approve/reject flow. **Not blocking for RC.**

---

## Conclusion

SpxOpenCode's security posture is appropriate for a developer tool running in a local terminal. The main risks are:

1. **YOLO mode is not a security boundary** — documented.
2. **Community plugins run unsandboxed** — documented; mitigated by local-file-only loading.
3. **Audit logs may contain sensitive data** — users should treat `.spx/audit/` as potentially sensitive.

No remote attack surface. No credential storage. No network calls from SpxOpenCode code.
