# SpxOpenCode Doctor

Run with `/doctor` slash command in the TUI.

## What it checks

| Check | OK condition | Fail condition |
|-------|-------------|----------------|
| Providers | At least one provider configured | No providers |
| Git | Inside a git repo with a branch | Not a git repo |
| MCP | All servers connected (or none configured) | One or more MCP servers failed |
| LSP | All servers running (or none configured) | One or more LSP servers errored |
| Skills | All `.md` files in `spx/skills/` load cleanly | Invalid frontmatter, missing fields, duplicate IDs |

## Skills check (v2)

Doctor loads all skills from `spx/skills/` and reports:

- **No skills installed** — directory is empty or missing (not an error)
- **N skill(s) loaded** — all skills valid
- **N skill(s) loaded, M invalid** — partial failure; fix info lists each invalid file and reason
- **All N skill(s) failed** — all files in the dir are invalid

## Reading the report

```
✓ Providers: 2 provider(s) configured.
✓ Git: On branch: main
✓ MCP: 1/1 MCP server(s) connected.
✓ LSP: No LSP servers configured (optional).
✓ Skills: 1 skill(s) loaded: claude-for-legal.
```

Failed checks show a fix hint:
```
✗ Skills: 1 skill(s) loaded, 1 invalid.
  → broken.md: missing required field: id
```

## Fixing skill errors

- Missing frontmatter: add `--- ... ---` block at top of file
- Missing field: add the required field to the frontmatter
- Duplicate ID: rename the `id` field to be unique
