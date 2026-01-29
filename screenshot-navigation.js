// Script de Navegação Automática para Captura de Screenshots
// NanoAutomation Dashboard Navigator

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

console.log("🚀 NanoAutomation - Navegador de Dashboards para Screenshots");
console.log("=" .repeat(60));

console.log("\n📋 Lista de Dashboards para Capturar:");
dashboards.forEach((dashboard, index) => {
  console.log(`${index + 1}. ${dashboard.name}`);
  console.log(`   URL: ${dashboard.url}`);
  console.log(`   Arquivo: ${dashboard.filename}`);
  console.log(`   Descrição: ${dashboard.description}\n`);
});

console.log("🔧 Instruções para Captura:");
console.log("1. Abra o Preview Browser (botão na barra de ferramentas)");
console.log("2. Cole cada URL abaixo na barra de endereços do navegador");
console.log("3. Capture o screenshot da página completa");
console.log("4. Salve na pasta 'screenshots/' com o nome especificado");
console.log("5. Repita para todos os dashboards\n");

console.log("🎯 URLs Diretas para Navegação:");
console.log("-".repeat(40));
dashboards.forEach((dashboard, index) => {
  console.log(`${index + 1}. ${dashboard.url}`);
});

console.log("\n📸 Nomes dos Arquivos para Salvar:");
console.log("-".repeat(40));
dashboards.forEach(dashboard => {
  console.log(`• ${dashboard.filename}`);
});

console.log("\n✅ Processo Concluído!");
console.log("Depois de capturar todos os screenshots, atualize o README.md");
console.log("As imagens aparecerão automaticamente nos lugares corretos.");

// Função auxiliar para gerar HTML de preview (opcional)
function generatePreviewHTML() {
  let html = `
<!DOCTYPE html>
<html>
<head>
    <title>NanoAutomation - Dashboard Gallery</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .dashboard-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
        .dashboard-card h3 { color: #333; margin-top: 0; }
        .dashboard-card img { max-width: 100%; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>🖼️ NanoAutomation Dashboard Gallery</h1>
    <div class="gallery">
`;

  dashboards.forEach(dashboard => {
    html += `
        <div class="dashboard-card">
            <h3>${dashboard.name}</h3>
            <p>${dashboard.description}</p>
            <img src="../screenshots/${dashboard.filename}" alt="${dashboard.name}" onerror="this.src='placeholder.png'">
            <p><strong>Arquivo:</strong> ${dashboard.filename}</p>
        </div>
    `;
  });

  html += `
    </div>
</body>
</html>
`;
  
  return html;
}

console.log("\n💡 Dica Profissional:");
console.log("- Use Ctrl+Shift+P no Chrome e busque por 'screenshot'");
console.log("- Capture screenshots em resolução 1200x800 para consistência");
console.log("- Use dados de exemplo (demo data) em vez de informações reais");
console.log("- Mantenha a mesma janela/aba para consistência visual");