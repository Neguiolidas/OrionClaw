#Requires -RunAsAdministrator
# OrionClaw One-Click Installer - Windows
# Repository: https://github.com/Neguiolidas/OrionClaw
# Usage: irm https://orionclaw.pages.dev/install.ps1 | iex

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ASCII Art Banner
function Show-Banner {
    $banner = @"

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

"@
    Write-Host $banner -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message, [string]$Status = "INFO", [string]$Color = "White")
    $icon = switch ($Status) {
        "OK"      { "[OK]" }
        "WAIT"    { "[..]" }
        "WARN"    { "[!!]" }
        "ERROR"   { "[XX]" }
        default   { "[>>]" }
    }
    $iconColor = switch ($Status) {
        "OK"      { "Green" }
        "WAIT"    { "Yellow" }
        "WARN"    { "Yellow" }
        "ERROR"   { "Red" }
        default   { "Cyan" }
    }
    Write-Host "  $icon " -ForegroundColor $iconColor -NoNewline
    Write-Host $Message -ForegroundColor $Color
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "  ═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "    $Title" -ForegroundColor White
    Write-Host "  ═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host ""
}

# Check if running as Administrator
function Test-Administrator {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check WSL2
function Test-WSL {
    try {
        $wslStatus = wsl --status 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    } catch {}
    return $false
}

# Install WSL2
function Install-WSL {
    Write-Step "WSL2 nao encontrado. Instalando..." "WAIT"
    
    try {
        # Enable WSL feature
        dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart | Out-Null
        dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart | Out-Null
        
        # Set WSL2 as default
        wsl --set-default-version 2 2>$null
        
        # Install Ubuntu
        wsl --install -d Ubuntu --no-launch
        
        Write-Step "WSL2 instalado com sucesso!" "OK"
        Write-Host ""
        Write-Host "  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Yellow
        Write-Host "  !!  REINICIE O COMPUTADOR E EXECUTE ESTE SCRIPT NOVAMENTE !!" -ForegroundColor Yellow  
        Write-Host "  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "  Pressione Enter para sair"
        exit 0
    } catch {
        Write-Step "Erro ao instalar WSL2: $_" "ERROR"
        exit 1
    }
}

# Main Installation
function Start-Installation {
    Clear-Host
    Show-Banner

    # Check Admin
    if (-not (Test-Administrator)) {
        Write-Step "Execute como Administrador!" "ERROR"
        Write-Host "  Clique direito no PowerShell > Executar como Administrador" -ForegroundColor Gray
        Read-Host "  Pressione Enter para sair"
        exit 1
    }
    Write-Step "Executando como Administrador" "OK"

    Write-Section "PASSO 1: Verificando WSL2"
    
    if (-not (Test-WSL)) {
        Install-WSL
        return
    }
    Write-Step "WSL2 ja esta instalado" "OK"

    # Check if Ubuntu is installed
    $distros = wsl --list --quiet 2>$null
    if ($distros -notmatch "Ubuntu") {
        Write-Step "Ubuntu nao encontrado. Instalando..." "WAIT"
        wsl --install -d Ubuntu --no-launch
        Write-Step "Ubuntu instalado. Configurando..." "OK"
    } else {
        Write-Step "Ubuntu encontrado" "OK"
    }

    Write-Section "PASSO 2: Instalando no WSL"

    # Create installation script
    $bashScript = @'
#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}    Instalando dependencias no Ubuntu...${NC}"
echo ""

# Update and install dependencies
sudo apt update -qq 2>/dev/null
sudo apt install -y curl git build-essential python3 2>/dev/null

# Install Node.js 22 LTS
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}[..] Instalando Node.js 22 LTS...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - 2>/dev/null
    sudo apt install -y nodejs 2>/dev/null
fi
echo -e "${GREEN}[OK] Node.js $(node --version)${NC}"

# Install OpenClaw
if ! command -v openclaw &> /dev/null; then
    echo -e "${YELLOW}[..] Instalando OpenClaw...${NC}"
    sudo npm install -g openclaw 2>/dev/null
fi
echo -e "${GREEN}[OK] OpenClaw instalado${NC}"

# Create workspace
echo -e "${YELLOW}[..] Criando workspace...${NC}"
mkdir -p ~/OrionClaw/memory
cd ~/OrionClaw

# Run OpenClaw setup
openclaw setup --non-interactive 2>/dev/null || true

# Create default config files
cat > USER.md << 'USEREOF'
# USER.md - Sobre Voce

- **Nome:** Usuario
- **Como chamar:** Senhor
- **Timezone:** America/Sao_Paulo
USEREOF

cat > IDENTITY.md << 'IDENTITYEOF'
# IDENTITY.md - Quem Eu Sou

- **Nome:** Assistant
- **Criatura:** Assistente IA
- **Emoji:** 🤖
- **Vibe:** Profissional, eficiente, prestativo
IDENTITYEOF

cat > AGENTS.md << 'AGENTSEOF'
# AGENTS.md - Configuracao

## Memoria
- memory/YYYY-MM-DD.md - Memoria diaria
- MEMORY.md - Memoria de longo prazo

## Regras
- Seja util e direto
- Responda em portugues
AGENTSEOF

echo -e "${GREEN}[OK] Workspace configurado em ~/OrionClaw${NC}"

# Create OpenClaw config
mkdir -p ~/.openclaw
cat > ~/.openclaw/openclaw.json << 'CONFIGEOF'
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "openrouter/meta-llama/llama-4-scout:free"
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

echo -e "${GREEN}[OK] Configuracao criada${NC}"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    INSTALACAO CONCLUIDA!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Para usar o OrionClaw:"
echo ""
echo -e "  ${CYAN}1. Abra o WSL (digite 'wsl' no PowerShell)${NC}"
echo -e "  ${CYAN}2. Execute: cd ~/OrionClaw && openclaw tui${NC}"
echo ""
echo -e "  Para configurar provedores de IA:"
echo -e "  ${YELLOW}openclaw configure${NC}"
echo ""
echo -e "  Documentacao: ${CYAN}https://docs.openclaw.ai${NC}"
echo ""
'@

    # Save script to temp file
    $scriptPath = "$env:TEMP\orionclaw-install.sh"
    $bashScript | Out-File -FilePath $scriptPath -Encoding utf8 -Force
    
    # Convert line endings to Unix
    $content = [System.IO.File]::ReadAllText($scriptPath) -replace "`r`n", "`n"
    [System.IO.File]::WriteAllText($scriptPath, $content, [System.Text.Encoding]::UTF8)

    # Run in WSL
    Write-Step "Executando instalacao no Ubuntu..." "WAIT"
    try {
        $wslPath = wsl wslpath -a $scriptPath
        wsl bash -c "bash $wslPath"
        Write-Step "Instalacao no WSL concluida!" "OK"
    } catch {
        Write-Step "Erro durante instalacao: $_" "ERROR"
        exit 1
    }

    Write-Section "INSTALACAO FINALIZADA"
    
    Write-Host "  Para usar o OrionClaw:" -ForegroundColor White
    Write-Host ""
    Write-Host "    1. Abra o WSL: " -ForegroundColor Gray -NoNewline
    Write-Host "wsl" -ForegroundColor Cyan
    Write-Host "    2. Execute:    " -ForegroundColor Gray -NoNewline
    Write-Host "cd ~/OrionClaw && openclaw tui" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Para configurar provedores de IA:" -ForegroundColor Gray
    Write-Host "    openclaw configure" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Documentacao: https://docs.openclaw.ai" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  ╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "  ║              Bem-vindo ao OrionClaw!                       ║" -ForegroundColor Green
    Write-Host "  ╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Read-Host "  Pressione Enter para sair"
}

# Run installation
Start-Installation
