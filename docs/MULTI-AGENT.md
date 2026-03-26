# Multi-Agent Setup Guide

Run multiple AI agents in parallel for complex tasks.

## Overview

OrionClaw supports multiple agents, each with:
- Unique identity and personality
- Independent memory
- Specialized skills
- Separate conversation threads

## Configuration

### Agent Count

Configure in `~/.openclaw/openclaw.json`:

```json
{
  "subagents": {
    "maxConcurrent": 8,
    "maxChildrenPerAgent": 8,
    "runTimeoutSeconds": 3600
  }
}
```

### Agent Definitions

Create agents in `~/.openclaw/agents/`:

```
~/.openclaw/agents/
├── researcher/
│   ├── agent/
│   │   └── models.json
│   └── workspace/
│       ├── IDENTITY.md
│       └── SOUL.md
└── developer/
    ├── agent/
    └── workspace/
```

## Cost Considerations

⚠️ **Each active agent consumes tokens independently.**

| Agents | Token Usage | Recommendation |
|--------|-------------|----------------|
| 1 | 1x | Good for most users |
| 3-5 | 3-5x | Use with free providers |
| 10+ | 10x+ | Only with unlimited free tier |

### Cost Optimization

1. **Use free providers** for parallel agents:
   - Modal GLM-5 (unlimited until Apr 30)
   - OpenRouter free tier
   - Ollama local

2. **Spawn agents on-demand** instead of running 24/7

3. **Set timeouts** to auto-terminate idle agents

## Spawning Agents

### From Main Agent

```javascript
sessions_spawn({
  task: "Research topic X",
  agentId: "researcher",
  timeoutSeconds: 10800  // 3 hours
});
```

### Coordination Patterns

**Sequential:**
```
Main → Agent A → Agent B → Main
```

**Parallel:**
```
Main → Agent A
     → Agent B → Main (waits for all)
     → Agent C
```

**Hierarchical:**
```
Main (Leader)
  └── Researcher (spawns sub-agents)
        ├── Web Scraper
        └── Analyzer
  └── Developer
        ├── Backend
        └── Frontend
```

## Communication

Agents communicate via:

1. **sessions_send** - Direct messages
2. **Shared files** - Write to common workspace
3. **Memory** - Shared MEMORY.md

## Example: Research Team

```yaml
# Main orchestrates
- Spawn "researcher" with task
- Spawn "analyst" with task
- Wait for results
- Synthesize findings
```

## Best Practices

1. **Start small** - Begin with 1 agent, add more as needed
2. **Define clear roles** - Each agent should have a specialty
3. **Set timeouts** - Prevent runaway costs
4. **Use heartbeats** - Monitor agent activity
5. **Share context** - Use common MEMORY.md for coordination

---

*For more details, see [OpenClaw Docs](https://docs.openclaw.ai)*
