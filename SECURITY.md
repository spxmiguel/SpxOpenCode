# Security Policy

## Supported Versions

SpxOpenCode is in early development. Only the latest commit on `main` is supported.

| Version | Supported |
|---------|-----------|
| main    | ✅        |
| older   | ❌        |

## Scope

SpxOpenCode security concerns fall into two categories:

**In scope:**
- Vulnerabilities in SpxOpenCode-specific code (`packages/tui/src/feature-plugins/spx/`, `spx/`)
- YOLO mode bypass — a command pattern that should be blocked but isn't
- Keybind injection or unexpected command execution via SpxOpenCode plugins
- Insecure defaults in SpxAutoAccept that could cause unintended `always` grants

**Out of scope (report to OpenCode upstream):**
- Vulnerabilities in OpenCode core packages
- Provider API key handling (OpenCode responsibility)
- Sandbox escapes (OpenCode/Bun responsibility)

## Reporting

Do not open a public GitHub issue for security vulnerabilities.

Report privately to: `miguel.r.moretti.00@gmail.com`

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

Response target: acknowledgment within 72 hours.

## YOLO Mode Warning

`YOLO` mode in SpxAutoAccept auto-approves tool-use permission requests with `always` scope. It blocks a set of hardcoded dangerous patterns but **cannot guarantee safety for all possible commands**. Use YOLO mode only in trusted, isolated environments. Never use YOLO mode on production systems or with commands you would not approve manually.
