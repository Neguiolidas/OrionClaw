# 🐺 OrionClaw

**One-click AI assistant installer based on OpenClaw**

OrionClaw is an optimized fork of [OpenClaw](https://github.com/openclaw/openclaw) focused on multi-agent orchestration with free AI providers.

## ✨ Features

- **🤖 Multi-Agent Support** - Configure as many agents as you want, each with unique personality
- **💸 100% Free Models** - GLM-5 (until Apr 30), Llama 4, Gemini Flash, Qwen3
- **🦙 Ollama Local** - Run models locally with zero API costs
- **📱 Multi-Channel** - Telegram, Discord, WhatsApp, CLI
- **🧠 Persistent Memory** - Layered memory system for context
- **🎯 2,346+ Skills** - Antigravity Awesome Skills integrated

## 🚀 Quick Install

### Windows (PowerShell as Admin)
```powershell
irm https://neguitech.app/orionclaw/install.ps1 | iex
```

### macOS / Linux
```bash
curl -fsSL https://neguitech.app/orionclaw/install.sh | bash
```

### Or use the web installer
Visit [neguitech.app/orionclaw](https://neguitech.app/orionclaw) for a guided installation.

## 📦 Free AI Providers

| Provider | Models | Status |
|----------|--------|--------|
| **Modal GLM-5** | GLM-5 with reasoning | ⏰ Free until Apr 30, 2026 |
| **OpenRouter** | Llama 4, Qwen3, Mistral | ✅ Always free tier |
| **Google AI** | Gemini 2.5 Flash, Gemma 3 | ✅ Free tier |
| **Ollama** | Local models | ✅ 100% free forever |
| **OpenCode** | GLM-4.7, Kimi K2.5 | ✅ Free tier |
| **Kilo Gateway** | Auto-routing | ✅ Free tier |

## 🤖 Agent Configuration

Each agent is fully customizable:
- **Name** - Give your assistant any name
- **Personality** - Neutral, friendly, formal, witty, or custom
- **Multiple agents** - Run 1 to 15+ agents in parallel

⚠️ **Note:** More agents = more token consumption. Start with 1-3 agents if using paid providers.

## 📁 Directory Structure

```
~/OrionClaw/
├── workspace/          # Your working directory
│   ├── AGENTS.md       # Agent behavior configuration
│   ├── SOUL.md         # Agent personality
│   ├── USER.md         # Your preferences
│   ├── IDENTITY.md     # Agent identity
│   └── memory/         # Conversation memory
├── skills/             # Custom skills
├── scripts/            # Automation scripts
└── docs/               # Documentation
```

## 🔧 Configuration

After installation, configure at `~/.openclaw/openclaw.json`:

```json
{
  "providers": {
    "openrouter": { "apiKey": "sk-or-v1-..." },
    "google": { "apiKey": "AIza..." }
  },
  "channels": {
    "telegram": { "token": "123:ABC..." }
  }
}
```

## 📚 Documentation

- [OpenClaw Docs](https://docs.openclaw.ai)
- [Skill Creation Guide](./docs/SKILLS.md)
- [Multi-Agent Setup](./docs/MULTI-AGENT.md)

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch
3. Submit a pull request

## 📄 License

MIT License - Based on [OpenClaw](https://github.com/openclaw/openclaw)

---

Made with 🍷 by [Neguitech](https://neguitech.app)
