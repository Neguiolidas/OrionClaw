# 🐺 OrionClaw Documentation

**Version:** 1.0.0  
**Repository:** https://github.com/Neguiolidas/OrionClaw  
**Based on:** [OpenClaw](https://github.com/openclaw/openclaw)

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Multi-Agent Setup](#multi-agent-setup)
6. [Providers](#providers)
7. [Channels](#channels)
8. [Memory System](#memory-system)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

OrionClaw is an automated installer for OpenClaw focused on:

- **Free AI Models** - GLM-5, Llama 4, Gemini Flash, Qwen3, Ollama
- **Multi-Agent Orchestration** - Run multiple specialized agents
- **One-Click Installation** - Automated setup with all dependencies
- **Cross-Platform** - Windows (WSL2), macOS, Linux

### What's Included

| Component | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22 LTS | Runtime environment |
| OpenClaw CLI | Latest | AI assistant framework |
| Git | Latest | Version control |
| Optional: Ollama | Latest | Local model execution |

---

## Quick Start

### Windows (PowerShell as Admin)
```powershell
irm https://raw.githubusercontent.com/Neguiolidas/OrionClaw/main/scripts/install.ps1 | iex
```

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/Neguiolidas/OrionClaw/main/scripts/install.sh | bash
```

### Web Installer
Visit the [web installer](https://neguiolidas.app/orionclaw) for a guided setup.

---

## Installation

### Requirements

| OS | Requirements |
|----|--------------|
| **Windows** | Windows 10/11, Admin rights |
| **macOS** | macOS 12+, Admin rights |
| **Linux** | Ubuntu/Debian/Fedora, sudo access |

### What Gets Installed

1. **Node.js 22 LTS** - Via NodeSource (Linux/macOS) or official installer
2. **Git** - Version control for workspace
3. **OpenClaw CLI** - `npm install -g openclaw`
4. **Workspace** - `~/OrionClaw/` with templates
5. **Optional: Ollama** - Local model execution
6. **Optional: Modal Proxy** - GLM-5 free tier

### Post-Installation

After installation completes:

```bash
# Enter WSL (Windows only)
wsl

# Start terminal interface
openclaw tui

# Check status
openclaw status

# Manage gateway
openclaw gateway start
openclaw gateway stop
```

---

## Configuration

### Main Config File

Location: `~/.openclaw/openclaw.json`

```json
{
  "$schema": "https://docs.openclaw.ai/schema/openclaw.json",
  "providers": {
    "openrouter": {
      "apiKey": "sk-or-v1-..."
    },
    "google": {
      "apiKey": "AIzaSy..."
    },
    "ollama": {
      "baseUrl": "http://127.0.0.1:11434"
    }
  },
  "channels": {
    "telegram": {
      "token": "123456789:ABC..."
    }
  },
  "agents": {
    "defaults": {
      "model": "openrouter/meta-llama/llama-4-scout",
      "compaction": {
        "mode": "safeguard",
        "reserveTokensFloor": 30000
      }
    }
  }
}
```

### Workspace Files

| File | Purpose |
|------|---------|
| `USER.md` | Your preferences and info |
| `IDENTITY.md` | Agent's name and personality |
| `AGENTS.md` | Agent behavior rules |
| `SOUL.md` | Personality details |
| `MEMORY.md` | Long-term knowledge |
| `memory/YYYY-MM-DD.md` | Daily logs |

---

## Multi-Agent Setup

### Configuration

Edit `~/.openclaw/openclaw.json`:

```json
{
  "subagents": {
    "maxConcurrent": 8,
    "maxChildrenPerAgent": 8,
    "runTimeoutSeconds": 3600
  }
}
```

### Creating Agents

```bash
# Create agent directory
mkdir -p ~/.openclaw/agents/researcher/workspace

# Copy workspace templates
cp ~/OrionClaw/workspace/*.md ~/.openclaw/agents/researcher/workspace/

# Customize IDENTITY.md
echo "- **Nome:** Researcher" > ~/.openclaw/agents/researcher/workspace/IDENTITY.md
```

### Cost Considerations

| Agents | Token Usage | Recommendation |
|--------|-------------|----------------|
| 1 | 1x | Good for most users |
| 3-5 | 3-5x | Use with free providers |
| 10+ | 10x+ | Only with unlimited free tier |

### Spawning Agents

From your main agent:

```
Use sessions_spawn to spawn a sub-agent with task "Research topic X"
```

---

## Providers

### Free Providers

| Provider | Models | Free Tier |
|----------|--------|-----------|
| **Modal GLM-5** | GLM-5-FP8 | ⏰ Until Apr 30, 2026 |
| **OpenRouter** | Llama 4, Qwen3, Mistral | ✅ Generous free tier |
| **Google AI** | Gemini 2.5 Flash | ✅ Free tier |
| **Ollama** | Local models | ✅ 100% free |
| **OpenCode** | GLM-4.7, Kimi K2.5 | ✅ Free tier |
| **Kilo Gateway** | Auto-routing | ✅ Free tier |

### Paid Providers

| Provider | Models | Pricing |
|----------|--------|---------|
| **Anthropic** | Claude Opus/Sonnet 4.x | Pay per use |
| **OpenAI** | GPT-4.5, o3, o4-mini | Pay per use |

### Setting Up Providers

```bash
# Set API key
openclaw config set providers.openrouter.apiKey "sk-or-v1-..."

# Set default model
openclaw config set agents.defaults.model "openrouter/meta-llama/llama-4-scout"
```

### Modal GLM-5 Proxy

If you selected Modal GLM-5, a proxy is set up at `http://127.0.0.1:8765`:

```bash
# Check proxy status
curl http://127.0.0.1:8765/health

# Restart proxy (Linux)
systemctl --user restart modal-glm5-proxy

# Restart proxy (macOS)
launchctl load ~/Library/LaunchAgents/com.orionclaw.modal-proxy.plist
```

---

## Channels

### Telegram

1. Create bot via [@BotFather](https://t.me/BotFather)
2. Copy the bot token
3. Add to config:

```json
{
  "channels": {
    "telegram": {
      "token": "1234567890:ABCdef..."
    }
  }
}
```

4. Start chatting with your bot!

### Discord

1. Create bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. Copy the bot token
3. Add to config:

```json
{
  "channels": {
    "discord": {
      "token": "MTk4NjIy..."
    }
  }
}
```

4. Invite bot to your server
5. Chat in any channel the bot has access to

### WhatsApp

Configured via QR code after installation:

```bash
openclaw channels login whatsapp
```

---

## Memory System

### Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| **Episodic** | `memory/YYYY-MM-DD.md` | Daily events |
| **Semantic** | `MEMORY.md` | Long-term knowledge |
| **Competence** | `AGENTS.md` | Learned procedures |

### Best Practices

1. **Write it down** - Don't rely on "mental notes"
2. **Consolidate** - Move important patterns to `MEMORY.md`
3. **Review** - Periodically clean up outdated info
4. **Use search** - Agent searches memory before complex tasks

### Memory Commands

```bash
# View today's memory
cat ~/OrionClaw/memory/$(date +%Y-%m-%d).md

# Search memories
grep -r "important topic" ~/OrionClaw/memory/
```

---

## Troubleshooting

### Gateway Won't Start

```bash
# Check logs
openclaw gateway logs

# Run doctor
openclaw doctor --fix

# Restart
openclaw gateway restart
```

### Node.js Issues

```bash
# Check version (must be 20+)
node --version

# Reinstall Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

### Permission Errors

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.openclaw
```

### Modal Proxy Down

```bash
# Check status
curl http://127.0.0.1:8765/health

# Restart (Linux)
systemctl --user restart modal-glm5-proxy

# Check logs
journalctl --user -u modal-glm5-proxy -f
```

### Ollama Not Responding

```bash
# Start Ollama service
ollama serve &

# Pull a model
ollama pull llama3

# Test
ollama run llama3 "Hello"
```

---

## Support

- **GitHub Issues:** https://github.com/Neguiolidas/OrionClaw/issues
- **OpenClaw Docs:** https://docs.openclaw.ai
- **Community:** https://discord.com/invite/clawd

---

*Last updated: 2026-03-27*
