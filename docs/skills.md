# SpxOpenCode Skills

Skills are reusable markdown documents that provide structured guidance, prompt templates, and checklists for specific tasks. They are not executable — they are instructions.

## Directory

Skills live in `spx/skills/` at the project root. Each skill is a `.md` file with required frontmatter.

## Required frontmatter

```markdown
---
id: my-skill
name: My Skill
description: One-line description of what this skill does
version: 0.1.0
tags: [tag1, tag2]
---

Skill content here.
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (kebab-case) |
| `name` | string | Human-readable name |
| `description` | string | One-line summary |
| `version` | string | Semver string |
| `tags` | array | One or more tags (inline array syntax) |

## Creating a skill

1. Add a `.md` file to `spx/skills/`
2. Add the frontmatter block
3. Write the skill body (purpose, when to use, when NOT to use, prompt structure, examples, limits)
4. Run `/doctor` to validate

## Limitations

- Skills are **documentation only** — no code execution
- Each skill needs a unique `id` — duplicates are rejected by the loader
- Files without `.md` extension are ignored

## Security

Skills are loaded from the filesystem at runtime. Do not put credentials, tokens, or sensitive data in skill files.

## Validation

The skill loader (`skill-loader.ts`) validates:
- Frontmatter present and parseable
- All required fields present and non-empty
- No duplicate IDs across loaded skills

Use `/doctor` to check skills health at any time.
