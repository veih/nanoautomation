// NanoAutomation - Sistema Automático Otimizado de Captura de Screenshots
// Versão melhorada com tratamento de erros e timeouts

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const dashboards = [
  {
    name: "Dashboard Principal",
    url: "http://localhost:3000/dashboard",
    filename: "dashboard-home.png"
  },
  {
    name: "Dashboard Corretiva",
    url: "http://localhost:3000/dashboard/dashboardCorretiva",
    filename: "dashboard-corretiva.png"
  },
  {
    name: "Dashboard Lojas",
    url: "http://localhost:3000/dashboard/dashboardLojas",
    filename: "dashboard-lojas.png"
  },
  {
    name: "Dashboard CMS",
    url: "http://localhost:3000/dashboard/dashboardCms",
    filename: "dashboard-cms.png"
  },
  {
    name: "Dashboard CVF",
    url: "http://localhost:3000/dashboard/dashboardCvf",
    filename: "dashboard-cvf.png"
  },
  {
    name: "Dashboard SDAI",
    url: "http://localhost:3000/dashboard/dashboardSdai",
    filename: "dashboard-sdai.png"
  },
  {
    name: "Dashboard SCP",
    url: "http://localhost:3000/dashboard/dashboardScp",
    filename: "dashboard-scp.png"
  },
  {
    name: "Dashboard Access Control",
    url: "http://localhost:3000/dashboard/dashboardAccessControl",
    filename: "dashboard-access-control.png"
  }
];

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function waitForNetworkIdle(page, timeout = 5000) {
  return new Promise(resolve => {
    let timeoutId;
    let requestCount = 0;
    
    const onRequestStarted = () => {
      requestCount++;
      clearTimeout(timeoutId);
    };
    
    const onRequestFinished = () => {
      requestCount--;
      if (requestCount === 0) {
        timeoutId = setTimeout(resolve, 1000);
      }
    };
    
    page.on('request', onRequestStarted);
    page.on('requestfinished', onRequestFinished);
    page.on('requestfailed', onRequestFinished);
    
    timeoutId = setTimeout(resolve, timeout);
  });
}

async function captureAllScreenshots() {
  console.log('🚀 NanoAutomation - Captura Automática Otimizada');
  console.log('='.repeat(55));
  
  // Verificar servidor
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('http://localhost:3000', { 
      signal: controller.signal,
      method: 'HEAD'
    });
    clearTimeout(timeoutId);
    
    console.log('✅ Servidor Next.js está acessível');
  } catch (error) {
    console.error('❌ ERRO: Servidor Next.js não está acessível!');
    console.log('Por favor, execute: npm run dev');
    return;
  }

  // Preparar diretório
  const imagesDir = path.join(__dirname, 'public', 'images');
  ensureDirectoryExists(imagesDir);

  // Configuração otimizada do Puppeteer
  console.log('\n🔧 Iniciando navegador...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  
  // Configurações da página
  await page.setViewport({ width: 1200, height: 800 });
  await page.setDefaultTimeout(30000);
  await page.setDefaultNavigationTimeout(30000);

  console.log('✅ Navegador pronto!\n');

  let successCount = 0;

  // Capturar cada dashboard com tratamento de erros
  for (let i = 0; i < dashboards.length; i++) {
    const dashboard = dashboards[i];
    const fullPath = path.join(imagesDir, dashboard.filename);
    
    console.log(`📸 ${i + 1}/${dashboards.length}: ${dashboard.name}`);
    
    try {
      // Navegar com múltiplas estratégias
      console.log(`   → Acessando: ${dashboard.url}`);
      
      // Tentativa 1: Navegação normal
      await page.goto(dashboard.url, { 
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 20000
      });
      
      // Esperar elementos carregarem
      await page.waitForTimeout(3000);
      
      // Verificar se a página carregou
      const title = await page.title();
      console.log(`   → Página carregada: ${title || 'Sem título'}`);
      
      // Capturar screenshot
      await page.screenshot({
        path: fullPath,
        fullPage: true,
        type: 'png',
        omitBackground: false
      });
      
      // Verificar se o arquivo foi criado
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`   ✅ Salvo (${(stats.size / 1024).toFixed(1)} KB)`);
        successCount++;
      } else {
        throw new Error('Arquivo não foi criado');
      }
      
    } catch (error) {
      console.log(`   ⚠️  Tentando novamente... (${error.message})`);
      
      try {
        // Tentativa 2: Com timeout menor
        await page.goto(dashboard.url, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        
        await page.waitForTimeout(2000);
        
        await page.screenshot({
          path: fullPath,
          fullPage: true,
          type: 'png'
        });
        
        if (fs.existsSync(fullPath)) {
          console.log(`   ✅ Salvo (tentativa 2)`);
          successCount++;
        }
        
      } catch (retryError) {
        console.log(`   ❌ Falhou: ${retryError.message}`);
        // Criar placeholder se falhar
        createPlaceholder(fullPath, dashboard.name);
      }
    }
    
    // Pausa entre capturas
    if (i < dashboards.length - 1) {
      await page.waitForTimeout(1500);
    }
  }

  // Finalizar
  await browser.close();
  
  console.log('\n' + '='.repeat(55));
  console.log(`🎉 PROCESSO CONCLUÍDO: ${successCount}/${dashboards.length} capturados`);
  console.log('='.repeat(55));
  
  // Listar resultados
  console.log('\n📁 Arquivos criados:');
  dashboards.forEach(dashboard => {
    const filePath = path.join(imagesDir, dashboard.filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${dashboard.filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.log(`❌ ${dashboard.filename} (não encontrado)`);
    }
  });
  
  console.log(`\n🔗 Acesso público: http://localhost:3000/images/`);
  console.log(`📂 Local: ${imagesDir}`);
}

function createPlaceholder(filePath, dashboardName) {
  // Esta função pode criar uma imagem placeholder simples
  // Por enquanto, vamos apenas registrar que falhou
  console.log(`   📝 Placeholder necessário para: ${dashboardName}`);
}

// Executar
captureAllScreenshots().catch(error => {
  console.error('❌ Erro crítico:', error);
});