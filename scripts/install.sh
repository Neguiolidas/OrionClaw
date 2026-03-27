#!/bin/bash
# ╔═══════════════════════════════════════════════════════════════════╗
# ║                    OrionClaw One-Click Installer                  ║
# ║                      macOS / Linux Script                          ║
# ╚═══════════════════════════════════════════════════════════════════╝

set -e

INSTALL_DIR="${INSTALL_DIR:-$HOME/OrionClaw}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}🐺 OrionClaw One-Click Installer${NC}"
echo "  ═══════════════════════════════════════════════════════════"
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    echo -e "${YELLOW}📦 Detectado: macOS${NC}"
elif [[ -f /etc/debian_version ]]; then
    OS="debian"
    echo -e "${YELLOW}📦 Detectado: Debian/Ubuntu${NC}"
elif [[ -f /etc/fedora-release ]]; then
    OS="fedora"
    echo -e "${YELLOW}📦 Detectado: Fedora${NC}"
else
    OS="linux"
    echo -e "${YELLOW}📦 Detectado: Linux${NC}"
fi

# Dependencies
echo ""
echo -e "${YELLOW}📦 Instalando dependências...${NC}"

if [[ "$OS" == "macos" ]]; then
    if ! command -v brew &> /dev/null; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install node git python3
elif [[ "$OS" == "debian" ]]; then
    sudo apt update -qq
    sudo apt install -y curl git build-essential python3 python3-pip
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs
elif [[ "$OS" == "fedora" ]]; then
    sudo dnf install -y nodejs git python3 python3-pip gcc-c++ make
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} instalado${NC}"

# OpenClaw
echo ""
echo -e "${YELLOW}📦 Instalando OpenClaw CLI...${NC}"
npm install -g openclaw
echo -e "${GREEN}✅ OpenClaw instalado${NC}"

# Workspace
echo ""
echo -e "${YELLOW}📁 Configurando workspace...${NC}"
mkdir -p "$INSTALL_DIR/memory"
cd "$INSTALL_DIR"

openclaw setup --non-interactive 2>/dev/null || true

# Templates
cat > USER.md << 'EOF'
# USER.md

- **Nome:** User
- **Como chamar:** Senhor

## Preferências

- **Comunicação:** Direta e objetiva
- **Estilo:** Técnico e eficiente
EOF

cat > IDENTITY.md << 'EOF'
# IDENTITY.md

- **Nome:** Assistant
- **Criatura:** Assistente IA
- **Personalidade:** Neutro
- **Emoji:** 🐺
EOF

cat > AGENTS.md << 'EOF'
# AGENTS.md

## Memória

- `memory/YYYY-MM-DD.md` - Memória diária
- `MEMORY.md` - Memória de longo prazo

## Comportamento

- Seja útil, não verboso
- Ação > palavras
- Pergunte quando incerto
EOF

echo -e "${GREEN}✅ Workspace configurado${NC}"

# Start gateway
echo ""
echo -e "${YELLOW}🚀 Iniciando gateway...${NC}"
openclaw gateway start
echo -e "${GREEN}✅ Gateway iniciado${NC}"

# Complete
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ OrionClaw instalado com sucesso!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Comandos úteis:"
echo "  openclaw tui        - Interface de terminal"
echo "  openclaw status     - Ver status"
echo "  openclaw gateway    - Gerenciar gateway"
echo ""
echo -e "${CYAN}🐺 Bem-vindo ao OrionClaw!${NC}"
