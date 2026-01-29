// app/data/sidebarItems.ts
export const sidebarItems = {
  // Menu principal de navegação entre dashboards
  main: [
    { href: "/", label: "Home", icon: "bi bi-house-door" },
    {
      href: "/dashboard",
      label: "Nanoautomation",
      icon: "bi bi-house-door",
      description: "Dashboard principal"
    },
    {
      href: "/dashboard/dashboardCorretiva",
      label: "Corretiva",
      icon: "bi bi-alt",
      description: "Manutenção corretiva"
    },
    {
      href: "/dashboard/dashboardLojas",
      label: "Lojas",
      icon: "bi bi-shop",
      description: "Gestão de lojas"
    },
    {
      href: "/dashboard/dashboardCms",
      label: "CMs",
      icon: "bi bi-gear",
      description: "Centros de manutenção"
    },
    {
      href: "/dashboard/dashboardCvf",
      label: "CVF",
      icon: "bi bi-building",
      description: "Controle de vazamento de fluidos"
    },
    {
      href: "/dashboard/dashboardSdai",
      label: "SDAI",
      icon: "bi bi-broadcast",
      description: "Sistema de detecção e alarme de incêndio"
    },
    {
      href: "/dashboard/dashboardScp",
      label: "SCP",
      icon: "bi bi-rocket-takeoff",
      description: "Sistema de proteção contra descargas atmosféricas"
    },
    {
      href: "/dashboard/dashboardAccessControl",
      label: "Controle de Acesso",
      icon: "bi bi-shield-lock",
      description: "Gestão de acesso"
    },
    {
      href: "/pages/ocorrencias",
      label: "Ocorrências",
      icon: "bi bi-mic",
      description: "Registro de ocorrências e soluções"
    },
    {
      href: "/pages/test-api",
      label: "Teste API",
      icon: "bi bi-bug",
      description: "Teste de APIs"
    },
    {
      href: "/pages/defeitos",
      label: "Todos os Defeitos",
      icon: "bi bi-exclamation-diamond",
      description: "Visão geral de todos os dispositivos com defeito"
    },
    {
      href: "/pages/data-export",
      label: "Exportar Dados",
      icon: "bi bi-download",
      description: "Exportar dados do sistema"
    },
    {
      href: "/pages/data-import",
      label: "Importar Dados",
      icon: "bi bi-upload",
      description: "Importar dados para o sistema"
    },
    {
      href: "/pages/sync-cloudinary",
      label: "Sincronizar Cloudinary",
      icon: "bi bi-arrow-repeat",
      description: "Sincronizar imagens com Cloudinary"
    },
    {
      href: "/pages/preventivas/executar",
      label: "Executar Preventiva",
      icon: "bi bi-play-circle",
      description: "Interface unificada para execução de preventivas"
    },
    {
      href: "/pages/preventivas/lojas",
      label: "Preventivas Lojas",
      icon: "bi bi-calendar-check",
      description: "Manutenção preventiva nas lojas"
    },
  ],

  // Sub-menus para cada dashboard
  '/dashboard/dashboardCms': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cms", label: "CMs", icon: "bi bi-gear", description: "Centros de manutenção" },
    { href: "/pages/cms/maquinas", label: "Máquinas", icon: "bi bi-tools", description: "Gestão de máquinas" },
    { href: "/pages/cms/atuadores", label: "Atuadores", icon: "bi bi-lightning", description: "Controle de atuadores" },
    { href: "/pages/cms/sensores", label: "Sensores", icon: "bi bi-hdd-stack", description: "Monitoramento de sensores" },
  ],

  // Sub-menus para cada item da cm
  '/pages/cms': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cms", label: "CMs", icon: "bi bi-gear", description: "Centros de manutenção" },
    { href: "/pages/cms/maquinas", label: "Máquinas", icon: "bi bi-tools", description: "Gestão de máquinas" },
    { href: "/pages/cms/atuadores", label: "Atuadores", icon: "bi bi-lightning", description: "Controle de atuadores" },
    { href: "/pages/cms/sensores", label: "Sensores", icon: "bi bi-hdd-stack", description: "Monitoramento de sensores" },
  ],
  '/pages/cms/maquinas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cms", label: "CMs", icon: "bi bi-gear", description: "Centros de manutenção" },
    { href: "/pages/cms/maquinas", label: "Máquinas", icon: "bi bi-tools", description: "Gestão de máquinas" },
    { href: "/pages/cms/atuadores", label: "Atuadores", icon: "bi bi-lightning", description: "Controle de atuadores" },
    { href: "/pages/cms/sensores", label: "Sensores", icon: "bi bi-hdd-stack", description: "Monitoramento de sensores" },
  ],
  '/pages/cms/atuadores': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cms", label: "CMs", icon: "bi bi-gear", description: "Centros de manutenção" },
    { href: "/pages/cms/maquinas", label: "Máquinas", icon: "bi bi-tools", description: "Gestão de máquinas" },
    { href: "/pages/cms/atuadores", label: "Atuadores", icon: "bi bi-lightning", description: "Controle de atuadores" },
    { href: "/pages/cms/sensores", label: "Sensores", icon: "bi bi-hdd-stack", description: "Monitoramento de sensores" },
  ],
  '/pages/cms/sensores': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cms", label: "CMs", icon: "bi bi-gear", description: "Centros de manutenção" },
    { href: "/pages/cms/maquinas", label: "Máquinas", icon: "bi bi-tools", description: "Gestão de máquinas" },
    { href: "/pages/cms/atuadores", label: "Atuadores", icon: "bi bi-lightning", description: "Controle de atuadores" },
    { href: "/pages/cms/sensores", label: "Sensores", icon: "bi bi-hdd-stack", description: "Monitoramento de sensores" },
  ],

  // Sub-menus para cada item da loja
  '/dashboard/dashboardLojas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop", description: "Gestão de lojas" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks", description: "Componentes das lojas" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning", description: "Atuadores das lojas" },
    { href: "/pages/lojas/atuadores-loja/atuadores-loja-defeito", label: "Atuadores com Defeito", icon: "bi bi-exclamation-triangle", description: "Atuadores com problemas" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack", description: "Sensores das lojas" },
    { href: "/pages/lojas/sensores-loja/sensores-loja-defeito", label: "Sensores com Defeito", icon: "bi bi-exclamation-triangle", description: "Sensores com problemas" },
    { href: "/pages/lojas/deteccao-loja", label: "Detecção de Incêndio", icon: "bi bi-fire", description: "Sistemas de detecção de incêndio" },
  ],
  '/pages/lojas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop", description: "Gestão de lojas" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks", description: "Componentes das lojas" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning", description: "Atuadores das lojas" },
    { href: "/pages/lojas/atuadores-loja/atuadores-loja-defeito", label: "Atuadores com Defeito", icon: "bi bi-exclamation-triangle", description: "Atuadores com problemas" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack", description: "Sensores das lojas" },
    { href: "/pages/lojas/sensores-loja/sensores-loja-defeito", label: "Sensores com Defeito", icon: "bi bi-exclamation-triangle", description: "Sensores com problemas" },
    { href: "/pages/lojas/deteccao-loja", label: "Detecção de Incêndio", icon: "bi bi-fire", description: "Sistemas de detecção de incêndio" },
  ],
  '/pages/lojas/componentes-loja': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop", description: "Gestão de lojas" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks", description: "Componentes das lojas" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning", description: "Atuadores das lojas" },
    { href: "/pages/lojas/atuadores-loja/atuadores-loja-defeito", label: "Atuadores com Defeito", icon: "bi bi-exclamation-triangle", description: "Atuadores com problemas" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack", description: "Sensores das lojas" },
    { href: "/pages/lojas/sensores-loja/sensores-loja-defeito", label: "Sensores com Defeito", icon: "bi bi-exclamation-triangle", description: "Sensores com problemas" },
    { href: "/pages/lojas/deteccao-loja", label: "Detecção de Incêndio", icon: "bi bi-fire", description: "Sistemas de detecção de incêndio" },
  ],
  '/pages/lojas/atuadores-loja': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop", description: "Gestão de lojas" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks", description: "Componentes das lojas" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning", description: "Atuadores das lojas" },
    { href: "/pages/lojas/atuadores-loja/atuadores-loja-defeito", label: "Atuadores com Defeito", icon: "bi bi-exclamation-triangle", description: "Atuadores com problemas" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack", description: "Sensores das lojas" },
    { href: "/pages/lojas/sensores-loja/sensores-loja-defeito", label: "Sensores com Defeito", icon: "bi bi-exclamation-triangle", description: "Sensores com problemas" },
    { href: "/pages/lojas/deteccao-loja", label: "Detecção de Incêndio", icon: "bi bi-fire", description: "Sistemas de detecção de incêndio" },
  ],
  '/pages/lojas/atuadores-loja/atuadores-loja-defeito': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop", description: "Gestão de lojas" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks", description: "Componentes das lojas" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning", description: "Atuadores das lojas" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack", description: "Sensores das lojas" },
    { href: "/pages/lojas/deteccao-loja", label: "Detecção de Incêndio", icon: "bi bi-fire", description: "Sistemas de detecção de incêndio" },
  ],
  '/pages/lojas/sensores-loja': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop", description: "Gestão de lojas" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks", description: "Componentes das lojas" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning", description: "Atuadores das lojas" },
    { href: "/pages/lojas/atuadores-loja/atuadores-loja-defeito", label: "Atuadores com Defeito", icon: "bi bi-exclamation-triangle", description: "Atuadores com problemas" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack", description: "Sensores das lojas" },
    { href: "/pages/lojas/sensores-loja/sensores-loja-defeito", label: "Sensores com Defeito", icon: "bi bi-exclamation-triangle", description: "Sensores com problemas" },
    { href: "/pages/lojas/deteccao-loja", label: "Detecção de Incêndio", icon: "bi bi-fire", description: "Sistemas de detecção de incêndio" },
  ],
  '/pages/lojas/sensores-loja/sensores-loja-defeito': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop", description: "Gestão de lojas" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks", description: "Componentes das lojas" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning", description: "Atuadores das lojas" },
    { href: "/pages/lojas/atuadores-loja/atuadores-loja-defeito", label: "Atuadores com Defeito", icon: "bi bi-exclamation-triangle", description: "Atuadores com problemas" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack", description: "Sensores das lojas" },
    { href: "/pages/lojas/deteccao-loja", label: "Detecção de Incêndio", icon: "bi bi-fire", description: "Sistemas de detecção de incêndio" },
  ],
  '/pages/lojas/deteccao-loja': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/lojas", label: "Lojas", icon: "bi bi-shop", description: "Gestão de lojas" },
    { href: "/pages/lojas/componentes-loja", label: "Componentes", icon: "bi bi-bricks", description: "Componentes das lojas" },
    { href: "/pages/lojas/atuadores-loja", label: "Atuadores", icon: "bi bi-lightning", description: "Atuadores das lojas" },
    { href: "/pages/lojas/atuadores-loja/atuadores-loja-defeito", label: "Atuadores com Defeito", icon: "bi bi-exclamation-triangle", description: "Atuadores com problemas" },
    { href: "/pages/lojas/sensores-loja", label: "Sensores", icon: "bi bi-hdd-stack", description: "Sensores das lojas" },
    { href: "/pages/lojas/sensores-loja/sensores-loja-defeito", label: "Sensores com Defeito", icon: "bi bi-exclamation-triangle", description: "Sensores com problemas" },
    { href: "/pages/lojas/deteccao-loja", label: "Detecção de Incêndio", icon: "bi bi-fire", description: "Sistemas de detecção de incêndio" },
  ],

  // Sub-menus para SDAI (Sistema de Detecção e Alarme de Incêndio)
  '/dashboard/dashboardSdai': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/sdai", label: "SDAI", icon: "bi bi-broadcast", description: "Sistema de detecção e alarme de incêndio" },
    { href: "/pages/sdai/zonas", label: "Zonas", icon: "bi bi-geo-alt", description: "Zonas de detecção" },
    { href: "/pages/sdai/alarmes", label: "Alarmes", icon: "bi bi-bell", description: "Histórico de alarmes" },
    { href: "/pages/sdai/central", label: "Central", icon: "bi bi-display", description: "Controle da central" },
  ],

  // Sub-menus para SCP (Sistema de Proteção contra Descargas Atmosféricas)
  '/dashboard/dashboardScp': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/scp", label: "SCP", icon: "bi bi-rocket-takeoff", description: "Sistema de proteção contra descargas atmosféricas" },
    { href: "/pages/scp/relatorios", label: "Relatórios", icon: "bi bi-file-earmark-bar-graph", description: "Relatórios do sistema" },
    { href: "/pages/scp/sistemas", label: "Sistemas", icon: "bi bi-lightning", description: "Sistemas de proteção" },
    { href: "/pages/scp/pontos", label: "Pontos", icon: "bi bi-pin-map", description: "Pontos de proteção" },
  ],

  // Sub-menus para CVF
  '/dashboard/dashboardCvf': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cvf", label: "CVFs", icon: "bi bi-building", description: "Controle de vazamento de fluidos" },
    { href: "/pages/cvf/defeitos", label: "Defeitos", icon: "bi bi-exclamation-triangle", description: "CVFs com defeitos" },
  ],
  '/pages/cvf': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cvf", label: "CVFs", icon: "bi bi-building", description: "Controle de vazamento de fluidos" },
    { href: "/pages/cvf/defeitos", label: "Defeitos", icon: "bi bi-exclamation-triangle", description: "CVFs com defeitos" },
  ],
  '/pages/cvf/defeitos': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/cvf", label: "CVFs", icon: "bi bi-building", description: "Controle de vazamento de fluidos" },
    { href: "/pages/cvf/defeitos", label: "Defeitos", icon: "bi bi-exclamation-triangle", description: "CVFs com defeitos" },
  ],

  // Corretivas
  '/pages/corretivas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/dashboard/dashboardCorretiva", label: "Corretiva", icon: "bi bi-alt", description: "Manutenção corretiva" },
    { href: "/pages/corretivas/corretivas-concluida", label: "Concluído", icon: "bi bi-check-circle", description: "Ordens de serviço concluídas" },
  ],

  '/pages/corretivas/corretivas-concluida': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/corretivas", label: "Corretivas", icon: "bi bi-alt", description: "Manutenção corretiva" },
    { href: "/pages/corretivas/corretivas-concluida", label: "Concluído", icon: "bi bi-check-circle", description: "Ordens de serviço concluídas" },
  ],

  // Controle de Acesso
  '/dashboard/dashboardAccessControl': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/access-control/defeito", label: "Dispositivos com Defeito", icon: "bi bi-exclamation-triangle", description: "Dispositivos com problemas" },
  ],
  '/pages/access-control/defeito': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/dashboard/dashboardAccessControl", label: "Controle de Acesso", icon: "bi bi-shield-lock", description: "Gestão de acesso" },
    { href: "/pages/access-control/defeito", label: "Dispositivos com Defeito", icon: "bi bi-exclamation-triangle", description: "Dispositivos com problemas" },
  ],

  // Defeitos gerais
  '/pages/defeitos': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/defeitos", label: "Todos os Defeitos", icon: "bi bi-exclamation-diamond", description: "Visão geral de todos os dispositivos com defeito" },
  ],

  // Ocorrências
  '/pages/ocorrencias': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/ocorrencias", label: "Ocorrências", icon: "bi bi-mic", description: "Registro de ocorrências e soluções" },
    { href: "/pages/ocorrencias/list", label: "Lista de Ocorrências", icon: "bi bi-list-check", description: "Visualizar ocorrências por status" },
  ],

  '/pages/ocorrencias/list': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/ocorrencias", label: "Ocorrências", icon: "bi bi-mic", description: "Registro de ocorrências e soluções" },
    { href: "/pages/ocorrencias/list", label: "Lista de Ocorrências", icon: "bi bi-list-check", description: "Visualizar ocorrências por status" },
  ],

  // Preventivas main page
  '/pages/preventivas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/preventivas", label: "Sistema de Preventivas", icon: "bi bi-tools", description: "Gestão completa de manutenção preventiva" },
    { href: "/pages/preventivas/executar", label: "Executar Preventiva", icon: "bi bi-play-circle", description: "Interface unificada para execução" },
    { href: "/pages/preventivas/lojas", label: "Preventivas Lojas", icon: "bi bi-shop", description: "Manutenção preventiva nas lojas" },
    { href: "/pages/preventivas/casa-maquinas", label: "Casa de Máquinas", icon: "bi bi-gear", description: "Preventiva de equipamentos" },
    { href: "/pages/preventivas/controle-acesso", label: "Controle de Acesso", icon: "bi bi-shield-lock", description: "Sistemas de segurança" },
    { href: "/pages/preventivas/cvfs", label: "CVFs", icon: "bi bi-wind", description: "Sistemas de refrigeração" },
  ],

  // Preventivas execution page
  '/pages/preventivas/executar': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/preventivas", label: "Sistema de Preventivas", icon: "bi bi-tools", description: "Gestão completa de manutenção preventiva" },
    { href: "/pages/preventivas/executar", label: "Executar Preventiva", icon: "bi bi-play-circle", description: "Interface unificada para execução" },
    { href: "/pages/preventivas/lojas", label: "Preventivas Lojas", icon: "bi bi-shop", description: "Manutenção preventiva nas lojas" },
    { href: "/pages/preventivas/casa-maquinas", label: "Casa de Máquinas", icon: "bi bi-gear", description: "Preventiva de equipamentos" },
    { href: "/pages/preventivas/controle-acesso", label: "Controle de Acesso", icon: "bi bi-shield-lock", description: "Sistemas de segurança" },
    { href: "/pages/preventivas/cvfs", label: "CVFs", icon: "bi bi-wind", description: "Sistemas de refrigeração" },
  ],

  // Preventivas Lojas
  '/pages/preventivas/lojas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/preventivas/lojas", label: "Preventivas Lojas", icon: "bi bi-calendar-check", description: "Manutenção preventiva nas lojas" },
    { href: "/pages/preventivas/lojas/agendadas", label: "Agendadas", icon: "bi bi-calendar-plus", description: "Preventivas agendadas" },
    { href: "/pages/preventivas/lojas/em-andamento", label: "Em Andamento", icon: "bi bi-hourglass-split", description: "Preventivas em execução" },
    { href: "/pages/preventivas/lojas/concluidas", label: "Concluídas", icon: "bi bi-check-circle", description: "Preventivas finalizadas" },
    { href: "/pages/preventivas/lojas/checklists", label: "Checklists", icon: "bi bi-card-checklist", description: "Modelos de checklists" },
  ],

  '/pages/preventivas/lojas/agendadas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/preventivas/lojas", label: "Preventivas Lojas", icon: "bi bi-calendar-check", description: "Manutenção preventiva nas lojas" },
    { href: "/pages/preventivas/lojas/agendadas", label: "Agendadas", icon: "bi bi-calendar-plus", description: "Preventivas agendadas" },
    { href: "/pages/preventivas/lojas/em-andamento", label: "Em Andamento", icon: "bi bi-hourglass-split", description: "Preventivas em execução" },
    { href: "/pages/preventivas/lojas/concluidas", label: "Concluídas", icon: "bi bi-check-circle", description: "Preventivas finalizadas" },
    { href: "/pages/preventivas/lojas/checklists", label: "Checklists", icon: "bi bi-card-checklist", description: "Modelos de checklists" },
  ],

  '/pages/preventivas/lojas/em-andamento': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/preventivas/lojas", label: "Preventivas Lojas", icon: "bi bi-calendar-check", description: "Manutenção preventiva nas lojas" },
    { href: "/pages/preventivas/lojas/agendadas", label: "Agendadas", icon: "bi bi-calendar-plus", description: "Preventivas agendadas" },
    { href: "/pages/preventivas/lojas/em-andamento", label: "Em Andamento", icon: "bi bi-hourglass-split", description: "Preventivas em execução" },
    { href: "/pages/preventivas/lojas/concluidas", label: "Concluídas", icon: "bi bi-check-circle", description: "Preventivas finalizadas" },
    { href: "/pages/preventivas/lojas/checklists", label: "Checklists", icon: "bi bi-card-checklist", description: "Modelos de checklists" },
  ],

  '/pages/preventivas/lojas/concluidas': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/preventivas/lojas", label: "Preventivas Lojas", icon: "bi bi-calendar-check", description: "Manutenção preventiva nas lojas" },
    { href: "/pages/preventivas/lojas/agendadas", label: "Agendadas", icon: "bi bi-calendar-plus", description: "Preventivas agendadas" },
    { href: "/pages/preventivas/lojas/em-andamento", label: "Em Andamento", icon: "bi bi-hourglass-split", description: "Preventivas em execução" },
    { href: "/pages/preventivas/lojas/concluidas", label: "Concluídas", icon: "bi bi-check-circle", description: "Preventivas finalizadas" },
    { href: "/pages/preventivas/lojas/checklists", label: "Checklists", icon: "bi bi-card-checklist", description: "Modelos de checklists" },
  ],

  '/pages/preventivas/lojas/checklists': [
    { href: "/dashboard", label: "Nanoautomation", icon: "bi bi-house-door" },
    { href: "/pages/preventivas/lojas", label: "Preventivas Lojas", icon: "bi bi-calendar-check", description: "Manutenção preventiva nas lojas" },
    { href: "/pages/preventivas/lojas/agendadas", label: "Agendadas", icon: "bi bi-calendar-plus", description: "Preventivas agendadas" },
    { href: "/pages/preventivas/lojas/em-andamento", label: "Em Andamento", icon: "bi bi-hourglass-split", description: "Preventivas em execução" },
    { href: "/pages/preventivas/lojas/concluidas", label: "Concluídas", icon: "bi bi-check-circle", description: "Preventivas finalizadas" },
    { href: "/pages/preventivas/lojas/checklists", label: "Checklists", icon: "bi bi-card-checklist", description: "Modelos de checklists" },
  ],
};

export default sidebarItems;
