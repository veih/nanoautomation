// app/data/sidebarItems.ts
export const sidebarItems = {
  // Menu principal de navegação entre dashboards
  main: [
    { href: "/", label: "Home", icon: "bi bi-house-door" },
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/corretivas", label: "Corretivas", icon: "bi bi-alt" },
    { href: "/dashboard/dashboardLojas", label: "Lojas", icon: "bi bi-shop" },
    { href: "/dashboard/dashboardCms", label: "CMs", icon: "bi bi-gear" },
    { href: "/dashboard/dashboardSdai", label: "SDAI", icon: "bi bi-broadcast" },
    { href: "/dashboard/dashboardScp", label: "SCP", icon: "bi bi-rocket-takeoff" },
  ],
  // Sub-menus para cada dashboard
  '/dashboard/dashboardCms': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cms", label: "CMs", icon: "bi bi-gear" },
    { href: "/pages/cms/maquinas", label: "Máquinas", icon: "bi bi-tools" },
    { href: "/pages/cms/atuadores", label: "Atuadores", icon: "bi bi-lightning" },
    { href: "/pages/cms/sensores", label: "Sensores", icon: "bi bi-hdd-stack" },
  ],

  // Sub-menus para cada item da cm
  '/pages/cms': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cms", label: "CMs", icon: "bi bi-gear" },
    { href: "/pages/cms/maquinas", label: "Máquinas", icon: "bi bi-tools" },
    { href: "/pages/cms/atuadores", label: "Atuadores", icon: "bi bi-lightning" },
    { href: "/pages/cms/sensores", label: "Sensores", icon: "bi bi-hdd-stack" },
  ],
  '/pages/cms/maquinas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cms", label: "CMs", icon: "bi bi-gear" },
    { href: "/pages/cms/maquinas", label: "Máquinas", icon: "bi bi-tools" },
    { href: "/pages/cms/atuadores", label: "Atuadores", icon: "bi bi-lightning" },
    { href: "/pages/cms/sensores", label: "Sensores", icon: "bi bi-hdd-stack" },
  ],
  '/pages/cms/atuadores': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cms", label: "CMs", icon: "bi bi-gear" },
    { href: "/pages/cms/maquinas", label: "Máquinas", icon: "bi bi-tools" },
    { href: "/pages/cms/atuadores", label: "Atuadores", icon: "bi bi-lightning" },
    { href: "/pages/cms/sensores", label: "Sensores", icon: "bi bi-hdd-stack" },
  ],
  '/pages/cms/sensores': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cms", label: "CMs", icon: "bi bi-gear" },
    { href: "/pages/cms/maquinas", label: "Máquinas", icon: "bi bi-tools" },
    { href: "/pages/cms/atuadores", label: "Atuadores", icon: "bi bi-lightning" },
    { href: "/pages/cms/sensores", label: "Sensores", icon: "bi bi-hdd-stack" },
  ],

  //Sub-menus para cada item da loja
  '/dashboard/dashboardLojas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack" },
  ],
  '/pages/lojas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack" },
  ],
  '/pages/lojas/componentes-loja': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack" },
  ],
  '/pages/lojas/atuadores-loja': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack" },
  ],
  '/pages/lojas/sensores-loja': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack" },
  ],
  // Sub-menus para SDAI (Sistema de Detecção e Alarme de Incêndio)
  '/dashboard/dashboardSdai': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/sdai", label: "SDAI", icon: "bi bi-broadcast" },
    { href: "/pages/sdai/zonas", label: "Zonas", icon: "bi bi-geo-alt" },
    { href: "/pages/sdai/alarmes", label: "Alarmes", icon: "bi bi-bell" },
    { href: "/pages/sdai/central", label: "Central", icon: "bi bi-display" },
  ],
  // Sub-menus para SCP (Sistema de Proteção contra Descargas Atmosféricas)
  '/dashboard/dashboardScp': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/scp", label: "SCP", icon: "bi bi-rocket-takeoff" },
    { href: "/pages/scp/relatorios", label: "Relatórios", icon: "bi bi-file-earmark-bar-graph" },
    { href: "/pages/scp/sistemas", label: "Sistemas", icon: "bi bi-lightning" },
    { href: "/pages/scp/pontos", label: "Pontos", icon: "bi bi-pin-map" },
  ],

  // Corretivas
  '/pages/corretivas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/corretivas", label: "Corretivas", icon: "bi bi-alt" },
    { href: "/pages/corretivas/corretiva-em-espera", label: "Registrar Em Espera", icon: "bi bi-file-earmark-plus" },
    { href: "/pages/corretivas/corretiva-em-andamento", label: "Em Andamento", icon: "bi bi-arrow-repeat" },
    { href: "/pages/corretivas/corretiva-concluido", label: "Concluído", icon: "bi bi-check-circle" },
  ],

  '/pages/corretivas/corretiva-em-espera': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/corretivas", label: "Corretivas", icon: "bi bi-alt" },
    { href: "/pages/corretivas/corretiva-em-espera", label: "Registrar Em Espera", icon: "bi bi-file-earmark-plus" },
    { href: "/pages/corretivas/corretiva-em-andamento", label: "Em Andamento", icon: "bi bi-arrow-repeat" },
    { href: "/pages/corretivas/corretiva-concluido", label: "Concluído", icon: "bi bi-check-circle" },
  ],

  '/pages/corretivas/corretiva-em-andamento': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/corretivas", label: "Corretivas", icon: "bi bi-alt" },
    { href: "/pages/corretivas/corretiva-em-espera", label: "Registrar Em Espera", icon: "bi bi-file-earmark-plus" },
    { href: "/pages/corretivas/corretiva-em-andamento", label: "Em Andamento", icon: "bi bi-arrow-repeat" },
    { href: "/pages/corretivas/corretiva-concluido", label: "Concluído", icon: "bi bi-check-circle" },
  ],

  '/pages/corretivas/corretiva-concluido': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/corretivas", label: "Corretivas", icon: "bi bi-alt" },
    { href: "/pages/corretivas/corretiva-em-espera", label: "Registrar Em Espera", icon: "bi bi-file-earmark-plus" },
    { href: "/pages/corretivas/corretiva-em-andamento", label: "Em Andamento", icon: "bi bi-arrow-repeat" },
    { href: "/pages/corretivas/corretiva-concluido", label: "Concluído", icon: "bi bi-check-circle" },
  ],
};