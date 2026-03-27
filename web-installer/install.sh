#!/bin/bash
# OrionClaw One-Click Installer - Unix (Linux/macOS)
# Repository: https://github.com/Neguiolidas/OrionClaw

set -e

INSTALL_DIR="$HOME/OrionClaw"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

step() {
    local status=$1
    local msg=$2
    case $status in
        "OK")    echo -e "  ${GREEN}[OK]${NC} $msg" ;;
        "WAIT")  echo -e "  ${YELLOW}[..]${NC} $msg" ;;
        "WARN")  echo -e "  ${YELLOW}[!!]${NC} $msg" ;;
        "ERROR") echo -e "  ${RED}[XX]${NC} $msg" ;;
        *)       echo -e "  ${CYAN}[>>]${NC} $msg" ;;
    esac
}

clear
echo ""
echo -e "${CYAN}  ================================================================${NC}"
echo -e "${CYAN}  |                                                              |${NC}"
echo -e "${CYAN}  |     ORIONCLAW - One-Click AI Assistant Installer             |${NC}"
echo -e "${CYAN}  |     Based on OpenClaw - 100% Free Models                     |${NC}"
echo -e "${CYAN}  |                                                              |${NC}"
echo -e "${CYAN}  ================================================================${NC}"
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ -f /etc/debian_version ]]; then
    OS="debian"
elif [[ -f /etc/fedora-release ]]; then
    OS="fedora"
elif [[ -f /etc/arch-release ]]; then
    OS="arch"
elif [[ -f /etc/alpine-release ]]; then
    OS="alpine"
else
    OS="linux"
fi

step "OK" "Sistema detectado: $OS"

# Step 1: Dependencies
echo ""
echo "  === PASSO 1: Instalando Dependencias ==="
echo ""

case $OS in
    "macos")
        if ! command -v brew &>/dev/null; then
            step "WAIT" "Instalando Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        step "WAIT" "Instalando Node.js e Git..."
        brew install node git 2>/dev/null || true
        ;;
    "debian")
        step "WAIT" "Atualizando pacotes..."
        sudo apt update -qq 2>/dev/null
        sudo apt install -y curl git build-essential 2>/dev/null
        
        if ! command -v node &>/dev/null; then
            step "WAIT" "Instalando Node.js 22 LTS..."
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - 2>/dev/null
            sudo apt install -y nodejs 2>/dev/null
        fi
        ;;
    "fedora")
        step "WAIT" "Instalando dependencias..."
        sudo dnf install -y nodejs npm git gcc-c++ make 2>/dev/null
        ;;
    "arch")
        step "WAIT" "Instalando dependencias..."
        sudo pacman -Sy --noconfirm nodejs npm git 2>/dev/null
        ;;
    "alpine")
        step "WAIT" "Instalando dependencias..."
        sudo apk add --no-cache nodejs npm git python3 build-base 2>/dev/null
        ;;
    *)
        step "WARN" "OS nao reconhecido. Tentando instalacao generica..."
        if command -v apt &>/dev/null; then
            sudo apt update && sudo apt install -y curl git build-essential nodejs npm
        fi
        ;;
esac

if command -v node &>/dev/null; then
    step "OK" "Node.js $(node --version)"
else
    step "ERROR" "Node.js nao encontrado. Instale manualmente: https://nodejs.org"
    exit 1
fi

if command -v npm &>/dev/null; then
    step "OK" "npm $(npm --version)"
fi

# Step 2: Install OpenClaw
echo ""
echo "  === PASSO 2: Instalando OrionClaw CLI ==="
echo ""

step "WAIT" "Instalando openclaw via npm..."
sudo npm install -g openclaw 2>/dev/null || npm install -g openclaw
step "OK" "OrionClaw CLI instalado"

# Step 3: Create Workspace
echo ""
echo "  === PASSO 3: Criando Workspace ==="
echo ""

step "WAIT" "Criando diretorio $INSTALL_DIR..."
mkdir -p $INSTALL_DIR/memory
cd $INSTALL_DIR

# Create USER.md
cat > USER.md << 'EOF'
# USER.md - Sobre Voce

- **Nome:** Usuario
- **Como chamar:** Senhor
- **Timezone:** America/Sao_Paulo

## Preferencias
- Respostas diretas e objetivas
- Portugues brasileiro
EOF

# Create IDENTITY.md
cat > IDENTITY.md << 'EOF'
# IDENTITY.md - Quem Eu Sou

- **Nome:** Assistant
- **Criatura:** Assistente IA
- **Vibe:** Profissional, eficiente, prestativo

## Caracteristicas
- Objetivo e direto
- Busca ajudar sempre
- Aprende com cada interacao
EOF

# Create AGENTS.md
cat > AGENTS.md << 'EOF'
# AGENTS.md - Configuracao do Agente

## Memoria
- memory/YYYY-MM-DD.md - Memoria diaria (eventos brutos)
- MEMORY.md - Memoria de longo prazo (fatos curados)

## Regras de Comportamento
- Seja util e direto
- Responda em portugues brasileiro
- Nao pergunte o que pode descobrir sozinho
- Acao > Palavras
EOF

step "OK" "Workspace criado em $INSTALL_DIR"

# Step 4: Create Config
echo ""
echo "  === PASSO 4: Configurando OrionClaw ==="
echo ""

step "WAIT" "Criando configuracao..."
mkdir -p ~/.openclaw

cat > ~/.openclaw/openclaw.json << 'EOF'
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "openrouter/meta-llama/llama-4-scout:free",
        "fallbacks": [
          "openrouter/qwen/qwen3-next-80b-a3b-instruct:free",
          "openrouter/z-ai/glm-4.5-air:free"
        ]
      },
      "workspace": "~/OrionClaw",
      "compaction": {
        "mode": "safeguard",
        "reserveTokensFloor": 30000
      }
    }
  },
  "providers": {},
  "channels": {},
  "gateway": {
    "port": 18789,
    "mode": "local"
  }
}
EOF

step "OK" "Configuracao criada em ~/.openclaw/openclaw.json"

# Done
echo ""
echo -e "${GREEN}  ================================================================${NC}"
echo -e "${GREEN}  |    INSTALACAO FINALIZADA!                                    |${NC}"
echo -e "${GREEN}  ================================================================${NC}"
echo ""
echo "  Para usar o OrionClaw:"
echo ""
echo -e "    ${CYAN}cd ~/OrionClaw && openclaw tui${NC}"
echo ""
echo "  Comandos uteis:"
echo "    openclaw configure  - Configurar provedores de IA"
echo "    openclaw doctor     - Diagnosticar problemas"
echo "    openclaw status     - Ver status do gateway"
echo ""
echo "  Documentacao: https://docs.openclaw.ai"
echo ""
echo -e "${GREEN}  ================================================================${NC}"
echo -e "${GREEN}  |              Bem-vindo ao OrionClaw!                         |${NC}"
echo -e "${GREEN}  ================================================================${NC}"
echo ""
