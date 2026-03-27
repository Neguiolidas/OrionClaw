// OrionClaw Installer - Frontend Logic
// Version: 3.0.0 - Native Windows support

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
    radio.addEventListener('change', () => {
      updateOSDefaults();
      if (currentStep === totalSteps) {
        generateInstallCommand();
      }
    });
  });
}

// Agent slider
function setupAgentSlider() {
  const slider = document.getElementById('agent-count');
  const display = document.getElementById('agent-count-display');
  
  if (slider && display) {
    slider.addEventListener('input', () => {
      display.textContent = slider.value;
      updateCostEstimate();
    });
  }
}

function setupProviderListeners() {
  document.querySelectorAll('input[name="providers"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateCostEstimate);
  });
}

function setAgentCount(count) {
  const slider = document.getElementById('agent-count');
  const display = document.getElementById('agent-count-display');
  if (slider && display) {
    slider.value = count;
    display.textContent = count;
    updateCostEstimate();
  }
}

function updateCostEstimate() {
  const agentCount = parseInt(document.getElementById('agent-count')?.value || '1');
  const providers = Array.from(document.querySelectorAll('input[name="providers"]:checked')).map(el => el.value);
  const costDiv = document.getElementById('cost-estimate');
  
  if (!costDiv) return;
  
  const hasFreeProviders = providers.some(p => ['modal', 'openrouter', 'ollama', 'google', 'opencode', 'kilo'].includes(p));
  const hasPaidProviders = providers.some(p => ['anthropic', 'openai'].includes(p));
  
  let html = '';
  
  if (hasFreeProviders && !hasPaidProviders) {
    html = '<p class="cost-free">Com provedores gratuitos selecionados: <strong>$0/mes</strong></p>';
  } else if (hasPaidProviders) {
    const estimatedCost = agentCount * 5;
    if (agentCount <= 3) {
      html = '<p class="cost-low">Estimativa com ' + agentCount + ' agente(s): <strong>~$' + estimatedCost + '-' + (estimatedCost * 2) + '/mes</strong></p>';
    } else {
      html = '<p class="cost-high">Atencao! ' + agentCount + ' agente(s): <strong>~$' + estimatedCost + '-' + (estimatedCost * 3) + '/mes</strong></p>';
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
  
  if (select && customGroup) {
    select.addEventListener('change', () => {
      customGroup.style.display = select.value === 'custom' ? 'block' : 'none';
    });
  }
}

// Navigation
function nextStep() {
  if (currentStep < totalSteps) {
    if (!validateStep(currentStep)) return;
    
    const currentStepEl = document.querySelector('.step[data-step="' + currentStep + '"]');
    if (currentStepEl) {
      currentStepEl.classList.add('completed');
      currentStepEl.classList.remove('active');
    }
    
    currentStep++;
    
    const nextStepEl = document.querySelector('.step[data-step="' + currentStep + '"]');
    if (nextStepEl) {
      nextStepEl.classList.add('active');
    }
    
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    const formStep = document.querySelector('.form-step[data-step="' + currentStep + '"]');
    if (formStep) {
      formStep.classList.add('active');
    }
    
    updateNavigationButtons();
    
    if (currentStep === totalSteps) {
      generateSummary();
      generateInstallCommand();
    }
  }
}

function prevStep() {
  if (currentStep > 1) {
    const currentStepEl = document.querySelector('.step[data-step="' + currentStep + '"]');
    if (currentStepEl) {
      currentStepEl.classList.remove('active');
    }
    
    currentStep--;
    
    const prevStepEl = document.querySelector('.step[data-step="' + currentStep + '"]');
    if (prevStepEl) {
      prevStepEl.classList.remove('completed');
      prevStepEl.classList.add('active');
    }
    
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    const formStep = document.querySelector('.form-step[data-step="' + currentStep + '"]');
    if (formStep) {
      formStep.classList.add('active');
    }
    
    updateNavigationButtons();
  }
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  if (prevBtn) {
    prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
  }
  
  if (nextBtn) {
    if (currentStep === totalSteps) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = 'block';
      nextBtn.textContent = currentStep === totalSteps - 1 ? 'Finalizar' : 'Proximo';
    }
  }
}

function validateStep(step) {
  if (step === 4) {
    const userName = document.getElementById('user-name')?.value.trim();
    if (!userName) {
      alert('Por favor, insira seu nome.');
      document.getElementById('user-name')?.focus();
      return false;
    }
  }
  return true;
}

// Get configuration
function getConfig() {
  const form = document.getElementById('installer-form');
  
  function getVal(name) {
    const el = form?.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }
  
  const osEl = document.querySelector('input[name="os"]:checked');
  
  return {
    os: osEl ? osEl.value : 'windows',
    installDir: document.getElementById('install-dir')?.value || 'C:\\OrionClaw',
    autoStart: document.getElementById('auto-start')?.checked || false,
    providers: Array.from(document.querySelectorAll('input[name="providers"]:checked')).map(el => el.value),
    channels: Array.from(document.querySelectorAll('input[name="channels"]:checked')).map(el => el.value),
    userName: document.getElementById('user-name')?.value || 'Usuario',
    agentCount: parseInt(document.getElementById('agent-count')?.value || '1'),
    agentName: document.getElementById('agent-name')?.value || 'Assistant',
    agentPersonality: document.getElementById('agent-personality')?.value || 'neutral',
    customPersonality: document.getElementById('custom-personality')?.value || '',
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
  
  if (!summaryDiv) return;
  
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
  
  if (config.providers.length > 0) {
    html += '<div class="summary-item"><span class="summary-label">Provedores:</span><span class="summary-value">' + config.providers.map(p => providerNames[p] || p).join(', ') + '</span></div>';
  }
  
  if (config.channels.length > 0) {
    html += '<div class="summary-item"><span class="summary-label">Canais:</span><span class="summary-value">' + config.channels.map(c => channelNames[c] || c).join(', ') + '</span></div>';
  }
  
  html += '</div>';
  
  summaryDiv.innerHTML = html;
}

// Generate install command
function generateInstallCommand() {
  const config = getConfig();
  const commandEl = document.getElementById('install-command');
  
  if (!commandEl) return;
  
  // Use current page origin
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
  
  if (config.os === 'windows') {
    commandEl.textContent = 'irm ' + baseUrl + '/install.ps1 | iex';
  } else {
    commandEl.textContent = 'curl -fsSL ' + baseUrl + '/install.sh | bash';
  }
}

// Copy command
function copyCommand() {
  const commandEl = document.getElementById('install-command');
  if (!commandEl) return;
  
  const command = commandEl.textContent;
  navigator.clipboard.writeText(command).then(() => {
    const btn = document.querySelector('.copy-btn');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>Copiado!</span>';
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    }
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = command;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  });
}

// Download script - FIXED
function downloadScript() {
  const config = getConfig();
  let script, filename, mimeType;
  
  if (config.os === 'windows') {
    script = generateWindowsScript(config);
    filename = 'install-orionclaw.ps1';
    mimeType = 'text/plain';
  } else {
    script = generateUnixScript(config);
    filename = 'install-orionclaw.sh';
    mimeType = 'text/plain';
  }
  
  // Create blob WITHOUT BOM (causes issues)
  const blob = new Blob([script], { type: mimeType + '; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Generate Windows PowerShell script - NATIVE (no WSL)
function generateWindowsScript(config) {
  const providers = config.providers;
  const channels = config.channels;
  const hasModal = providers.includes('modal');
  const hasOllama = providers.includes('ollama');
  const installDir = config.installDir || 'C:\\OrionClaw';
  
  // Build provider config
  let providerLines = [];
  if (config.keys.modal) providerLines.push('    "modal": { "apiKey": "' + config.keys.modal + '" }');
  if (config.keys.openrouter) providerLines.push('    "openrouter": { "apiKey": "' + config.keys.openrouter + '" }');
  if (config.keys.google) providerLines.push('    "google": { "apiKey": "' + config.keys.google + '" }');
  if (config.keys.opencode) providerLines.push('    "opencode": { "apiKey": "' + config.keys.opencode + '" }');
  if (config.keys.kilo) providerLines.push('    "kilocode": { "apiKey": "' + config.keys.kilo + '" }');
  if (config.keys.anthropic) providerLines.push('    "anthropic": { "apiKey": "' + config.keys.anthropic + '" }');
  if (config.keys.openai) providerLines.push('    "openai": { "apiKey": "' + config.keys.openai + '" }');
  if (hasOllama) providerLines.push('    "ollama": { "baseUrl": "http://127.0.0.1:11434" }');
  const providerJson = providerLines.join(',\n');
  
  // Build channel config
  let channelLines = [];
  if (config.keys.telegram) channelLines.push('    "telegram": { "token": "' + config.keys.telegram + '" }');
  if (config.keys.discord) channelLines.push('    "discord": { "token": "' + config.keys.discord + '" }');
  const channelJson = channelLines.join(',\n');
  
  // Default model
  let defaultModel = 'openrouter/meta-llama/llama-4-scout:free';
  if (hasModal) defaultModel = 'modal/zai-org/GLM-5-FP8';
  else if (config.keys.google) defaultModel = 'google/gemini-2.5-flash';
  
  // Escape install dir for PowerShell
  const installDirEscaped = installDir.replace(/\\/g, '\\\\');
  const installDirForward = installDir.replace(/\\/g, '/');
  
  return `#Requires -RunAsAdministrator
# OrionClaw One-Click Installer - Windows Native
# Generated by OrionClaw Web Installer

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$INSTALL_DIR = "${installDir}"
$USER_NAME = "${config.userName}"
$AGENT_NAME = "${config.agentName}"
$AGENT_PERSONALITY = "${config.agentPersonality}"

function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  ================================================================" -ForegroundColor Cyan
    Write-Host "  |     ORIONCLAW - One-Click AI Assistant Installer             |" -ForegroundColor Cyan
    Write-Host "  |     Based on OpenClaw - 100% Free Models                     |" -ForegroundColor Cyan
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
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "  [XX] Execute como Administrador!" -ForegroundColor Red
    Read-Host "  Pressione Enter para sair"
    exit 1
}

Show-Banner
Write-Step "Executando como Administrador" "OK"

# Step 1: Node.js
Write-Host ""
Write-Host "  === PASSO 1: Node.js ===" -ForegroundColor White
Write-Host ""

if (Test-Command "node") {
    $v = (node --version)
    Write-Step "Node.js $v encontrado" "OK"
} else {
    Write-Step "Instalando Node.js 22..." "WAIT"
    $url = "https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi"
    $installer = "$env:TEMP\\node.msi"
    Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
    Start-Process msiexec.exe -ArgumentList "/i \`"$installer\`" /qn" -Wait
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
    Write-Step "Node.js instalado" "OK"
}

# Step 2: Git
Write-Host ""
Write-Host "  === PASSO 2: Git ===" -ForegroundColor White
Write-Host ""

if (Test-Command "git") {
    Write-Step "Git encontrado" "OK"
} else {
    Write-Step "Instalando Git..." "WAIT"
    $url = "https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe"
    $installer = "$env:TEMP\\git.exe"
    Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
    Start-Process $installer -ArgumentList "/VERYSILENT /NORESTART" -Wait
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
    Write-Step "Git instalado" "OK"
}

# Step 3: OpenClaw CLI
Write-Host ""
Write-Host "  === PASSO 3: OrionClaw CLI ===" -ForegroundColor White
Write-Host ""

Write-Step "Instalando openclaw..." "WAIT"
npm install -g openclaw 2>&1 | Out-Null
Write-Step "OrionClaw CLI instalado" "OK"

# Step 4: Workspace
Write-Host ""
Write-Host "  === PASSO 4: Workspace ===" -ForegroundColor White
Write-Host ""

New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\\memory" -Force | Out-Null

@"
# USER.md
- **Nome:** $USER_NAME
- **Como chamar:** Senhor
"@ | Set-Content "$INSTALL_DIR\\USER.md" -Encoding UTF8

@"
# IDENTITY.md
- **Nome:** $AGENT_NAME
- **Personalidade:** $AGENT_PERSONALITY
"@ | Set-Content "$INSTALL_DIR\\IDENTITY.md" -Encoding UTF8

@"
# AGENTS.md
## Memoria
- memory/YYYY-MM-DD.md - Diaria
- MEMORY.md - Longo prazo
"@ | Set-Content "$INSTALL_DIR\\AGENTS.md" -Encoding UTF8

Write-Step "Workspace criado em $INSTALL_DIR" "OK"

# Step 5: Config
Write-Host ""
Write-Host "  === PASSO 5: Configuracao ===" -ForegroundColor White
Write-Host ""

$configDir = "$env:USERPROFILE\\.openclaw"
New-Item -ItemType Directory -Path $configDir -Force | Out-Null

@"
{
  "agents": {
    "defaults": {
      "model": { "primary": "${defaultModel}" },
      "workspace": "${installDirForward}",
      "compaction": { "mode": "safeguard", "reserveTokensFloor": 30000 }
    }
  },
  "providers": {
${providerJson}
  },
  "channels": {
${channelJson}
  },
  "gateway": { "port": 18789, "mode": "local" }
}
"@ | Set-Content "$configDir\\openclaw.json" -Encoding UTF8

Write-Step "Configuracao criada" "OK"

# Done
Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "  |    INSTALACAO FINALIZADA!                                    |" -ForegroundColor Green
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Para usar:" -ForegroundColor White
Write-Host "    cd $INSTALL_DIR" -ForegroundColor Cyan
Write-Host "    openclaw tui" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Comandos:" -ForegroundColor Gray
Write-Host "    openclaw configure - Configurar provedores" -ForegroundColor Gray
Write-Host "    openclaw doctor    - Diagnosticar" -ForegroundColor Gray
Write-Host ""
Read-Host "  Pressione Enter para sair"
`;
}

// Generate Unix (macOS/Linux) script
function generateUnixScript(config) {
  const providers = config.providers;
  const hasModal = providers.includes('modal');
  const hasOllama = providers.includes('ollama');
  const installDir = config.installDir || '~/OrionClaw';
  
  // Build provider config
  let providerLines = [];
  if (config.keys.modal) providerLines.push('    "modal": { "apiKey": "' + config.keys.modal + '" }');
  if (config.keys.openrouter) providerLines.push('    "openrouter": { "apiKey": "' + config.keys.openrouter + '" }');
  if (config.keys.google) providerLines.push('    "google": { "apiKey": "' + config.keys.google + '" }');
  if (config.keys.opencode) providerLines.push('    "opencode": { "apiKey": "' + config.keys.opencode + '" }');
  if (config.keys.kilo) providerLines.push('    "kilocode": { "apiKey": "' + config.keys.kilo + '" }');
  if (config.keys.anthropic) providerLines.push('    "anthropic": { "apiKey": "' + config.keys.anthropic + '" }');
  if (config.keys.openai) providerLines.push('    "openai": { "apiKey": "' + config.keys.openai + '" }');
  if (hasOllama) providerLines.push('    "ollama": { "baseUrl": "http://127.0.0.1:11434" }');
  const providerJson = providerLines.join(',\\n');
  
  // Build channel config
  let channelLines = [];
  if (config.keys.telegram) channelLines.push('    "telegram": { "token": "' + config.keys.telegram + '" }');
  if (config.keys.discord) channelLines.push('    "discord": { "token": "' + config.keys.discord + '" }');
  const channelJson = channelLines.join(',\\n');
  
  // Default model
  let defaultModel = 'openrouter/meta-llama/llama-4-scout:free';
  if (hasModal) defaultModel = 'modal/zai-org/GLM-5-FP8';
  else if (config.keys.google) defaultModel = 'google/gemini-2.5-flash';
  
  return `#!/bin/bash
# OrionClaw One-Click Installer - Unix (Linux/macOS)
# Generated by OrionClaw Web Installer

set -e

INSTALL_DIR="${installDir}"
USER_NAME="${config.userName}"
AGENT_NAME="${config.agentName}"
AGENT_PERSONALITY="${config.agentPersonality}"

GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
RED='\\033[0;31m'
NC='\\033[0m'

step() {
    local status=\$1
    local msg=\$2
    case \$status in
        "OK")    echo -e "  \${GREEN}[OK]\${NC} \$msg" ;;
        "WAIT")  echo -e "  \${YELLOW}[..]\${NC} \$msg" ;;
        "ERROR") echo -e "  \${RED}[XX]\${NC} \$msg" ;;
        *)       echo -e "  \${CYAN}[>>]\${NC} \$msg" ;;
    esac
}

clear
echo ""
echo -e "\${CYAN}  ================================================================\${NC}"
echo -e "\${CYAN}  |     ORIONCLAW - One-Click AI Assistant Installer             |\${NC}"
echo -e "\${CYAN}  |     Based on OpenClaw - 100% Free Models                     |\${NC}"
echo -e "\${CYAN}  ================================================================\${NC}"
echo ""

# Detect OS
if [[ "\$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ -f /etc/debian_version ]]; then
    OS="debian"
elif [[ -f /etc/fedora-release ]]; then
    OS="fedora"
else
    OS="linux"
fi
step "OK" "Sistema: \$OS"

# Install dependencies
echo ""
echo "  === PASSO 1: Dependencias ==="
echo ""

case \$OS in
    "macos")
        if ! command -v brew &>/dev/null; then
            step "WAIT" "Instalando Homebrew..."
            /bin/bash -c "\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install node git 2>/dev/null || true
        ;;
    "debian")
        sudo apt update -qq
        sudo apt install -y curl git build-essential
        if ! command -v node &>/dev/null; then
            step "WAIT" "Instalando Node.js 22..."
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
            sudo apt install -y nodejs
        fi
        ;;
    "fedora")
        sudo dnf install -y nodejs git
        ;;
    *)
        step "WARN" "OS nao reconhecido. Instale Node.js manualmente."
        ;;
esac

step "OK" "Node.js \$(node --version)"
step "OK" "npm \$(npm --version)"

# Install OpenClaw
echo ""
echo "  === PASSO 2: OrionClaw CLI ==="
echo ""

step "WAIT" "Instalando openclaw..."
sudo npm install -g openclaw 2>/dev/null || npm install -g openclaw
step "OK" "OrionClaw CLI instalado"

# Create workspace
echo ""
echo "  === PASSO 3: Workspace ==="
echo ""

mkdir -p \$INSTALL_DIR/memory
cd \$INSTALL_DIR

cat > USER.md << 'EOF'
# USER.md
- **Nome:** ${config.userName}
- **Como chamar:** Senhor
EOF

cat > IDENTITY.md << 'EOF'
# IDENTITY.md
- **Nome:** ${config.agentName}
- **Personalidade:** ${config.agentPersonality}
EOF

cat > AGENTS.md << 'EOF'
# AGENTS.md
## Memoria
- memory/YYYY-MM-DD.md - Diaria
- MEMORY.md - Longo prazo
EOF

step "OK" "Workspace criado em \$INSTALL_DIR"

# Config
echo ""
echo "  === PASSO 4: Configuracao ==="
echo ""

mkdir -p ~/.openclaw
cat > ~/.openclaw/openclaw.json << 'EOF'
{
  "agents": {
    "defaults": {
      "model": { "primary": "${defaultModel}" },
      "workspace": "${installDir}",
      "compaction": { "mode": "safeguard", "reserveTokensFloor": 30000 }
    }
  },
  "providers": {
${providerJson}
  },
  "channels": {
${channelJson}
  },
  "gateway": { "port": 18789, "mode": "local" }
}
EOF

step "OK" "Configuracao criada"

${hasOllama ? `
# Ollama
echo ""
echo "  === Instalando Ollama ==="
echo ""
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3 2>/dev/null || true
step "OK" "Ollama instalado"
` : ''}

# Done
echo ""
echo -e "\${GREEN}  ================================================================\${NC}"
echo -e "\${GREEN}  |    INSTALACAO FINALIZADA!                                    |\${NC}"
echo -e "\${GREEN}  ================================================================\${NC}"
echo ""
echo "  Para usar:"
echo -e "    \${CYAN}cd \$INSTALL_DIR && openclaw tui\${NC}"
echo ""
echo "  Comandos:"
echo "    openclaw configure - Configurar provedores"
echo "    openclaw doctor    - Diagnosticar"
echo ""
`;
}
