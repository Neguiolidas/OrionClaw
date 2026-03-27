#!/bin/bash
# OrionClaw One-Click Installer - Unix (Linux/macOS)
# Repository: https://github.com/Neguiolidas/OrionClaw
# Usage: curl -fsSL https://orionclaw.pages.dev/install.sh | bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ASCII Art Banner
show_banner() {
    echo ""
    echo -e "${CYAN}"
    cat << 'EOF'
    ╔═══════════════════════════════════════════════════════════════════╗
    ║                                                                   ║
    ║     ██████╗ ██████╗ ██╗ ██████╗ ███╗   ██╗ ██████╗██╗      █████╗ ║
    ║    ██╔═══██╗██╔══██╗██║██╔═══██╗████╗  ██║██╔════╝██║     ██╔══██╗║
    ║    ██║   ██║██████╔╝██║██║   ██║██╔██╗ ██║██║     ██║     ███████║║
    ║    ██║   ██║██╔══██╗██║██║   ██║██║╚██╗██║██║     ██║     ██╔══██║║
    ║    ╚██████╔╝██║  ██║██║╚██████╔╝██║ ╚████║╚██████╗███████╗██║  ██║║
    ║     ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚══════╝╚═╝  ╚═╝║
    ║                                                                   ║
    ║           One-Click AI Assistant Installer                        ║
    ║           Based on OpenClaw - 100% Free Models                    ║
    ║                                                                   ║
    ╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

step() {
    local status=$1
    local message=$2
    local icon=""
    local color=""
    
    case $status in
        "OK")    icon="[OK]"; color=$GREEN ;;
        "WAIT")  icon="[..]"; color=$YELLOW ;;
        "WARN")  icon="[!!]"; color=$YELLOW ;;
        "ERROR") icon="[XX]"; color=$RED ;;
        *)       icon="[>>]"; color=$CYAN ;;
    esac
    
    echo -e "  ${color}${icon}${NC} ${message}"
}

section() {
    echo ""
    echo -e "  ${DIM}═══════════════════════════════════════════════════════════${NC}"
    echo -e "    ${BOLD}$1${NC}"
    echo -e "  ${DIM}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ -f /etc/debian_version ]]; then
        echo "debian"
    elif [[ -f /etc/fedora-release ]]; then
        echo "fedora"
    elif [[ -f /etc/arch-release ]]; then
        echo "arch"
    elif [[ -f /etc/alpine-release ]]; then
        echo "alpine"
    else
        echo "linux"
    fi
}

# Install dependencies based on OS
install_dependencies() {
    local os=$1
    
    step "WAIT" "Instalando dependencias..."
    
    case $os in
        "macos")
            if ! command -v brew &> /dev/null; then
                step "WAIT" "Instalando Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install node git python3 2>/dev/null || true
            ;;
        "debian")
            sudo apt update -qq 2>/dev/null
            sudo apt install -y curl git build-essential python3 2>/dev/null
            
            if ! command -v node &> /dev/null || [[ $(node --version | cut -d'.' -f1 | tr -d 'v') -lt 20 ]]; then
                step "WAIT" "Instalando Node.js 22 LTS..."
                curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - 2>/dev/null
                sudo apt install -y nodejs 2>/dev/null
            fi
            ;;
        "fedora")
            sudo dnf install -y nodejs git python3 gcc-c++ make 2>/dev/null
            ;;
        "arch")
            sudo pacman -Sy --noconfirm nodejs npm git python 2>/dev/null
            ;;
        "alpine")
            sudo apk add --no-cache nodejs npm git python3 build-base 2>/dev/null
            ;;
        *)
            step "WARN" "OS nao reconhecido. Tentando instalacao generica..."
            if command -v apt &> /dev/null; then
                sudo apt update && sudo apt install -y curl git build-essential nodejs npm python3
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y nodejs npm git python3
            elif command -v pacman &> /dev/null; then
                sudo pacman -Sy --noconfirm nodejs npm git python
            else
                step "ERROR" "Gerenciador de pacotes nao encontrado. Instale Node.js 20+ manualmente."
                exit 1
            fi
            ;;
    esac
    
    step "OK" "Dependencias instaladas"
}

# Install OpenClaw
install_openclaw() {
    if ! command -v openclaw &> /dev/null; then
        step "WAIT" "Instalando OpenClaw..."
        sudo npm install -g openclaw 2>/dev/null
    fi
    step "OK" "OpenClaw $(openclaw --version 2>/dev/null || echo 'instalado')"
}

# Setup workspace
setup_workspace() {
    step "WAIT" "Configurando workspace..."
    
    mkdir -p ~/OrionClaw/memory
    cd ~/OrionClaw
    
    # Run OpenClaw setup
    openclaw setup --non-interactive 2>/dev/null || true
    
    # Create USER.md
    cat > USER.md << 'USEREOF'
# USER.md - Sobre Voce

- **Nome:** Usuario
- **Como chamar:** Senhor
- **Timezone:** America/Sao_Paulo

## Preferencias
- Respostas diretas e objetivas
- Portugues brasileiro
USEREOF

    # Create IDENTITY.md
    cat > IDENTITY.md << 'IDENTITYEOF'
# IDENTITY.md - Quem Eu Sou

- **Nome:** Assistant
- **Criatura:** Assistente IA
- **Emoji:** 🤖
- **Vibe:** Profissional, eficiente, prestativo

## Caracteristicas
- Objetivo e direto
- Busca ajudar sempre
- Aprende com cada interacao
IDENTITYEOF

    # Create AGENTS.md
    cat > AGENTS.md << 'AGENTSEOF'
# AGENTS.md - Configuracao do Agente

## Memoria
- memory/YYYY-MM-DD.md - Memoria diaria (eventos brutos)
- MEMORY.md - Memoria de longo prazo (fatos curados)

## Regras de Comportamento
- Seja util e direto
- Responda em portugues brasileiro
- Nao pergunte o que pode descobrir sozinho
- Acao > Palavras

## Heartbeat
Verifique periodicamente se ha algo importante.
AGENTSEOF

    step "OK" "Workspace criado em ~/OrionClaw"
}

# Create OpenClaw config
create_config() {
    step "WAIT" "Criando configuracao..."
    
    mkdir -p ~/.openclaw
    
    cat > ~/.openclaw/openclaw.json << 'CONFIGEOF'
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
  "channels": {},
  "gateway": {
    "port": 18789,
    "mode": "local"
  }
}
CONFIGEOF

    step "OK" "Configuracao criada em ~/.openclaw/openclaw.json"
}

# Show final message
show_success() {
    echo ""
    echo -e "  ${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "  ${GREEN}${BOLD}    INSTALACAO CONCLUIDA!${NC}"
    echo -e "  ${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  Para usar o OrionClaw:"
    echo ""
    echo -e "    ${CYAN}cd ~/OrionClaw && openclaw tui${NC}"
    echo ""
    echo -e "  Para configurar provedores de IA:"
    echo -e "    ${YELLOW}openclaw configure${NC}"
    echo ""
    echo -e "  Comandos uteis:"
    echo -e "    ${DIM}openclaw status${NC}     - Ver status do gateway"
    echo -e "    ${DIM}openclaw doctor${NC}     - Diagnosticar problemas"
    echo -e "    ${DIM}openclaw gateway start${NC} - Iniciar gateway"
    echo ""
    echo -e "  Documentacao: ${CYAN}https://docs.openclaw.ai${NC}"
    echo ""
    echo -e "  ${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "  ${GREEN}║              Bem-vindo ao OrionClaw!                       ║${NC}"
    echo -e "  ${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Main installation
main() {
    clear
    show_banner
    
    section "PASSO 1: Detectando Sistema"
    OS=$(detect_os)
    step "OK" "Sistema: $OS"
    
    section "PASSO 2: Instalando Dependencias"
    install_dependencies $OS
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'.' -f1 | tr -d 'v')
        if [[ $NODE_VERSION -lt 20 ]]; then
            step "WARN" "Node.js $NODE_VERSION detectado. Recomendado: 20+"
        else
            step "OK" "Node.js $(node --version)"
        fi
    fi
    
    section "PASSO 3: Instalando OpenClaw"
    install_openclaw
    
    section "PASSO 4: Configurando Workspace"
    setup_workspace
    create_config
    
    show_success
}

# Run
main "$@"
