#Requires -RunAsAdministrator
# ╔═══════════════════════════════════════════════════════════════════╗
# ║                    OrionClaw One-Click Installer                  ║
# ║                     Windows PowerShell Script                      ║
# ╚═══════════════════════════════════════════════════════════════════╝

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Clear-Host
Write-Host ""
Write-Host "  🐺 OrionClaw One-Click Installer" -ForegroundColor Cyan
Write-Host "  ═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""

# Check admin
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "  ❌ Execute este script como Administrador!" -ForegroundColor Red
    exit 1
}

# WSL2
Write-Host "  📦 Verificando WSL2..." -ForegroundColor Yellow

$wslStatus = wsl --status 2>$null
if (-not $?) {
    Write-Host "  Instalando WSL2 com Ubuntu..." -ForegroundColor Gray
    wsl --install -d Ubuntu --no-launch
    Write-Host ""
    Write-Host "  ⚠️  WSL2 foi instalado!" -ForegroundColor Yellow
    Write-Host "  Reinicie o computador e execute este script novamente." -ForegroundColor Yellow
    Read-Host "Pressione Enter para reiniciar"
    Restart-Computer -Force
    exit 0
}

Write-Host "  ✅ WSL2 instalado" -ForegroundColor Green

# Install in WSL
Write-Host ""
Write-Host "  📦 Instalando OrionClaw no WSL..." -ForegroundColor Yellow

$wslScript = @'
#!/bin/bash
set -e

echo ""
echo "  🐺 Instalando OrionClaw..."
echo ""

# Dependencies
sudo apt update -qq
sudo apt install -y curl git build-essential python3 python3-pip

# Node.js 22
echo "📦 Instalando Node.js 22 LTS..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION instalado"

# OpenClaw
echo "📦 Instalando OpenClaw CLI..."
npm install -g openclaw
echo "✅ OpenClaw instalado"

# Workspace
echo "📁 Configurando workspace..."
mkdir -p ~/OrionClaw/memory
cd ~/OrionClaw

openclaw setup --non-interactive 2>/dev/null || true

cat > USER.md << 'EOF'
# USER.md
- **Nome:** User
- **Como chamar:** Senhor
EOF

cat > IDENTITY.md << 'EOF'
# IDENTITY.md
- **Nome:** Assistant
- **Criatura:** Assistente IA
EOF

cat > AGENTS.md << 'EOF'
# AGENTS.md
## Memória
- `memory/YYYY-MM-DD.md` - Memória diária
EOF

echo "✅ Workspace configurado"

# Start gateway
echo "🚀 Iniciando gateway..."
openclaw gateway start
echo "✅ Gateway iniciado"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ OrionClaw instalado com sucesso!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Comandos úteis:"
echo "  openclaw tui        - Interface de terminal"
echo "  openclaw status     - Ver status"
echo ""
echo "🐺 Bem-vindo ao OrionClaw!"
'@

# Run in WSL
$wslScriptPath = "$env:TEMP\install-orionclaw.sh"
$wslScript | Out-File -FilePath $wslScriptPath -Encoding utf8 -Force
$content = [System.IO.File]::ReadAllText($wslScriptPath)
$content = $content -replace "`r`n", "`n"
[System.IO.File]::WriteAllText($wslScriptPath, $content)

wsl bash -c "bash $(wsl wslpath -a $wslScriptPath)"

Write-Host ""
Write-Host "  ═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "  ✅ Instalação concluída!" -ForegroundColor Green
Write-Host "  ═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Para usar o OrionClaw:" -ForegroundColor White
Write-Host "  1. Abra o Terminal do Windows" -ForegroundColor Gray
Write-Host "  2. Digite: wsl" -ForegroundColor Gray
Write-Host "  3. Execute: openclaw tui" -ForegroundColor Gray
Write-Host ""
Write-Host "  🐺 Bem-vindo ao OrionClaw!" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter para sair"
