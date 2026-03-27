// OrionClaw Installer - Frontend Logic
// Version: 2.0.0 - Complete rewrite with proper encoding

let currentStep = 1;
const totalSteps = 5;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateOSDefaults();
  setupOSListener();
  setupAgentSlider();
  setupPersonalityListener();
  setupProviderListeners();
});

// Scroll to install section
function scrollToInstall() {
  document.getElementById('install').scrollIntoView({ behavior: 'smooth' });
}

// OS-specific defaults
function updateOSDefaults() {
  const os = document.querySelector('input[name="os"]:checked').value;
  const installDirInput = document.getElementById('install-dir');
  
  const defaults = {
    windows: 'C:\\OrionClaw',
    macos: '~/OrionClaw',
    linux: '~/OrionClaw'
  };
  
  installDirInput.value = defaults[os];
  installDirInput.placeholder = defaults[os];
}

function setupOSListener() {
  document.querySelectorAll('input[name="os"]').forEach(radio => {
    radio.addEventListener('change', updateOSDefaults);
  });
}

// Agent slider
function setupAgentSlider() {
  const slider = document.getElementById('agent-count');
  const display = document.getElementById('agent-count-display');
  
  slider.addEventListener('input', () => {
    display.textContent = slider.value;
    updateCostEstimate();
  });
}

function setupProviderListeners() {
  document.querySelectorAll('input[name="providers"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateCostEstimate);
  });
}

function setAgentCount(count) {
  const slider = document.getElementById('agent-count');
  const display = document.getElementById('agent-count-display');
  slider.value = count;
  display.textContent = count;
  updateCostEstimate();
}

function updateCostEstimate() {
  const agentCount = parseInt(document.getElementById('agent-count').value);
  const providers = Array.from(document.querySelectorAll('input[name="providers"]:checked')).map(el => el.value);
  const costDiv = document.getElementById('cost-estimate');
  
  const hasFreeProviders = providers.some(p => ['modal', 'openrouter', 'ollama', 'google', 'opencode', 'kilo'].includes(p));
  const hasPaidProviders = providers.some(p => ['anthropic', 'openai'].includes(p));
  
  let html = '';
  
  if (hasFreeProviders && !hasPaidProviders) {
    html = '<p class="cost-free">OK Com provedores gratuitos selecionados: <strong>$0/mes</strong></p>';
  } else if (hasPaidProviders) {
    const estimatedCost = agentCount * 5;
    if (agentCount <= 3) {
      html = '<p class="cost-low">Estimativa com ' + agentCount + ' agente(s): <strong>~$' + estimatedCost + '-' + (estimatedCost * 2) + '/mes</strong></p>';
    } else {
      html = '<p class="cost-high">Atencao! Estimativa com ' + agentCount + ' agente(s): <strong>~$' + estimatedCost + '-' + (estimatedCost * 3) + '/mes</strong></p>';
    }
  } else {
    html = '<p class="cost-low">Selecione provedores para ver estimativa</p>';
  }
  
  costDiv.innerHTML = html;
}

// Personality dropdown
function setupPersonalityListener() {
  const select = document.getElementById('agent-personality');
  const customGroup = document.getElementById('custom-personality-group');
  
  select.addEventListener('change', () => {
    customGroup.style.display = select.value === 'custom' ? 'block' : 'none';
  });
}

// Navigation
function nextStep() {
  if (currentStep < totalSteps) {
    if (!validateStep(currentStep)) return;
    
    document.querySelector('.step[data-step="' + currentStep + '"]').classList.add('completed');
    document.querySelector('.step[data-step="' + currentStep + '"]').classList.remove('active');
    
    currentStep++;
    
    document.querySelector('.step[data-step="' + currentStep + '"]').classList.add('active');
    
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.querySelector('.form-step[data-step="' + currentStep + '"]').classList.add('active');
    
    updateNavigationButtons();
    
    if (currentStep === totalSteps) {
      generateSummary();
      generateInstallCommand();
    }
  }
}

function prevStep() {
  if (currentStep > 1) {
    document.querySelector('.step[data-step="' + currentStep + '"]').classList.remove('active');
    
    currentStep--;
    
    document.querySelector('.step[data-step="' + currentStep + '"]').classList.remove('completed');
    document.querySelector('.step[data-step="' + currentStep + '"]').classList.add('active');
    
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.querySelector('.form-step[data-step="' + currentStep + '"]').classList.add('active');
    
    updateNavigationButtons();
  }
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
  
  if (currentStep === totalSteps) {
    nextBtn.style.display = 'none';
  } else {
    nextBtn.style.display = 'block';
    nextBtn.textContent = currentStep === totalSteps - 1 ? 'Finalizar' : 'Proximo';
  }
}

function validateStep(step) {
  if (step === 4) {
    const userName = document.getElementById('user-name').value.trim();
    if (!userName) {
      alert('Por favor, insira seu nome.');
      document.getElementById('user-name').focus();
      return false;
    }
  }
  return true;
}

// Get configuration
function getConfig() {
  const form = document.getElementById('installer-form');
  
  function getVal(name) {
    const el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }
  
  return {
    os: document.querySelector('input[name="os"]:checked').value,
    installDir: document.getElementById('install-dir').value,
    autoStart: document.getElementById('auto-start').checked,
    providers: Array.from(document.querySelectorAll('input[name="providers"]:checked')).map(el => el.value),
    channels: Array.from(document.querySelectorAll('input[name="channels"]:checked')).map(el => el.value),
    userName: document.getElementById('user-name').value,
    agentCount: parseInt(document.getElementById('agent-count').value),
    agentName: document.getElementById('agent-name').value || 'Assistant',
    agentPersonality: document.getElementById('agent-personality').value,
    customPersonality: document.getElementById('custom-personality') ? document.getElementById('custom-personality').value : '',
    keys: {
      modal: getVal('modal-key'),
      openrouter: getVal('openrouter-key'),
      google: getVal('google-key'),
      opencode: getVal('opencode-key'),
      kilo: getVal('kilo-key'),
      anthropic: getVal('anthropic-key'),
      openai: getVal('openai-key'),
      telegram: getVal('telegram-token'),
      discord: getVal('discord-token')
    }
  };
}

// Generate summary
function generateSummary() {
  const config = getConfig();
  const summaryDiv = document.getElementById('config-summary');
  
  const osNames = { windows: 'Windows', macos: 'macOS', linux: 'Linux' };
  const providerNames = {
    modal: 'Modal GLM-5',
    openrouter: 'OpenRouter',
    ollama: 'Ollama (Local)',
    google: 'Google AI',
    opencode: 'OpenCode',
    kilo: 'Kilo Gateway',
    anthropic: 'Anthropic',
    openai: 'OpenAI'
  };
  const channelNames = {
    telegram: 'Telegram',
    discord: 'Discord',
    whatsapp: 'WhatsApp'
  };
  
  let html = '<div class="summary-grid">';
  html += '<div class="summary-item"><span class="summary-label">Sistema:</span><span class="summary-value">' + osNames[config.os] + '</span></div>';
  html += '<div class="summary-item"><span class="summary-label">Agentes:</span><span class="summary-value">' + config.agentCount + '</span></div>';
  html += '<div class="summary-item"><span class="summary-label">Nome:</span><span class="summary-value">' + config.agentName + '</span></div>';
  html += '<div class="summary-item"><span class="summary-label">Provedores:</span><span class="summary-value">' + config.providers.map(p => providerNames[p]).join(', ') + '</span></div>';
  if (config.channels.length > 0) {
    html += '<div class="summary-item"><span class="summary-label">Canais:</span><span class="summary-value">' + config.channels.map(c => channelNames[c]).join(', ') + '</span></div>';
  }
  html += '</div>';
  
  summaryDiv.innerHTML = html;
}

// Generate install command
function generateInstallCommand() {
  const config = getConfig();
  const commandEl = document.getElementById('install-command');
  
  // Determine base URL - use Cloudflare Pages URL
  const baseUrl = 'https://orionclaw.pages.dev';
  
  if (config.os === 'windows') {
    commandEl.textContent = 'irm ' + baseUrl + '/install.ps1 | iex';
  } else {
    commandEl.textContent = 'curl -fsSL ' + baseUrl + '/install.sh | bash';
  }
}

// Copy command
function copyCommand() {
  const command = document.getElementById('install-command').textContent;
  navigator.clipboard.writeText(command).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.innerHTML = '<span>OK!</span>';
    setTimeout(() => {
      btn.innerHTML = '<span>Copiar</span>';
    }, 2000);
  });
}

// Download script
function downloadScript() {
  const config = getConfig();
  let script, filename, mimeType;
  
  if (config.os === 'windows') {
    script = generateWindowsScript(config);
    filename = 'install-orionclaw.ps1';
    mimeType = 'application/x-powershell; charset=utf-8';
  } else {
    script = generateUnixScript(config);
    filename = 'install-orionclaw.sh';
    mimeType = 'application/x-sh; charset=utf-8';
  }
  
  // Create blob with UTF-8 BOM for Windows compatibility
  const BOM = config.os === 'windows' ? '\ufeff' : '';
  const blob = new Blob([BOM + script], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate Windows PowerShell script
function generateWindowsScript(config) {
  const providers = config.providers;
  const channels = config.channels;
  const hasModal = providers.includes('modal');
  const hasOllama = providers.includes('ollama');
  
  // Build provider config JSON
  let providerConfig = [];
  if (config.keys.modal) providerConfig.push('"modal": { "apiKey": "' + config.keys.modal + '" }');
  if (config.keys.openrouter) providerConfig.push('"openrouter": { "apiKey": "' + config.keys.openrouter + '" }');
  if (config.keys.google) providerConfig.push('"google": { "apiKey": "' + config.keys.google + '" }');
  if (config.keys.opencode) providerConfig.push('"opencode": { "apiKey": "' + config.keys.opencode + '" }');
  if (config.keys.kilo) providerConfig.push('"kilocode": { "apiKey": "' + config.keys.kilo + '" }');
  if (config.keys.anthropic) providerConfig.push('"anthropic": { "apiKey": "' + config.keys.anthropic + '" }');
  if (config.keys.openai) providerConfig.push('"openai": { "apiKey": "' + config.keys.openai + '" }');
  if (hasOllama) providerConfig.push('"ollama": { "baseUrl": "http://127.0.0.1:11434" }');
  const providerJson = providerConfig.join(',\n    ');
  
  // Build channel config JSON
  let channelConfig = [];
  if (config.keys.telegram) channelConfig.push('"telegram": { "token": "' + config.keys.telegram + '" }');
  if (config.keys.discord) channelConfig.push('"discord": { "token": "' + config.keys.discord + '" }');
  const channelJson = channelConfig.join(',\n    ');
  
  // Default model
  let defaultModel = 'openrouter/meta-llama/llama-4-scout:free';
  if (hasModal) defaultModel = 'modal/zai-org/GLM-5-FP8';
  else if (config.keys.google) defaultModel = 'google/gemini-2.5-flash';
  
  // Script without emojis to avoid encoding issues
  const script = `#Requires -RunAsAdministrator
# OrionClaw One-Click Installer - Windows
# Generated by https://orionclaw.pages.dev
# Repository: https://github.com/Neguiolidas/OrionClaw

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Configuration
$USER_NAME = "${config.userName}"
$AGENT_NAME = "${config.agentName}"
$AGENT_PERSONALITY = "${config.agentPersonality}"
$AUTO_START = $${config.autoStart}

function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "    ================================================================" -ForegroundColor Cyan
    Write-Host "    |                                                              |" -ForegroundColor Cyan
    Write-Host "    |     ORIONCLAW - One-Click AI Assistant Installer             |" -ForegroundColor Cyan
    Write-Host "    |     Based on OpenClaw - 100% Free Models                     |" -ForegroundColor Cyan
    Write-Host "    |                                                              |" -ForegroundColor Cyan
    Write-Host "    ================================================================" -ForegroundColor Cyan
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

# Check Admin
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "  [XX] Execute como Administrador!" -ForegroundColor Red
    Write-Host "  Clique direito no PowerShell > Executar como Administrador" -ForegroundColor Gray
    Read-Host "  Pressione Enter para sair"
    exit 1
}

Show-Banner
Write-Step "Executando como Administrador" "OK"

# Check WSL
Write-Host ""
Write-Host "  === PASSO 1: Verificando WSL2 ===" -ForegroundColor White
Write-Host ""

$wslStatus = $null
try {
    $wslStatus = wsl --status 2>$null
} catch {}

if (-not $wslStatus -or $LASTEXITCODE -ne 0) {
    Write-Step "WSL2 nao encontrado. Instalando..." "WAIT"
    
    try {
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
} else {
    Write-Step "WSL2 ja esta instalado" "OK"
}

# Check Ubuntu
$distros = wsl --list --quiet 2>$null
if ($distros -notmatch "Ubuntu") {
    Write-Step "Ubuntu nao encontrado. Instalando..." "WAIT"
    wsl --install -d Ubuntu --no-launch
    Write-Step "Ubuntu instalado" "OK"
} else {
    Write-Step "Ubuntu encontrado" "OK"
}

Write-Host ""
Write-Host "  === PASSO 2: Instalando no WSL ===" -ForegroundColor White
Write-Host ""

# Create bash script for WSL
$bashScript = @'
#!/bin/bash
set -e

GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
NC='\\033[0m'

echo ""
echo -e "\${CYAN}    Instalando dependencias no Ubuntu...\${NC}"
echo ""

# Update and install dependencies
sudo apt update -qq 2>/dev/null
sudo apt install -y curl git build-essential python3 2>/dev/null

# Install Node.js 22 LTS
if ! command -v node &> /dev/null; then
    echo -e "\${YELLOW}[..] Instalando Node.js 22 LTS...\${NC}"
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - 2>/dev/null
    sudo apt install -y nodejs 2>/dev/null
fi
echo -e "\${GREEN}[OK] Node.js $(node --version)\${NC}"

# Install OpenClaw
if ! command -v openclaw &> /dev/null; then
    echo -e "\${YELLOW}[..] Instalando OpenClaw...\${NC}"
    sudo npm install -g openclaw 2>/dev/null
fi
echo -e "\${GREEN}[OK] OpenClaw instalado\${NC}"

# Create workspace
echo -e "\${YELLOW}[..] Criando workspace...\${NC}"
mkdir -p ~/OrionClaw/memory
cd ~/OrionClaw

# Run OpenClaw setup
openclaw setup --non-interactive 2>/dev/null || true

# Create config files
cat > USER.md << 'USEREOF'
# USER.md - Sobre Voce

- **Nome:** USER_NAME_PLACEHOLDER
- **Como chamar:** Senhor
- **Timezone:** America/Sao_Paulo
USEREOF
sed -i "s/USER_NAME_PLACEHOLDER/${USER_NAME}/" USER.md

cat > IDENTITY.md << 'IDENTITYEOF'
# IDENTITY.md - Quem Eu Sou

- **Nome:** AGENT_NAME_PLACEHOLDER
- **Criatura:** Assistente IA
- **Personalidade:** AGENT_PERSONALITY_PLACEHOLDER
IDENTITYEOF
sed -i "s/AGENT_NAME_PLACEHOLDER/${AGENT_NAME}/" IDENTITY.md
sed -i "s/AGENT_PERSONALITY_PLACEHOLDER/${AGENT_PERSONALITY}/" IDENTITY.md

cat > AGENTS.md << 'AGENTSEOF'
# AGENTS.md - Configuracao

## Memoria
- memory/YYYY-MM-DD.md - Memoria diaria
- MEMORY.md - Memoria de longo prazo

## Regras
- Seja util e direto
- Responda em portugues
AGENTSEOF

echo -e "\${GREEN}[OK] Workspace criado em ~/OrionClaw\${NC}"

# Create OpenClaw config
mkdir -p ~/.openclaw
cat > ~/.openclaw/openclaw.json << 'CONFIGEOF'
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "${defaultModel}"
      },
      "workspace": "~/OrionClaw",
      "compaction": {
        "mode": "safeguard",
        "reserveTokensFloor": 30000
      }
    }
  },
  "providers": {
    ${providerJson}
  },
  "channels": {
    ${channelJson}
  },
  "gateway": {
    "port": 18789,
    "mode": "local"
  }
}
CONFIGEOF

echo -e "\${GREEN}[OK] Configuracao criada\${NC}"

${hasOllama ? `
echo -e "\${YELLOW}[..] Instalando Ollama...\${NC}"
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3 2>/dev/null || true
echo -e "\${GREEN}[OK] Ollama instalado\${NC}"
` : ''}

${config.autoStart ? `
echo -e "\${YELLOW}[..] Iniciando gateway...\${NC}"
openclaw gateway start 2>/dev/null || true
echo -e "\${GREEN}[OK] Gateway iniciado\${NC}"
` : ''}

echo ""
echo -e "\${GREEN}================================================================\${NC}"
echo -e "\${GREEN}    INSTALACAO CONCLUIDA!\${NC}"
echo -e "\${GREEN}================================================================\${NC}"
echo ""
echo "  Para usar o OrionClaw:"
echo ""
echo -e "  \${CYAN}cd ~/OrionClaw && openclaw tui\${NC}"
echo ""
echo "  Para configurar provedores: openclaw configure"
echo ""
'@

# Save and run script
$scriptPath = "$env:TEMP\\orionclaw-install.sh"
$bashScript | Out-File -FilePath $scriptPath -Encoding utf8 -Force

# Convert line endings
$content = [System.IO.File]::ReadAllText($scriptPath) -replace "\`r\`n", "\`n"
[System.IO.File]::WriteAllText($scriptPath, $content, [System.Text.Encoding]::UTF8)

Write-Step "Executando instalacao no Ubuntu..." "WAIT"
try {
    $wslPath = wsl wslpath -a $scriptPath
    wsl bash -c "bash $wslPath"
    Write-Step "Instalacao no WSL concluida!" "OK"
} catch {
    Write-Step "Erro durante instalacao: $_" "ERROR"
    exit 1
}

Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "  |    INSTALACAO FINALIZADA!                                    |" -ForegroundColor Green
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Para usar o OrionClaw:" -ForegroundColor White
Write-Host ""
Write-Host "    1. Abra o WSL: " -ForegroundColor Gray -NoNewline
Write-Host "wsl" -ForegroundColor Cyan
Write-Host "    2. Execute:    " -ForegroundColor Gray -NoNewline
Write-Host "cd ~/OrionClaw && openclaw tui" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Para configurar provedores: " -ForegroundColor Gray -NoNewline
Write-Host "openclaw configure" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Documentacao: https://docs.openclaw.ai" -ForegroundColor DarkGray
Write-Host ""

Read-Host "  Pressione Enter para sair"
`;
  
  return script;
}

// Generate Unix (macOS/Linux) script
function generateUnixScript(config) {
  const providers = config.providers;
  const hasModal = providers.includes('modal');
  const hasOllama = providers.includes('ollama');
  
  // Build provider config JSON
  let providerConfig = [];
  if (config.keys.modal) providerConfig.push('"modal": { "apiKey": "' + config.keys.modal + '" }');
  if (config.keys.openrouter) providerConfig.push('"openrouter": { "apiKey": "' + config.keys.openrouter + '" }');
  if (config.keys.google) providerConfig.push('"google": { "apiKey": "' + config.keys.google + '" }');
  if (config.keys.opencode) providerConfig.push('"opencode": { "apiKey": "' + config.keys.opencode + '" }');
  if (config.keys.kilo) providerConfig.push('"kilocode": { "apiKey": "' + config.keys.kilo + '" }');
  if (config.keys.anthropic) providerConfig.push('"anthropic": { "apiKey": "' + config.keys.anthropic + '" }');
  if (config.keys.openai) providerConfig.push('"openai": { "apiKey": "' + config.keys.openai + '" }');
  if (hasOllama) providerConfig.push('"ollama": { "baseUrl": "http://127.0.0.1:11434" }');
  const providerJson = providerConfig.join(',\n    ');
  
  // Build channel config JSON
  let channelConfig = [];
  if (config.keys.telegram) channelConfig.push('"telegram": { "token": "' + config.keys.telegram + '" }');
  if (config.keys.discord) channelConfig.push('"discord": { "token": "' + config.keys.discord + '" }');
  const channelJson = channelConfig.join(',\n    ');
  
  // Default model
  let defaultModel = 'openrouter/meta-llama/llama-4-scout:free';
  if (hasModal) defaultModel = 'modal/zai-org/GLM-5-FP8';
  else if (config.keys.google) defaultModel = 'google/gemini-2.5-flash';
  
  const script = `#!/bin/bash
# OrionClaw One-Click Installer - Unix (Linux/macOS)
# Generated by https://orionclaw.pages.dev
# Repository: https://github.com/Neguiolidas/OrionClaw

set -e

# Colors
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
RED='\\033[0;31m'
NC='\\033[0m'

# Config
USER_NAME="${config.userName}"
AGENT_NAME="${config.agentName}"
AGENT_PERSONALITY="${config.agentPersonality}"

show_banner() {
    clear
    echo ""
    echo -e "\${CYAN}    ================================================================\${NC}"
    echo -e "\${CYAN}    |                                                              |\${NC}"
    echo -e "\${CYAN}    |     ORIONCLAW - One-Click AI Assistant Installer             |\${NC}"
    echo -e "\${CYAN}    |     Based on OpenClaw - 100% Free Models                     |\${NC}"
    echo -e "\${CYAN}    |                                                              |\${NC}"
    echo -e "\${CYAN}    ================================================================\${NC}"
    echo ""
}

step() {
    local status=\$1
    local message=\$2
    local icon=""
    local color=""
    
    case \$status in
        "OK")    icon="[OK]"; color=\$GREEN ;;
        "WAIT")  icon="[..]"; color=\$YELLOW ;;
        "WARN")  icon="[!!]"; color=\$YELLOW ;;
        "ERROR") icon="[XX]"; color=\$RED ;;
        *)       icon="[>>]"; color=\$CYAN ;;
    esac
    
    echo -e "  \${color}\${icon}\${NC} \${message}"
}

detect_os() {
    if [[ "\$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ -f /etc/debian_version ]]; then
        echo "debian"
    elif [[ -f /etc/fedora-release ]]; then
        echo "fedora"
    elif [[ -f /etc/arch-release ]]; then
        echo "arch"
    else
        echo "linux"
    fi
}

install_dependencies() {
    local os=\$1
    
    step "WAIT" "Instalando dependencias..."
    
    case \$os in
        "macos")
            if ! command -v brew &> /dev/null; then
                step "WAIT" "Instalando Homebrew..."
                /bin/bash -c "\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install node git python3 2>/dev/null || true
            ;;
        "debian")
            sudo apt update -qq 2>/dev/null
            sudo apt install -y curl git build-essential python3 2>/dev/null
            
            if ! command -v node &> /dev/null; then
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
        *)
            step "WARN" "OS nao reconhecido. Tentando instalacao generica..."
            if command -v apt &> /dev/null; then
                sudo apt update && sudo apt install -y curl git build-essential nodejs npm python3
            fi
            ;;
    esac
    
    step "OK" "Dependencias instaladas"
}

show_banner

echo ""
echo "  === PASSO 1: Detectando Sistema ==="
echo ""
OS=\$(detect_os)
step "OK" "Sistema: \$OS"

echo ""
echo "  === PASSO 2: Instalando Dependencias ==="
echo ""
install_dependencies \$OS

if command -v node &> /dev/null; then
    step "OK" "Node.js \$(node --version)"
fi

echo ""
echo "  === PASSO 3: Instalando OpenClaw ==="
echo ""

if ! command -v openclaw &> /dev/null; then
    step "WAIT" "Instalando OpenClaw..."
    sudo npm install -g openclaw 2>/dev/null
fi
step "OK" "OpenClaw instalado"

echo ""
echo "  === PASSO 4: Configurando Workspace ==="
echo ""

step "WAIT" "Criando workspace..."
mkdir -p ~/OrionClaw/memory
cd ~/OrionClaw

openclaw setup --non-interactive 2>/dev/null || true

cat > USER.md << 'USEREOF'
# USER.md - Sobre Voce

- **Nome:** ${config.userName}
- **Como chamar:** Senhor
- **Timezone:** America/Sao_Paulo
USEREOF

cat > IDENTITY.md << 'IDENTITYEOF'
# IDENTITY.md - Quem Eu Sou

- **Nome:** ${config.agentName}
- **Criatura:** Assistente IA
- **Personalidade:** ${config.agentPersonality}
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

step "OK" "Workspace criado em ~/OrionClaw"

mkdir -p ~/.openclaw
cat > ~/.openclaw/openclaw.json << 'CONFIGEOF'
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "${defaultModel}"
      },
      "workspace": "~/OrionClaw",
      "compaction": {
        "mode": "safeguard",
        "reserveTokensFloor": 30000
      }
    }
  },
  "providers": {
    ${providerJson}
  },
  "channels": {
    ${channelJson}
  },
  "gateway": {
    "port": 18789,
    "mode": "local"
  }
}
CONFIGEOF

step "OK" "Configuracao criada"

${hasOllama ? `
step "WAIT" "Instalando Ollama..."
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3 2>/dev/null || true
step "OK" "Ollama instalado"
` : ''}

${config.autoStart ? `
step "WAIT" "Iniciando gateway..."
openclaw gateway start 2>/dev/null || true
step "OK" "Gateway iniciado"
` : ''}

echo ""
echo -e "\${GREEN}================================================================\${NC}"
echo -e "\${GREEN}    INSTALACAO CONCLUIDA!\${NC}"
echo -e "\${GREEN}================================================================\${NC}"
echo ""
echo "  Para usar o OrionClaw:"
echo ""
echo -e "  \${CYAN}cd ~/OrionClaw && openclaw tui\${NC}"
echo ""
echo "  Para configurar provedores: openclaw configure"
echo ""
echo "  Documentacao: https://docs.openclaw.ai"
echo ""
`;
  
  return script;
}
