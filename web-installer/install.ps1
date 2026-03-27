# OrionClaw One-Click Installer for Windows
# Based on OpenClaw - Uses the official OpenClaw installer
# Repository: https://github.com/Neguiolidas/OrionClaw

param(
    [string]$WorkspaceDir = "C:\OrionClaw",
    [string]$UserName = "Usuario",
    [string]$AgentName = "Assistant",
    [switch]$SkipOpenClawInstall
)

$ErrorActionPreference = "Stop"

# Colors
function Write-Step {
    param(
        [string]$Message,
        [string]$Status = "INFO"
    )
    $icon = switch ($Status) {
        "OK"    { "[OK]" }
        "WAIT"  { "[..]" }
        "WARN"  { "[!!]" }
        "ERROR" { "[XX]" }
        default { "[>>]" }
    }
    $color = switch ($Status) {
        "OK"    { "Green" }
        "WAIT"  { "Yellow" }
        "WARN"  { "Yellow" }
        "ERROR" { "Red" }
        default { "Cyan" }
    }
    Write-Host "  $icon " -ForegroundColor $color -NoNewline
    Write-Host $Message
}

# Banner
Clear-Host
Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Cyan
Write-Host "  |                                                              |" -ForegroundColor Cyan
Write-Host "  |     ORIONCLAW - One-Click AI Assistant Installer             |" -ForegroundColor Cyan
Write-Host "  |     Powered by OpenClaw - 100% Free Models Available         |" -ForegroundColor Cyan
Write-Host "  |                                                              |" -ForegroundColor Cyan
Write-Host "  ================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# STEP 1: Run Official OpenClaw Installer
# ============================================================
Write-Host "  === PASSO 1: Instalando OpenClaw ===" -ForegroundColor White
Write-Host ""

if (-not $SkipOpenClawInstall) {
    Write-Step "Baixando e executando instalador oficial do OpenClaw..." "WAIT"
    Write-Host ""
    
    try {
        # Use the official OpenClaw installer with -NoOnboard
        # This handles Node.js, Git, and OpenClaw installation properly
        $installScript = Invoke-RestMethod -Uri "https://openclaw.ai/install.ps1" -UseBasicParsing
        
        # Execute with -NoOnboard so we can configure workspace first
        $scriptBlock = [scriptblock]::Create($installScript)
        & $scriptBlock -NoOnboard
        
        Write-Host ""
        Write-Step "OpenClaw instalado com sucesso" "OK"
    }
    catch {
        Write-Step "Erro ao instalar OpenClaw: $_" "ERROR"
        Write-Host ""
        Write-Host "  Tente instalar manualmente:" -ForegroundColor Yellow
        Write-Host "  irm https://openclaw.ai/install.ps1 | iex" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "  Pressione Enter para sair"
        exit 1
    }
    
    # Refresh PATH after OpenClaw install
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}
else {
    Write-Step "Pulando instalacao do OpenClaw (--SkipOpenClawInstall)" "WARN"
}

# ============================================================
# STEP 2: Create Workspace
# ============================================================
Write-Host ""
Write-Host "  === PASSO 2: Criando Workspace ===" -ForegroundColor White
Write-Host ""

Write-Step "Criando diretorio $WorkspaceDir..." "WAIT"

try {
    # Create directories
    New-Item -ItemType Directory -Path $WorkspaceDir -Force | Out-Null
    New-Item -ItemType Directory -Path "$WorkspaceDir\memory" -Force | Out-Null
    
    # Create USER.md
    $userContent = @"
# USER.md - Sobre Voce

- **Nome:** $UserName
- **Como chamar:** Senhor
- **Timezone:** America/Sao_Paulo

## Preferencias
- Respostas diretas e objetivas
- Portugues brasileiro
"@
    [System.IO.File]::WriteAllText("$WorkspaceDir\USER.md", $userContent, [System.Text.UTF8Encoding]::new($false))
    
    # Create IDENTITY.md
    $identityContent = @"
# IDENTITY.md - Quem Eu Sou

- **Nome:** $AgentName
- **Criatura:** Assistente IA
- **Vibe:** Profissional, eficiente, prestativo

## Caracteristicas
- Objetivo e direto
- Busca ajudar sempre
- Aprende com cada interacao
"@
    [System.IO.File]::WriteAllText("$WorkspaceDir\IDENTITY.md", $identityContent, [System.Text.UTF8Encoding]::new($false))
    
    # Create AGENTS.md
    $agentsContent = @"
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
"@
    [System.IO.File]::WriteAllText("$WorkspaceDir\AGENTS.md", $agentsContent, [System.Text.UTF8Encoding]::new($false))
    
    Write-Step "Workspace criado em $WorkspaceDir" "OK"
}
catch {
    Write-Step "Erro ao criar workspace: $_" "ERROR"
}

# ============================================================
# STEP 3: Configure OpenClaw
# ============================================================
Write-Host ""
Write-Host "  === PASSO 3: Configurando OpenClaw ===" -ForegroundColor White
Write-Host ""

Write-Step "Criando configuracao..." "WAIT"

$configDir = Join-Path $env:USERPROFILE ".openclaw"
New-Item -ItemType Directory -Path $configDir -Force | Out-Null

# Convert workspace path to forward slashes for JSON
$workspaceJson = $WorkspaceDir -replace '\\', '/'

$configContent = @"
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
      "workspace": "$workspaceJson",
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
"@

[System.IO.File]::WriteAllText("$configDir\openclaw.json", $configContent, [System.Text.UTF8Encoding]::new($false))
Write-Step "Configuracao criada em $configDir\openclaw.json" "OK"

# ============================================================
# STEP 4: Create Desktop Shortcut
# ============================================================
Write-Host ""
Write-Host "  === PASSO 4: Criando Atalhos ===" -ForegroundColor White
Write-Host ""

try {
    # Create batch file for easy launching
    $batchContent = @"
@echo off
title OrionClaw AI Assistant
cd /d "$WorkspaceDir"
echo.
echo   OrionClaw AI Assistant
echo   =======================
echo.
echo   Iniciando gateway...
echo.
openclaw gateway run
pause
"@
    [System.IO.File]::WriteAllText("$WorkspaceDir\OrionClaw.bat", $batchContent, [System.Text.Encoding]::ASCII)
    
    # Create TUI launcher
    $tuiBatch = @"
@echo off
title OrionClaw TUI
cd /d "$WorkspaceDir"
openclaw tui
"@
    [System.IO.File]::WriteAllText("$WorkspaceDir\OrionClaw-TUI.bat", $tuiBatch, [System.Text.Encoding]::ASCII)
    
    # Create desktop shortcut
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktopPath "OrionClaw.lnk"
    
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "cmd.exe"
    $Shortcut.Arguments = "/c `"$WorkspaceDir\OrionClaw.bat`""
    $Shortcut.WorkingDirectory = $WorkspaceDir
    $Shortcut.Description = "OrionClaw AI Assistant"
    $Shortcut.Save()
    
    Write-Step "Atalho criado na Area de Trabalho" "OK"
}
catch {
    Write-Step "Erro ao criar atalhos: $_" "WARN"
}

# ============================================================
# DONE
# ============================================================
Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "  |                                                              |" -ForegroundColor Green
Write-Host "  |              INSTALACAO FINALIZADA!                          |" -ForegroundColor Green
Write-Host "  |                                                              |" -ForegroundColor Green
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Para usar o OrionClaw:" -ForegroundColor White
Write-Host ""
Write-Host "    1. Clique no atalho 'OrionClaw' na Area de Trabalho" -ForegroundColor Gray
Write-Host ""
Write-Host "    Ou no terminal:" -ForegroundColor Gray
Write-Host "    cd $WorkspaceDir" -ForegroundColor Cyan
Write-Host "    openclaw tui" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Comandos uteis:" -ForegroundColor White
Write-Host "    openclaw configure  - Configurar provedores de IA" -ForegroundColor Gray
Write-Host "    openclaw doctor     - Diagnosticar problemas" -ForegroundColor Gray
Write-Host "    openclaw onboard    - Assistente de configuracao" -ForegroundColor Gray
Write-Host "    openclaw status     - Ver status do gateway" -ForegroundColor Gray
Write-Host ""
Write-Host "  Proximo passo recomendado:" -ForegroundColor White
Write-Host "    openclaw onboard" -ForegroundColor Cyan
Write-Host "    (Configura provedores de IA, canais como Telegram, etc)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Documentacao: https://docs.openclaw.ai" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "  |              Bem-vindo ao OrionClaw!                         |" -ForegroundColor Green
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host ""

Read-Host "  Pressione Enter para sair"
