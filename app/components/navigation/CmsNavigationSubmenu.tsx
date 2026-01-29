// components/CmsNavigationSubmenu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react"; // Não precisamos de useState para o hover ou cascata aqui

interface CmsNavigationSubmenuProps {
  isCollapsed: boolean; // Para controlar a visibilidade e estilo quando o sidebar está colapsado
}

const CmsNavigationSubmenu: React.FC<CmsNavigationSubmenuProps> = ({
  isCollapsed,
}) => {
  const pathname = usePathname() || "";

  // Função auxiliar para aplicar as classes de estilo aos links
  const getLinkClasses = (href: string) => {
    // Corrigindo a comparação de paths
    const normalizedPathname = pathname.replace("/pages", "");
    const normalizedHref = href.replace("/pages", "");

    return `nav-link text-white py-2 px-3 px-md-4 d-flex align-items-center rounded-pill ${
      normalizedPathname === normalizedHref ? "bg-primary fw-bold" : "" // Apenas link ativo
    } ${isCollapsed ? "justify-content-center" : ""}`;
  };

  return (
    <div
      className={`cms-submenu bg-primary p-2 rounded-3 shadow-sm ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      <ul
        className={`nav flex-row flex-wrap p-0 ${isCollapsed ? "d-none" : ""}`}
      >
        {/* Categoria Equipamentos - Adicione as classes de hover e posição aqui */}
        <li className="nav-item me-0 me-md-2 mb-1 rounded">
          {/* Sub-submenu de equipamentos - Sua visibilidade e layout são controlados pelo CSS */}
          <ul
            className={`nav flex-row flex-wrap p-0 ms-0 ms-md-4`} // Oculto por padrão, exibido no hover do LI pai via CSS
          >
            <li className="nav-item me-0 me-md-2 mb-1">
              {" "}
              {/* Aplica o hover branco a cada LI interno */}
              <Link href="/pages/cms" className={getLinkClasses("/pages/cms")}>
                {!isCollapsed && "CMs"}
              </Link>
            </li>
            <li className="nav-item me-0 me-md-2 mb-1">
              <Link
                href="/pages/cms/maquinas"
                className={getLinkClasses("/pages/cms/maquinas")}
              >
                {!isCollapsed && "Máquinas"}
              </Link>
            </li>
            <li className="nav-item me-0 me-md-2 mb-1">
              <Link
                href="/pages/cms/atuadores"
                className={getLinkClasses("/pages/cms/atuadores")}
              >
                {!isCollapsed && "Atuadores"}
              </Link>
            </li>
            <li className="nav-item me-0 me-md-2 mb-1">
              <Link
                href="/pages/cms/sensores"
                className={getLinkClasses("/pages/cms/sensores")}
              >
                {!isCollapsed && "Sensores"}
              </Link>
            </li>
            <li className="nav-item me-0 me-md-2 mb-1">
              <Link
                href="/pages/informacoes/cabos"
                className={getLinkClasses("/pages/informacoes/cabos")}
              >
                {!isCollapsed && "Cabos"}
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default CmsNavigationSubmenu;
