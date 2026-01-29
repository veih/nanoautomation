// NanoAutomation - Sistema Completo de Captura de Screenshots
// Script automatizado que prepara tudo para você

const fs = require('fs');
const path = require('path');

// Configuração dos dashboards
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

// Função para criar estrutura de pastas
function createFolders() {
  const folders = ['public/images', 'screenshots'];
  
  folders.forEach(folder => {
    const fullPath = path.join(__dirname, folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✓ Pasta criada: ${folder}`);
    } else {
      console.log(`✓ Pasta já existe: ${folder}`);
    }
  });
}

// Função para gerar arquivo de instruções
function generateInstructions() {
  const instructions = `
# 📸 Instruções para Captura de Screenshots - NanoAutomation

## 🎯 Processo Automatizado

1. **Abra o Preview Browser** (botão na barra de ferramentas do Qoder)
2. **Navegue para cada URL** listada abaixo
3. **Capture o screenshot** usando Ctrl+Shift+P → "screenshot"
4. **Salve na pasta** \`public/images/\` com o nome exato especificado
5. **Repita para todos os 8 dashboards**

## 📋 Lista de Dashboards:

${dashboards.map((dashboard, index) => `
### ${index + 1}. ${dashboard.name}
- **URL**: \`${dashboard.url}\`
- **Arquivo**: \`${dashboard.filename}\`
- **Descrição**: ${dashboard.description}
`).join('')}

## 💡 Dicas Profissionais:

- Capture screenshots em resolução **1200x800** para consistência
- Use **dados de exemplo** em vez de informações reais
- Mantenha a **mesma janela/aba** para consistência visual
- Garanta que todas as páginas estejam **totalmente carregadas**

## ✅ Após Capturar Todas as Imagens:

- Elas estarão acessíveis via: \`http://localhost:3000/images/[nome-arquivo].png\`
- Aparecerão automaticamente no README.md
- Ficarão disponíveis publicamente no deploy

---

*tudo pronto para você começar!*
`;

  fs.writeFileSync(path.join(__dirname, 'INSTRUCOES_SCREENSHOTS.md'), instructions);
  console.log('✓ Arquivo de instruções criado: INSTRUCOES_SCREENSHOTS.md');
}

// Função para gerar HTML da galeria
function generateGalleryHTML() {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NanoAutomation - Dashboard Gallery</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            padding: 20px;
            margin: 0;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        header { text-align: center; margin-bottom: 30px; color: white; }
        h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .gallery { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
            gap: 20px; 
        }
        .card { 
            background: white; 
            border-radius: 12px; 
            padding: 20px; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .card h3 { color: #4facfe; margin-top: 0; }
        .url { 
            background: #f1f3f4; 
            padding: 10px; 
            border-radius: 6px; 
            font-family: monospace; 
            margin: 10px 0;
        }
        .filename { 
            background: #e3f2fd; 
            padding: 8px 12px; 
            border-radius: 20px; 
            font-weight: bold; 
            color: #1976d2;
        }
        .status { 
            margin-top: 15px; 
            padding: 10px; 
            border-radius: 6px;
        }
        .pending { background: #fff8e1; color: #ff9800; }
        .completed { background: #e8f5e8; color: #4caf50; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🖼️ NanoAutomation Dashboard Gallery</h1>
            <p style="opacity: 0.9;">Sistema automatizado de captura de screenshots</p>
        </header>
        
        <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #4facfe;">📋 Instruções Rápidas</h2>
            <ol>
                <li>Abra o <strong>Preview Browser</strong> (botão na barra de ferramentas)</li>
                <li>Copie cada URL abaixo e cole na barra de endereços</li>
                <li>Capture o screenshot (Ctrl+Shift+P → "screenshot")</li>
                <li>Salve na pasta <code>public/images/</code> com o nome especificado</li>
            </ol>
        </div>

        <div class="gallery">
            ${dashboards.map(dashboard => `
                <div class="card">
                    <h3>${dashboard.name}</h3>
                    <p>${dashboard.description}</p>
                    <div class="url">${dashboard.url}</div>
                    <div class="filename">${dashboard.filename}</div>
                    <div class="status pending">🟡 Pendente</div>
                </div>
            `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: white;">
            <p>✅ Após capturar todos os screenshots, eles aparecerão automaticamente no README.md</p>
        </div>
    </div>
</body>
</html>
`;

  fs.writeFileSync(path.join(__dirname, 'screenshots', 'dashboard-gallery.html'), html);
  console.log('✓ Galeria HTML criada: screenshots/dashboard-gallery.html');
}

// Função principal
function main() {
  console.log('🚀 NanoAutomation - Sistema de Captura de Screenshots');
  console.log('='.repeat(50));
  
  // Criar pastas
  console.log('\n📁 Criando estrutura de pastas...');
  createFolders();
  
  // Gerar instruções
  console.log('\n📝 Gerando instruções...');
  generateInstructions();
  
  // Gerar galeria HTML
  console.log('\n🎨 Gerando galeria visual...');
  generateGalleryHTML();
  
  // Mostrar resumo
  console.log('\n✅ TUDO PRONTO PARA VOCÊ!');
  console.log('='.repeat(50));
  console.log('\n📁 Pastas criadas:');
  console.log('   • public/images/ (para salvar os screenshots)');
  console.log('   • screenshots/ (para a galeria HTML)');
  
  console.log('\n📄 Arquivos gerados:');
  console.log('   • INSTRUCOES_SCREENSHOTS.md (instruções detalhadas)');
  console.log('   • screenshots/dashboard-gallery.html (galeria visual)');
  
  console.log('\n🎯 Próximos passos:');
  console.log('   1. Execute: node screenshot-navigation-public.js');
  console.log('   2. Ou abra: screenshots/dashboard-gallery.html');
  console.log('   3. Comece a capturar os screenshots!');
  
  console.log('\n💡 Dica: Todas as imagens devem ser salvas em: public/images/');
}

// Executar tudo
main();