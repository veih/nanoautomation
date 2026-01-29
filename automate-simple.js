// NanoAutomation - Sistema de Captura Automática Compatível
// Adaptado para a versão atual do Puppeteer

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureAllScreenshots() {
  console.log('🚀 NanoAutomation - Captura Automática');
  console.log('='.repeat(45));
  
  // Verificar servidor
  try {
    const response = await fetch('http://localhost:3000');
    console.log('✅ Servidor acessível');
  } catch (error) {
    console.error('❌ Servidor não acessível!');
    return;
  }

  // Preparar diretório
  const imagesDir = path.join(__dirname, 'public', 'images');
  ensureDirectoryExists(imagesDir);

  // Iniciar Puppeteer
  console.log('\n🔧 Iniciando navegador...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  console.log('✅ Navegador pronto!\n');

  let successCount = 0;

  // Capturar cada dashboard
  for (let i = 0; i < dashboards.length; i++) {
    const dashboard = dashboards[i];
    const fullPath = path.join(imagesDir, dashboard.filename);
    
    console.log(`📸 ${i + 1}/${dashboards.length}: ${dashboard.name}`);
    
    try {
      console.log(`   → ${dashboard.url}`);
      
      // Navegar para a página
      await page.goto(dashboard.url, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Esperar carregar
      await sleep(3000);
      
      // Capturar screenshot
      await page.screenshot({
        path: fullPath,
        fullPage: true,
        type: 'png'
      });
      
      // Verificar se salvou
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`   ✅ ${(stats.size / 1024).toFixed(1)} KB`);
        successCount++;
      }
      
    } catch (error) {
      console.log(`   ⚠️  Tentando novamente...`);
      
      try {
        // Tentativa 2
        await page.goto(dashboard.url, { 
          waitUntil: 'domcontentloaded',
          timeout: 20000
        });
        
        await sleep(2000);
        
        await page.screenshot({
          path: fullPath,
          fullPage: true
        });
        
        if (fs.existsSync(fullPath)) {
          console.log(`   ✅ Salvo (tentativa 2)`);
          successCount++;
        }
        
      } catch (retryError) {
        console.log(`   ❌ ${retryError.message}`);
      }
    }
    
    // Pausa
    if (i < dashboards.length - 1) {
      await sleep(1500);
    }
  }

  // Finalizar
  await browser.close();
  
  console.log('\n' + '='.repeat(45));
  console.log(`🎉 CONCLUÍDO: ${successCount}/${dashboards.length} capturados`);
  console.log('='.repeat(45));
  
  // Mostrar resultados
  console.log('\n📁 Arquivos criados:');
  fs.readdirSync(imagesDir).forEach(file => {
    if (file.endsWith('.png')) {
      const stats = fs.statSync(path.join(imagesDir, file));
      console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    }
  });
  
  console.log(`\n🔗 Acesso: http://localhost:3000/images/`);
}

// Executar
captureAllScreenshots().catch(console.error);