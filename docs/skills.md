# SpxOpenCode Skills

Skills are reusable markdown documents that provide structured guidance, prompt templates, and checklists for specific tasks. They are not executable — they are instructions.

## Built-in skills

SpxOpenCode ships with three built-in skills, available via the command palette or slash commands:

| Command | Alias | Description |
|---------|-------|-------------|
| `/skill:commit` | `/commit-msg` | Generate conventional commit message from staged diff |
| `/skill:changelog` | `/changelog` | Generate CHANGELOG entry from git log since last tag |
| `/skill:pr` | `/pr-desc` | Generate PR description template from git log |

All built-in skills output is copied to clipboard automatically.

## Custom (project-level) skills

Add your own skills to `.spx/skills/` at your project root. SpxOpenCode loads them automatically at startup and registers each as a slash command `/skill:<id>`.

**Directory**: `.spx/skills/` (at project root, relative to where you run SpxOpenCode)

**Example structure:**
```
my-project/
└── .spx/
    └── skills/
        ├── standup.md
        └── retro.md
```

Each skill appears in the command palette under "SpxOpenCode (Custom)" and is accessible via `/skill:<id>`.

## Built-in skill templates

Built-in skill templates live in `packages/tui/src/feature-plugins/spx/skills/`. Each `.md` file with required frontmatter.

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

## Creating a custom skill

1. Add a `.md` file to `.spx/skills/` at your project root
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
