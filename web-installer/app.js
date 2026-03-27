// OrionClaw Installer - Frontend Logic
// Version: 1.0.1 - Fixed syntax errors

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
    html = '<p class="cost-free">✅ Com provedores gratuitos selecionados: <strong>$0/mês</strong></p>';
  } else if (hasPaidProviders) {
    const estimatedCost = agentCount * 5;
    if (agentCount <= 3) {
      html = '<p class="cost-low">💰 Estimativa com ' + agentCount + ' agente(s): <strong>~$' + estimatedCost + '-' + (estimatedCost * 2) + '/mês</strong></p>';
    } else {
      html = '<p class="cost-high">⚠️ Estimativa com ' + agentCount + ' agente(s): <strong>~$' + estimatedCost + '-' + (estimatedCost * 3) + '/mês</strong></p>';
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
    nextBtn.textContent = currentStep === totalSteps - 1 ? 'Finalizar →' : 'Próximo →';
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
  
  const osNames = {
    windows: 'Windows (WSL2)',
    macos: 'macOS',
    linux: 'Linux'
  };
  
  const providerNames = {
    'modal': 'Modal GLM-5',
    'openrouter': 'OpenRouter',
    'ollama': 'Ollama (Local)',
    'google': 'Google AI',
    'opencode': 'OpenCode',
    'kilo': 'Kilo Gateway',
    'anthropic': 'Anthropic',
    'openai': 'OpenAI'
  };
  
  const channelNames = {
    'telegram': 'Telegram',
    'discord': 'Discord',
    'whatsapp': 'WhatsApp'
  };

  const personalityNames = {
    'neutral': 'Neutro',
    'friendly': 'Amigável',
    'formal': 'Formal',
    'witty': 'Espirituoso',
    'custom': 'Customizado'
  };
  
  const providerList = config.providers.map(p => providerNames[p] || p).join(', ') || 'Nenhum';
  const channelList = config.channels.map(c => channelNames[c] || c).join(', ') || 'Terminal apenas';
  
  summaryDiv.innerHTML = 
    '<div class="summary-item"><span class="summary-label">Sistema Operacional</span><span class="summary-value">' + osNames[config.os] + '</span></div>' +
    '<div class="summary-item"><span class="summary-label">Diretório</span><span class="summary-value">' + config.installDir + '</span></div>' +
    '<div class="summary-item"><span class="summary-label">Auto-Start</span><span class="summary-value">' + (config.autoStart ? '✅ Sim' : '❌ Não') + '</span></div>' +
    '<div class="summary-item"><span class="summary-label">Provedores de IA</span><span class="summary-value">' + providerList + '</span></div>' +
    '<div class="summary-item"><span class="summary-label">Agentes</span><span class="summary-value">' + config.agentCount + ' agente(s) - "' + config.agentName + '"</span></div>' +
    '<div class="summary-item"><span class="summary-label">Personalidade</span><span class="summary-value">' + personalityNames[config.agentPersonality] + '</span></div>' +
    '<div class="summary-item"><span class="summary-label">Canais</span><span class="summary-value">' + channelList + '</span></div>' +
    '<div class="summary-item"><span class="summary-label">Nome do Usuário</span><span class="summary-value">' + config.userName + '</span></div>';
}

// Generate install command
function generateInstallCommand() {
  const config = getConfig();
  const commandEl = document.getElementById('install-command');
  
  let command;
  
  if (config.os === 'windows') {
    command = 'irm https://raw.githubusercontent.com/Neguiolidas/OrionClaw/main/scripts/install.ps1 | iex';
  } else {
    command = 'curl -fsSL https://raw.githubusercontent.com/Neguiolidas/OrionClaw/main/scripts/install.sh | bash';
  }
  
  commandEl.textContent = command;
}

// Download script
function downloadScript() {
  const config = getConfig();
  let script, filename, mimeType;
  
  if (config.os === 'windows') {
    script = generateWindowsScript(config);
    filename = 'install-orionclaw.ps1';
    mimeType = 'application/x-powershell';
  } else {
    script = generateUnixScript(config);
    filename = 'install-orionclaw.sh';
    mimeType = 'application/x-sh';
  }
  
  const blob = new Blob([script], { type: mimeType });
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
  const hasTelegram = channels.includes('telegram');
  const hasDiscord = channels.includes('discord');
  
  // Build provider config JSON
  let providerJson = '';
  if (config.keys.modal) providerJson += '    "modal": { "apiKey": "' + config.keys.modal + '" },\n';
  if (config.keys.openrouter) providerJson += '    "openrouter": { "apiKey": "' + config.keys.openrouter + '" },\n';
  if (config.keys.google) providerJson += '    "google": { "apiKey": "' + config.keys.google + '" },\n';
  if (config.keys.opencode) providerJson += '    "opencode": { "apiKey": "' + config.keys.opencode + '" },\n';
  if (config.keys.kilo) providerJson += '    "kilocode": { "apiKey": "' + config.keys.kilo + '" },\n';
  if (config.keys.anthropic) providerJson += '    "anthropic": { "apiKey": "' + config.keys.anthropic + '" },\n';
  if (config.keys.openai) providerJson += '    "openai": { "apiKey": "' + config.keys.openai + '" },\n';
  if (hasOllama) providerJson += '    "ollama": { "baseUrl": "http://127.0.0.1:11434" },\n';
  providerJson = providerJson.replace(/,\n$/, '');
  
  // Build channel config JSON
  let channelJson = '';
  if (config.keys.telegram) channelJson += '    "telegram": { "token": "' + config.keys.telegram + '" },\n';
  if (config.keys.discord) channelJson += '    "discord": { "token": "' + config.keys.discord + '" },\n';
  channelJson = channelJson.replace(/,\n$/, '');
  
  // Default model
  let defaultModel = 'openrouter/meta-llama/llama-4-scout';
  if (hasModal) defaultModel = 'modal/zai-org/GLM-5-FP8';
  else if (config.keys.google) defaultModel = 'google/gemini-2.5-flash';
  
  const script = [
    '#Requires -RunAsAdministrator',
    '# OrionClaw One-Click Installer - Windows',
    '# Repository: https://github.com/Neguiolidas/OrionClaw',
    '',
    '$ErrorActionPreference = "Stop"',
    '$ProgressPreference = "SilentlyContinue"',
    '',
    '# Configuration',
    '$USER_NAME = "' + config.userName + '"',
    '$AGENT_NAME = "' + config.agentName + '"',
    '$AUTO_START = $' + config.autoStart,
    '',
    'Clear-Host',
    'Write-Host ""',
    'Write-Host "  🐺 OrionClaw One-Click Installer" -ForegroundColor Cyan',
    'Write-Host "  ═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray',
    'Write-Host ""',
    '',
    '# Check admin',
    '$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())',
    'if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {',
    '    Write-Host "  ❌ Execute como Administrador!" -ForegroundColor Red',
    '    exit 1',
    '}',
    '',
    '# WSL2',
    'Write-Host "  📦 Verificando WSL2..." -ForegroundColor Yellow',
    '$wslStatus = wsl --status 2>$null',
    'if (-not $?) {',
    '    Write-Host "  Instalando WSL2..." -ForegroundColor Gray',
    '    wsl --install -d Ubuntu --no-launch',
    '    Write-Host "  ⚠️ Reinicie e execute novamente!" -ForegroundColor Yellow',
    '    exit 0',
    '}',
    'Write-Host "  ✅ WSL2 instalado" -ForegroundColor Green',
    '',
    '# Install in WSL',
    'Write-Host "  📦 Instalando no WSL..." -ForegroundColor Yellow',
    '',
    '$script = @\'',
    '#!/bin/bash',
    'set -e',
    'echo ""',
    'echo "🐺 Instalando OrionClaw..."',
    'echo ""',
    '',
    '# Dependencies',
    'sudo apt update -qq',
    'sudo apt install -y curl git build-essential python3',
    '',
    '# Node.js 22',
    'echo "📦 Instalando Node.js 22 LTS..."',
    'curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -',
    'sudo apt install -y nodejs',
    'echo "✅ Node.js $(node --version) instalado"',
    '',
    '# OpenClaw',
    'echo "📦 Instalando OpenClaw..."',
    'npm install -g openclaw',
    'echo "✅ OpenClaw instalado"',
    '',
    '# Workspace',
    'echo "📁 Configurando workspace..."',
    'mkdir -p ~/OrionClaw/memory',
    'cd ~/OrionClaw',
    'openclaw setup --non-interactive 2>/dev/null || true',
    '',
    '# USER.md',
    'cat > USER.md << "USEREOF"',
    '# USER.md',
    '- **Nome:** ' + config.userName,
    '- **Como chamar:** Senhor',
    'USEREOF',
    '',
    '# IDENTITY.md',
    'cat > IDENTITY.md << "IDENTITYEOF"',
    '# IDENTITY.md',
    '- **Nome:** ' + config.agentName,
    '- **Criatura:** Assistente IA',
    '- **Personalidade:** ' + config.agentPersonality,
    'IDENTITYEOF',
    '',
    '# AGENTS.md',
    'cat > AGENTS.md << "AGENTSEOF"',
    '# AGENTS.md',
    '## Memória',
    '- memory/YYYY-MM-DD.md - Memória diária',
    'AGENTSEOF',
    '',
    'echo "✅ Workspace configurado"',
    '',
    hasOllama ? '# Ollama\necho "🦙 Instalando Ollama..."\ncurl -fsSL https://ollama.com/install.sh | sh\nollama pull llama3 || true\necho "✅ Ollama instalado"\n' : '',
    '',
    hasModal ? '# Modal Proxy\necho "🚀 Configurando Modal proxy..."\nmkdir -p ~/.openclaw/wrapper\ncat > ~/.openclaw/wrapper/modal-proxy.js << "PROXYEOF"\nconst http = require("http");\nconst https = require("https");\nconst PORT = 8765;\nconst TARGET = "api.us-west-2.modal.direct";\nconst TIMEOUT = 120000;\nconst server = http.createServer((req, res) => {\n  if (req.url === "/health") { res.writeHead(200); res.end(JSON.stringify({status:"ok"})); return; }\n  let body = "";\n  req.on("data", c => body += c);\n  req.on("end", () => {\n    const pr = https.request({hostname:TARGET,port:443,path:req.url,method:req.method,headers:{...req.headers,host:TARGET},timeout:TIMEOUT}, proxyRes => { res.writeHead(proxyRes.statusCode, proxyRes.headers); proxyRes.pipe(res); });\n    pr.on("error", e => { res.writeHead(502); res.end(JSON.stringify({error:e.message})); });\n    pr.on("timeout", () => { pr.destroy(); if(!res.headersSent){res.writeHead(504);res.end(JSON.stringify({error:"timeout"}));} });\n    if(body) pr.write(body);\n    pr.end();\n  });\n});\nserver.listen(PORT, "127.0.0.1", () => console.log("Modal proxy on " + PORT));\nPROXYEOF\nmkdir -p ~/.config/systemd/user\ncat > ~/.config/systemd/user/modal-proxy.service << "SVCEOF"\n[Unit]\nDescription=Modal GLM-5 Proxy\nAfter=network.target\n[Service]\nType=simple\nExecStart=/usr/bin/node $HOME/.openclaw/wrapper/modal-proxy.js\nRestart=always\n[Install]\nWantedBy=default.target\nSVCEOF\nsystemctl --user daemon-reload\nsystemctl --user enable modal-proxy\nsystemctl --user start modal-proxy\necho "✅ Modal proxy configurado"\n' : '',
    '',
    '# Config',
    'mkdir -p ~/.openclaw',
    'cat > ~/.openclaw/openclaw.json << "CONFIGEOF"',
    '{',
    '  "providers": {',
    providerJson,
    '  },',
    '  "channels": {',
    channelJson,
    '  },',
    '  "agents": {',
    '    "defaults": {',
    '      "model": "' + defaultModel + '",',
    '      "compaction": { "mode": "safeguard", "reserveTokensFloor": 30000 }',
    '    }',
    '  }',
    '}',
    'CONFIGEOF',
    'echo "✅ Configurado"',
    '',
    config.autoStart ? '# Start\necho "🚀 Iniciando gateway..."\nopenclaw gateway start\necho "✅ Gateway iniciado"\n' : '',
    '',
    'echo ""',
    'echo "═══════════════════════════════════════════════════════════"',
    'echo "✅ OrionClaw instalado!"',
    'echo "═══════════════════════════════════════════════════════════"',
    'echo ""',
    'echo "Comandos: openclaw tui | openclaw status"',
    'echo "🐺 Bem-vindo!"',
    '\'@',
    '',
    '$scriptPath = "$env:TEMP\\install.sh"',
    '$script | Out-File -FilePath $scriptPath -Encoding utf8',
    '$content = [System.IO.File]::ReadAllText($scriptPath) -replace "`r`n", "`n"',
    '[System.IO.File]::WriteAllText($scriptPath, $content)',
    'wsl bash -c "bash $(wsl wslpath -a $scriptPath)"',
    '',
    'Write-Host ""',
    'Write-Host "  ✅ Instalação concluída!" -ForegroundColor Green',
    'Write-Host ""',
    'Write-Host "  Para usar: wsl && openclaw tui" -ForegroundColor Gray',
    'Write-Host ""',
    'Write-Host "  🐺 Bem-vindo ao OrionClaw!" -ForegroundColor Cyan',
    'Read-Host "Pressione Enter para sair"'
  ].join('\n');
  
  return script;
}

// Generate Unix (macOS/Linux) script
function generateUnixScript(config) {
  const providers = config.providers;
  const channels = config.channels;
  const hasModal = providers.includes('modal');
  const hasOllama = providers.includes('ollama');
  
  // Build provider config JSON
  let providerJson = '';
  if (config.keys.modal) providerJson += '    "modal": { "apiKey": "' + config.keys.modal + '" },\n';
  if (config.keys.openrouter) providerJson += '    "openrouter": { "apiKey": "' + config.keys.openrouter + '" },\n';
  if (config.keys.google) providerJson += '    "google": { "apiKey": "' + config.keys.google + '" },\n';
  if (config.keys.opencode) providerJson += '    "opencode": { "apiKey": "' + config.keys.opencode + '" },\n';
  if (config.keys.kilo) providerJson += '    "kilocode": { "apiKey": "' + config.keys.kilo + '" },\n';
  if (config.keys.anthropic) providerJson += '    "anthropic": { "apiKey": "' + config.keys.anthropic + '" },\n';
  if (config.keys.openai) providerJson += '    "openai": { "apiKey": "' + config.keys.openai + '" },\n';
  if (hasOllama) providerJson += '    "ollama": { "baseUrl": "http://127.0.0.1:11434" },\n';
  providerJson = providerJson.replace(/,\n$/, '');
  
  // Build channel config JSON
  let channelJson = '';
  if (config.keys.telegram) channelJson += '    "telegram": { "token": "' + config.keys.telegram + '" },\n';
  if (config.keys.discord) channelJson += '    "discord": { "token": "' + config.keys.discord + '" },\n';
  channelJson = channelJson.replace(/,\n$/, '');
  
  // Default model
  let defaultModel = 'openrouter/meta-llama/llama-4-scout';
  if (hasModal) defaultModel = 'modal/zai-org/GLM-5-FP8';
  else if (config.keys.google) defaultModel = 'google/gemini-2.5-flash';
  
  const script = [
    '#!/bin/bash',
    '# OrionClaw One-Click Installer - Unix',
    '# Repository: https://github.com/Neguiolidas/OrionClaw',
    '',
    'set -e',
    '',
    '# Colors',
    'GREEN="\\033[0;32m"',
    'YELLOW="\\033[1;33m"',
    'CYAN="\\033[0;36m"',
    'NC="\\033[0m"',
    '',
    '# Config',
    'USER_NAME="' + config.userName + '"',
    'AGENT_NAME="' + config.agentName + '"',
    'AUTO_START=' + config.autoStart,
    '',
    'clear',
    'echo ""',
    'echo -e "${CYAN}🐺 OrionClaw One-Click Installer${NC}"',
    'echo "  ═══════════════════════════════════════════════════════════"',
    'echo ""',
    '',
    '# Detect OS',
    'if [[ "$OSTYPE" == "darwin"* ]]; then',
    '    OS="macos"',
    '    echo -e "${YELLOW}📦 macOS${NC}"',
    'elif [[ -f /etc/debian_version ]]; then',
    '    OS="debian"',
    '    echo -e "${YELLOW}📦 Debian/Ubuntu${NC}"',
    'elif [[ -f /etc/fedora-release ]]; then',
    '    OS="fedora"',
    '    echo -e "${YELLOW}📦 Fedora${NC}"',
    'else',
    '    OS="linux"',
    '    echo -e "${YELLOW}📦 Linux${NC}"',
    'fi',
    '',
    '# Dependencies',
    'echo ""',
    'echo -e "${YELLOW}📦 Instalando dependências...${NC}"',
    '',
    'if [[ "$OS" == "macos" ]]; then',
    '    if ! command -v brew &> /dev/null; then',
    '        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
    '    fi',
    '    brew install node git python3',
    'elif [[ "$OS" == "debian" ]]; then',
    '    sudo apt update -qq',
    '    sudo apt install -y curl git build-essential python3',
    '    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -',
    '    sudo apt install -y nodejs',
    'elif [[ "$OS" == "fedora" ]]; then',
    '    sudo dnf install -y nodejs git python3 gcc-c++ make',
    'fi',
    '',
    'echo -e "${GREEN}✅ Node.js $(node --version)${NC}"',
    '',
    '# OpenClaw',
    'echo ""',
    'echo -e "${YELLOW}📦 Instalando OpenClaw...${NC}"',
    'npm install -g openclaw',
    'echo -e "${GREEN}✅ OpenClaw instalado${NC}"',
    '',
    '# Workspace',
    'echo ""',
    'echo -e "${YELLOW}📁 Configurando workspace...${NC}"',
    'mkdir -p ~/OrionClaw/memory',
    'cd ~/OrionClaw',
    'openclaw setup --non-interactive 2>/dev/null || true',
    '',
    'cat > USER.md << EOF',
    '# USER.md',
    '- **Nome:** ' + config.userName,
    '- **Como chamar:** Senhor',
    'EOF',
    '',
    'cat > IDENTITY.md << EOF',
    '# IDENTITY.md',
    '- **Nome:** ' + config.agentName,
    '- **Criatura:** Assistente IA',
    '- **Personalidade:** ' + config.agentPersonality,
    'EOF',
    '',
    'cat > AGENTS.md << EOF',
    '# AGENTS.md',
    '## Memória',
    '- memory/YYYY-MM-DD.md',
    'EOF',
    '',
    'echo -e "${GREEN}✅ Workspace configurado${NC}"',
    '',
    hasOllama ? [
      '# Ollama',
      'echo ""',
      'echo -e "${YELLOW}🦙 Instalando Ollama...${NC}"',
      'curl -fsSL https://ollama.com/install.sh | sh',
      'ollama pull llama3 || true',
      'echo -e "${GREEN}✅ Ollama instalado${NC}"',
      ''
    ].join('\n') : '',
    '',
    hasModal ? [
      '# Modal Proxy',
      'echo ""',
      'echo -e "${YELLOW}🚀 Modal proxy...${NC}"',
      'mkdir -p ~/.openclaw/wrapper',
      'cat > ~/.openclaw/wrapper/modal-proxy.js << "PROXYEOF"',
      'const http=require("http"),https=require("https");',
      'const PORT=8765,TARGET="api.us-west-2.modal.direct",TIMEOUT=120000;',
      'http.createServer((req,res)=>{',
      '  if(req.url==="/health"){res.writeHead(200);res.end(JSON.stringify({status:"ok"}));return;}',
      '  let b="";req.on("data",c=>b+=c);req.on("end",()=>{',
      '    const pr=https.request({hostname:TARGET,port:443,path:req.url,method:req.method,headers:{...req.headers,host:TARGET},timeout:TIMEOUT},pr=>{res.writeHead(pr.statusCode,pr.headers);pr.pipe(res);});',
      '    pr.on("error",e=>{res.writeHead(502);res.end(JSON.stringify({error:e.message}));});',
      '    pr.on("timeout",()=>{pr.destroy();if(!res.headersSent){res.writeHead(504);res.end(JSON.stringify({error:"timeout"}));}});',
      '    if(b)pr.write(b);pr.end();',
      '  });',
      '}).listen(PORT,"127.0.0.1",()=>console.log("Modal proxy on "+PORT));',
      'PROXYEOF',
      'if [[ "$OS" == "macos" ]]; then',
      '    mkdir -p ~/Library/LaunchAgents',
      '    cat > ~/Library/LaunchAgents/com.orionclaw.modal-proxy.plist << "PLISTEOF"',
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
      '<plist version="1.0"><dict><key>Label</key><string>com.orionclaw.modal-proxy</string>',
      '<key>ProgramArguments</key><array><string>' + '$(which node)' + '</string><string>$HOME/.openclaw/wrapper/modal-proxy.js</string></array>',
      '<key>RunAtLoad</key><true/><key>KeepAlive</key><true/></dict></plist>',
      'PLISTEOF',
      '    launchctl load ~/Library/LaunchAgents/com.orionclaw.modal-proxy.plist 2>/dev/null || true',
      'else',
      '    mkdir -p ~/.config/systemd/user',
      '    cat > ~/.config/systemd/user/modal-proxy.service << "SVCEOF"',
      '[Unit]\nDescription=Modal GLM-5 Proxy\nAfter=network.target',
      '[Service]\nType=simple\nExecStart=/usr/bin/node $HOME/.openclaw/wrapper/modal-proxy.js\nRestart=always',
      '[Install]\nWantedBy=default.target',
      'SVCEOF',
      '    systemctl --user daemon-reload',
      '    systemctl --user enable modal-proxy',
      '    systemctl --user start modal-proxy',
      'fi',
      'echo -e "${GREEN}✅ Modal proxy configurado${NC}"',
      ''
    ].join('\n') : '',
    '',
    '# Config',
    'mkdir -p ~/.openclaw',
    'cat > ~/.openclaw/openclaw.json << EOF',
    '{',
    '  "providers": {',
    providerJson,
    '  },',
    '  "channels": {',
    channelJson,
    '  },',
    '  "agents": {',
    '    "defaults": {',
    '      "model": "' + defaultModel + '",',
    '      "compaction": { "mode": "safeguard", "reserveTokensFloor": 30000 }',
    '    }',
    '  }',
    '}',
    'EOF',
    'echo -e "${GREEN}✅ Configurado${NC}"',
    '',
    config.autoStart ? [
      '# Start',
      'echo ""',
      'echo -e "${YELLOW}🚀 Iniciando gateway...${NC}"',
      'openclaw gateway start',
      'echo -e "${GREEN}✅ Gateway iniciado${NC}"',
      ''
    ].join('\n') : '',
    '',
    'echo ""',
    'echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"',
    'echo -e "${GREEN}✅ OrionClaw instalado!${NC}"',
    'echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"',
    'echo ""',
    'echo "Comandos: openclaw tui | openclaw status"',
    hasTelegram && config.keys.telegram ? 'echo ""\necho -e "${CYAN}📱 Telegram configurado!${NC}"' : '',
    hasDiscord && config.keys.discord ? 'echo ""\necho -e "${CYAN}🎮 Discord configurado!${NC}"' : '',
    'echo ""',
    'echo -e "${CYAN}🐺 Bem-vindo ao OrionClaw!${NC}"'
  ].join('\n');
  
  return script;
}

// Copy command to clipboard
function copyCommand() {
  const command = document.getElementById('install-command').textContent;
  navigator.clipboard.writeText(command).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.innerHTML = '✅';
    setTimeout(() => {
      btn.innerHTML = '📋';
    }, 2000);
  });
}

// Make functions globally available
window.scrollToInstall = scrollToInstall;
window.setAgentCount = setAgentCount;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.downloadScript = downloadScript;
window.copyCommand = copyCommand;
