// NanoAutomation - Sistema Automático de Captura de Screenshots com Puppeteer
// Este script captura automaticamente todos os dashboards do projeto

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuração dos dashboards para captura automática
const dashboards = [
  {
    name: "Dashboard Principal",
    url: "http://localhost:3000/dashboard",
    filename: "dashboard-home.png",
    description: "Interface inicial do sistema com acesso rápido aos principais módulos"
  },
  {
    name: "Dashboard Corretiva",
    url: "http://localhost:3000/dashboard/dashboardCorretiva",
    filename: "dashboard-corretiva.png",
    description: "Sistema de gestão de manutenção corretiva com acompanhamento de ações"
  },
  {
    name: "Dashboard Lojas",
    url: "http://localhost:3000/dashboard/dashboardLojas",
    filename: "dashboard-lojas.png",
    description: "Gestão completa de lojas com monitoramento de equipamentos e defeitos"
  },
  {
    name: "Dashboard CMS",
    url: "http://localhost:3000/dashboard/dashboardCms",
    filename: "dashboard-cms.png",
    description: "Monitoramento centralizado de centros de manutenção e seus equipamentos"
  },
  {
    name: "Dashboard CVF",
    url: "http://localhost:3000/dashboard/dashboardCvf",
    filename: "dashboard-cvf.png",
    description: "Acompanhamento de sistemas de controle de vazamento de fluidos"
  },
  {
    name: "Dashboard SDAI",
    url: "http://localhost:3000/dashboard/dashboardSdai",
    filename: "dashboard-sdai.png",
    description: "Sistema de detecção e alarme de incêndio com monitoramento em tempo real"
  },
  {
    name: "Dashboard SCP",
    url: "http://localhost:3000/dashboard/dashboardScp",
    filename: "dashboard-scp.png",
    description: "Proteção contra descargas atmosféricas e monitoramento de SPDA"
  },
  {
    name: "Dashboard Access Control",
    url: "http://localhost:3000/dashboard/dashboardAccessControl",
    filename: "dashboard-access-control.png",
    description: "Sistema de controle de acesso com gestão de dispositivos de segurança"
  }
];

// Função para garantir que a pasta existe
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Pasta criada: ${dirPath}`);
  }
}

// Função principal de captura
async function captureAllScreenshots() {
  console.log('🚀 NanoAutomation - Captura Automática de Screenshots');
  console.log('='.repeat(60));
  
  // Verificar se o servidor está rodando
  try {
    const response = await fetch('http://localhost:3000/api/placeholder');
    if (!response.ok) {
      throw new Error('Servidor não responde corretamente');
    }
    console.log('✅ Servidor Next.js está rodando em http://localhost:3000');
  } catch (error) {
    console.error('❌ ERRO: Servidor Next.js não está rodando!');
    console.log('Por favor, execute: npm run dev');
    process.exit(1);
  }

  // Criar pasta para screenshots
  const imagesDir = path.join(__dirname, 'public', 'images');
  ensureDirectoryExists(imagesDir);

  // Iniciar Puppeteer
  console.log('\n🔧 Iniciando navegador automatizado...');
  const browser = await puppeteer.launch({
    headless: false, // Mostrar o navegador para você ver o processo
    defaultViewport: { width: 1200, height: 800 },
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  // Configurar timeout e espera por rede
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);

  console.log('✅ Navegador iniciado com sucesso!\n');

  // Capturar cada dashboard
  for (let i = 0; i < dashboards.length; i++) {
    const dashboard = dashboards[i];
    const fullPath = path.join(imagesDir, dashboard.filename);
    
    try {
      console.log(`📸 Capturando ${i + 1}/${dashboards.length}: ${dashboard.name}`);
      console.log(`   URL: ${dashboard.url}`);
      
      // Navegar para a página
      await page.goto(dashboard.url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Esperar carregar completamente
      await page.waitForTimeout(2000);
      
      // Capturar screenshot
      await page.screenshot({
        path: fullPath,
        fullPage: true,
        type: 'png'
      });
      
      console.log(`   ✅ Salvo em: ${fullPath}`);
      
      // Pequena pausa entre capturas
      if (i < dashboards.length - 1) {
        await page.waitForTimeout(1000);
      }
      
    } catch (error) {
      console.error(`   ❌ Erro ao capturar ${dashboard.name}:`, error.message);
      // Continuar com os próximos dashboards
    }
  }

  // Fechar navegador
  await browser.close();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 CAPTURA AUTOMÁTICA CONCLUÍDA!');
  console.log('='.repeat(60));
  
  // Verificar resultados
  console.log('\n📊 Resultados:');
  let capturedCount = 0;
  
  dashboards.forEach(dashboard => {
    const filePath = path.join(imagesDir, dashboard.filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${dashboard.filename} - ${(stats.size / 1024).toFixed(1)} KB`);
      capturedCount++;
    } else {
      console.log(`❌ ${dashboard.filename} - Não encontrado`);
    }
  });
  
  console.log(`\n✅ Total capturado: ${capturedCount}/${dashboards.length} dashboards`);
  
  if (capturedCount === dashboards.length) {
    console.log('\n🎊 Todos os screenshots foram capturados com sucesso!');
    console.log('As imagens estão disponíveis em: http://localhost:3000/images/');
    console.log('O README.md será atualizado automaticamente.');
  } else {
    console.log(`\n⚠️  ${dashboards.length - capturedCount} dashboard(s) não foram capturados.`);
    console.log('Verifique as mensagens de erro acima.');
  }
}

// Função para captura individual (caso queira apenas um dashboard)
async function captureSingleDashboard(dashboardName) {
  const dashboard = dashboards.find(d => d.name.toLowerCase().includes(dashboardName.toLowerCase()));
  
  if (!dashboard) {
    console.error(`❌ Dashboard "${dashboardName}" não encontrado.`);
    console.log('Dashboards disponíveis:');
    dashboards.forEach(d => console.log(`  - ${d.name}`));
    return;
  }
  
  console.log(`📸 Capturando apenas: ${dashboard.name}`);
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto(dashboard.url, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    const fullPath = path.join(__dirname, 'public', 'images', dashboard.filename);
    await page.screenshot({ path: fullPath, fullPage: true });
    
    console.log(`✅ Salvo em: ${fullPath}`);
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Tratamento de argumentos da linha de comando
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Captura automática de todos os dashboards
    await captureAllScreenshots();
  } else if (args[0] === '--single' && args[1]) {
    // Captura de dashboard específico
    await captureSingleDashboard(args[1]);
  } else if (args[0] === '--list') {
    // Listar todos os dashboards disponíveis
    console.log('📋 Dashboards disponíveis para captura:');
    dashboards.forEach((dashboard, index) => {
      console.log(`${index + 1}. ${dashboard.name}`);
      console.log(`   URL: ${dashboard.url}`);
      console.log(`   Arquivo: ${dashboard.filename}\n`);
    });
  } else {
    console.log('🤖 NanoAutomation - Sistema Automático de Screenshots');
    console.log('\nUso:');
    console.log('  node automate-screenshots.js              # Captura todos os dashboards');
    console.log('  node automate-screenshots.js --list       # Lista todos os dashboards');
    console.log('  node automate-screenshots.js --single "Nome do Dashboard"  # Captura específico');
    console.log('\nExemplos:');
    console.log('  node automate-screenshots.js');
    console.log('  node automate-screenshots.js --single "Dashboard Principal"');
  }
}

// Executar
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});