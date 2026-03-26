# Creating Custom Skills

Skills extend your agent's capabilities. This guide shows how to create them.

## Skill Structure

```
skills/
└── my-skill/
    ├── SKILL.md      # Required: Skill documentation
    ├── scripts/      # Optional: Executable scripts
    └── references/   # Optional: Reference files
```

## SKILL.md Format

```yaml
---
name: my-skill
description: |
  Short description of what this skill does.
  Use when: specific situations where this skill applies.
metadata:
  openclaw:
    emoji: 🔧
    requires:
      anyBins: [node]  # Optional: required binaries
---

# My Skill

Detailed documentation of your skill.

## Commands

Document available commands here.

## Examples

Show usage examples.
```

## Example: Weather Skill

```yaml
---
name: weather
description: |
  Get current weather and forecasts via wttr.in or Open-Meteo.
  Use when: user asks about weather, temperature, or forecasts.
metadata:
  openclaw:
    emoji: 🌤️
---

# Weather Skill

## Usage

\`\`\`bash
curl wttr.in/London
curl "wttr.in/London?format=%C+%t"
\`\`\`

## Parameters

- City name: `wttr.in/{city}`
- Format: `?format={format_string}`
- Language: `?lang={language_code}`
```

## Best Practices

1. **Clear trigger conditions** - Define when the skill should be used
2. **Minimal dependencies** - Avoid requiring rare binaries
3. **Good examples** - Show real usage scenarios
4. **Error handling** - Document what to do when things fail

## Installing Skills

Place skills in `~/OrionClaw/skills/` and they'll be auto-discovered.

## Sharing Skills

Publish to [ClawHub](https://clawhub.ai) to share with the community.
