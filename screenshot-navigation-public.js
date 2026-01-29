// Script de Navegação Automática para Captura de Screenshots
// NanoAutomation Dashboard Navigator - Versão Public/Images

const dashboards = [
  {
    name: "Dashboard Principal",
    url: "http://localhost:3000/dashboard",
    filename: "dashboard-home.png",
    filepath: "/public/images/dashboard-home.png",
    publicUrl: "/images/dashboard-home.png",
    description: "Interface inicial do sistema com acesso rápido aos principais módulos"
  },
  {
    name: "Dashboard Corretiva",
    url: "http://localhost:3000/dashboard/dashboardCorretiva",
    filename: "dashboard-corretiva.png",
    filepath: "/public/images/dashboard-corretiva.png",
    publicUrl: "/images/dashboard-corretiva.png",
    description: "Sistema de gestão de manutenção corretiva com acompanhamento de ações"
  },
  {
    name: "Dashboard Lojas",
    url: "http://localhost:3000/dashboard/dashboardLojas",
    filename: "dashboard-lojas.png",
    filepath: "/public/images/dashboard-lojas.png",
    publicUrl: "/images/dashboard-lojas.png",
    description: "Gestão completa de lojas com monitoramento de equipamentos e defeitos"
  },
  {
    name: "Dashboard CMS",
    url: "http://localhost:3000/dashboard/dashboardCms",
    filename: "dashboard-cms.png",
    filepath: "/public/images/dashboard-cms.png",
    publicUrl: "/images/dashboard-cms.png",
    description: "Monitoramento centralizado de centros de manutenção e seus equipamentos"
  },
  {
    name: "Dashboard CVF",
    url: "http://localhost:3000/dashboard/dashboardCvf",
    filename: "dashboard-cvf.png",
    filepath: "/public/images/dashboard-cvf.png",
    publicUrl: "/images/dashboard-cvf.png",
    description: "Acompanhamento de sistemas de controle de vazamento de fluidos"
  },
  {
    name: "Dashboard SDAI",
    url: "http://localhost:3000/dashboard/dashboardSdai",
    filename: "dashboard-sdai.png",
    filepath: "/public/images/dashboard-sdai.png",
    publicUrl: "/images/dashboard-sdai.png",
    description: "Sistema de detecção e alarme de incêndio com monitoramento em tempo real"
  },
  {
    name: "Dashboard SCP",
    url: "http://localhost:3000/dashboard/dashboardScp",
    filename: "dashboard-scp.png",
    filepath: "/public/images/dashboard-scp.png",
    publicUrl: "/images/dashboard-scp.png",
    description: "Proteção contra descargas atmosféricas e monitoramento de SPDA"
  },
  {
    name: "Dashboard Access Control",
    url: "http://localhost:3000/dashboard/dashboardAccessControl",
    filename: "dashboard-access-control.png",
    filepath: "/public/images/dashboard-access-control.png",
    publicUrl: "/images/dashboard-access-control.png",
    description: "Sistema de controle de acesso com gestão de dispositivos de segurança"
  }
];

console.log("🚀 NanoAutomation - Navegador de Dashboards para Screenshots");
console.log("=" .repeat(60));
console.log("📁 Local de armazenamento: /public/images/");
console.log("🌐 Acesso público: http://localhost:3000/images/[nome-arquivo].png\n");

console.log("📋 Lista de Dashboards para Capturar:");
dashboards.forEach((dashboard, index) => {
  console.log(`${index + 1}. ${dashboard.name}`);
  console.log(`   URL: ${dashboard.url}`);
  console.log(`   Arquivo: ${dashboard.filename}`);
  console.log(`   Caminho: ${dashboard.filepath}`);
  console.log(`   URL Pública: http://localhost:3000${dashboard.publicUrl}`);
  console.log(`   Descrição: ${dashboard.description}\n`);
});

console.log("🔧 Instruções para Captura:");
console.log("1. Abra o Preview Browser (botão na barra de ferramentas)");
console.log("2. Cole cada URL abaixo na barra de endereços do navegador");
console.log("3. Capture o screenshot da página completa");
console.log("4. Salve na pasta 'public/images/' com o nome especificado");
console.log("5. Repita para todos os dashboards\n");

console.log("🎯 URLs Diretas para Navegação:");
console.log("-".repeat(40));
dashboards.forEach((dashboard, index) => {
  console.log(`${index + 1}. ${dashboard.url}`);
});

console.log("\n📁 Caminhos dos Arquivos para Salvar:");
console.log("-".repeat(40));
dashboards.forEach(dashboard => {
  console.log(`• ${dashboard.filepath}`);
});

console.log("\n🌐 URLs Públicas após salvamento:");
console.log("-".repeat(40));
dashboards.forEach(dashboard => {
  console.log(`• http://localhost:3000${dashboard.publicUrl}`);
});

console.log("\n✅ Processo Concluído!");
console.log("Depois de capturar todos os screenshots:");
console.log("- Eles estarão acessíveis via http://localhost:3000/images/[nome]");
console.log("- Podem ser usados diretamente no README.md");
console.log("- Ficarão disponíveis publicamente no deploy");

console.log("\n💡 Dica Profissional:");
console.log("- Use Ctrl+Shift+P no Chrome e busque por 'screenshot'");
console.log("- Capture screenshots em resolução 1200x800 para consistência");
console.log("- Use dados de exemplo (demo data) em vez de informações reais");
console.log("- Mantenha a mesma janela/aba para consistência visual");
console.log("- As imagens ficarão disponíveis publicamente via /images/");