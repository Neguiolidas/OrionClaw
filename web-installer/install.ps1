#Requires -RunAsAdministrator
# OrionClaw One-Click Installer - Windows Native
# Repository: https://github.com/Neguiolidas/OrionClaw

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Force UTF-8 output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Configuration
$INSTALL_DIR = "C:\OrionClaw"
$NODE_VERSION = "22.14.0"

function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  ================================================================" -ForegroundColor Cyan
    Write-Host "  |                                                              |" -ForegroundColor Cyan
    Write-Host "  |     ORIONCLAW - One-Click AI Assistant Installer             |" -ForegroundColor Cyan
    Write-Host "  |     Based on OpenClaw - 100% Free Models                     |" -ForegroundColor Cyan
    Write-Host "  |                                                              |" -ForegroundColor Cyan
    Write-Host "  ================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Message, [string]$Status = "INFO")
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

function Test-Command {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Check Admin
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "  [XX] Execute como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Clique direito no PowerShell > Executar como Administrador" -ForegroundColor Gray
    Write-Host ""
    Read-Host "  Pressione Enter para sair"
    exit 1
}

Show-Banner
Write-Step "Executando como Administrador" "OK"

# ============================================================
# STEP 1: Install Node.js
# ============================================================
Write-Host ""
Write-Host "  === PASSO 1: Verificando Node.js ===" -ForegroundColor White
Write-Host ""

$nodeInstalled = $false
$nodeVersion = $null

if (Test-Command "node") {
    $nodeVersion = (node --version 2>$null)
    if ($nodeVersion) {
        $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($majorVersion -ge 20) {
            Write-Step "Node.js $nodeVersion encontrado" "OK"
            $nodeInstalled = $true
        } else {
            Write-Step "Node.js $nodeVersion encontrado (versao antiga)" "WARN"
        }
    }
}

if (-not $nodeInstalled) {
    Write-Step "Instalando Node.js $NODE_VERSION..." "WAIT"
    
    $nodeUrl = "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-x64.msi"
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
        Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /qn /norestart" -Wait -NoNewWindow
        
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        
        # Verify installation
        Start-Sleep -Seconds 2
        if (Test-Command "node") {
            $nodeVersion = (node --version 2>$null)
            Write-Step "Node.js $nodeVersion instalado" "OK"
        } else {
            Write-Step "Node.js instalado (reinicie o terminal para usar)" "WARN"
        }
        
        Remove-Item $nodeInstaller -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Step "Erro ao instalar Node.js: $_" "ERROR"
        Write-Host ""
        Write-Host "  Instale manualmente: https://nodejs.org/en/download/" -ForegroundColor Gray
        Read-Host "  Pressione Enter para sair"
        exit 1
    }
}

# ============================================================
# STEP 2: Install Git
# ============================================================
Write-Host ""
Write-Host "  === PASSO 2: Verificando Git ===" -ForegroundColor White
Write-Host ""

if (Test-Command "git") {
    $gitVersion = (git --version 2>$null)
    Write-Step "$gitVersion encontrado" "OK"
} else {
    Write-Step "Instalando Git..." "WAIT"
    
    $gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe"
    $gitInstaller = "$env:TEMP\git-installer.exe"
    
    try {
        Invoke-WebRequest -Uri $gitUrl -OutFile $gitInstaller -UseBasicParsing
        Start-Process $gitInstaller -ArgumentList "/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /COMPONENTS=`"icons,ext\reg\shellhere,assoc,assoc_sh`"" -Wait -NoNewWindow
        
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        
        Write-Step "Git instalado" "OK"
        Remove-Item $gitInstaller -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Step "Erro ao instalar Git: $_" "ERROR"
        Write-Host "  Instale manualmente: https://git-scm.com/download/win" -ForegroundColor Gray
    }
}

# ============================================================
# STEP 3: Install OpenClaw (OrionClaw CLI)
# ============================================================
Write-Host ""
Write-Host "  === PASSO 3: Instalando OrionClaw CLI ===" -ForegroundColor White
Write-Host ""

Write-Step "Instalando via npm..." "WAIT"

try {
    # Install openclaw globally
    $npmOutput = npm install -g openclaw 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Step "OrionClaw CLI instalado" "OK"
    } else {
        throw "npm install failed"
    }
} catch {
    Write-Step "Erro ao instalar: $_" "ERROR"
    Write-Host ""
    Write-Host "  Tente manualmente: npm install -g openclaw" -ForegroundColor Gray
    Read-Host "  Pressione Enter para continuar mesmo assim"
}

# ============================================================
# STEP 4: Create Workspace
# ============================================================
Write-Host ""
Write-Host "  === PASSO 4: Criando Workspace ===" -ForegroundColor White
Write-Host ""

Write-Step "Criando diretorio $INSTALL_DIR..." "WAIT"

try {
    # Create directories
    New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
    New-Item -ItemType Directory -Path "$INSTALL_DIR\memory" -Force | Out-Null
    
    # Create USER.md
    $userMd = @"
# USER.md - Sobre Voce

- **Nome:** Usuario
- **Como chamar:** Senhor
- **Timezone:** America/Sao_Paulo

## Preferencias
- Respostas diretas e objetivas
- Portugues brasileiro
"@
    Set-Content -Path "$INSTALL_DIR\USER.md" -Value $userMd -Encoding UTF8
    
    # Create IDENTITY.md
    $identityMd = @"
# IDENTITY.md - Quem Eu Sou

- **Nome:** Assistant
- **Criatura:** Assistente IA
- **Emoji:** (robot)
- **Vibe:** Profissional, eficiente, prestativo

## Caracteristicas
- Objetivo e direto
- Busca ajudar sempre
- Aprende com cada interacao
"@
    Set-Content -Path "$INSTALL_DIR\IDENTITY.md" -Value $identityMd -Encoding UTF8
    
    # Create AGENTS.md
    $agentsMd = @"
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
    Set-Content -Path "$INSTALL_DIR\AGENTS.md" -Value $agentsMd -Encoding UTF8
    
    Write-Step "Workspace criado em $INSTALL_DIR" "OK"
} catch {
    Write-Step "Erro ao criar workspace: $_" "ERROR"
}

# ============================================================
# STEP 5: Create OpenClaw Config
# ============================================================
Write-Host ""
Write-Host "  === PASSO 5: Configurando OrionClaw ===" -ForegroundColor White
Write-Host ""

Write-Step "Criando configuracao..." "WAIT"

$configDir = "$env:USERPROFILE\.openclaw"
New-Item -ItemType Directory -Path $configDir -Force | Out-Null

$configJson = @"
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
      "workspace": "$($INSTALL_DIR -replace '\\', '/')",
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

Set-Content -Path "$configDir\openclaw.json" -Value $configJson -Encoding UTF8
Write-Step "Configuracao criada" "OK"

# ============================================================
# STEP 6: Create Shortcuts
# ============================================================
Write-Host ""
Write-Host "  === PASSO 6: Criando Atalhos ===" -ForegroundColor White
Write-Host ""

try {
    # Create batch file for easy launching
    $batchContent = @"
@echo off
cd /d "$INSTALL_DIR"
openclaw tui
pause
"@
    Set-Content -Path "$INSTALL_DIR\OrionClaw.bat" -Value $batchContent -Encoding ASCII
    
    # Create desktop shortcut
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = "$desktopPath\OrionClaw.lnk"
    
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "cmd.exe"
    $Shortcut.Arguments = "/c `"$INSTALL_DIR\OrionClaw.bat`""
    $Shortcut.WorkingDirectory = $INSTALL_DIR
    $Shortcut.Description = "OrionClaw AI Assistant"
    $Shortcut.Save()
    
    Write-Step "Atalho criado na Area de Trabalho" "OK"
} catch {
    Write-Step "Erro ao criar atalhos: $_" "WARN"
}

# ============================================================
# DONE
# ============================================================
Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "  |    INSTALACAO FINALIZADA!                                    |" -ForegroundColor Green
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Para usar o OrionClaw:" -ForegroundColor White
Write-Host ""
Write-Host "    1. Clique no atalho 'OrionClaw' na Area de Trabalho" -ForegroundColor Gray
Write-Host ""
Write-Host "    Ou no terminal:" -ForegroundColor Gray
Write-Host "    cd $INSTALL_DIR" -ForegroundColor Cyan
Write-Host "    openclaw tui" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Comandos uteis:" -ForegroundColor White
Write-Host "    openclaw configure  - Configurar provedores de IA" -ForegroundColor Gray
Write-Host "    openclaw doctor     - Diagnosticar problemas" -ForegroundColor Gray
Write-Host "    openclaw status     - Ver status do gateway" -ForegroundColor Gray
Write-Host ""
Write-Host "  Documentacao: https://docs.openclaw.ai" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "  |              Bem-vindo ao OrionClaw!                         |" -ForegroundColor Green
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host ""

Read-Host "  Pressione Enter para sair"
