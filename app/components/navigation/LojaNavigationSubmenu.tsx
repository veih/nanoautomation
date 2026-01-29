"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface LojaNavigationSubmenuProps {
  isCollapsed: boolean; // Para controlar a visibilidade e estilo quando o sidebar está colapsado
}

const LojaNavigationSubmenu: React.FC<LojaNavigationSubmenuProps> = ({
  isCollapsed,
}) => {
  const pathname = usePathname() || "";

  // Função auxiliar para aplicar as classes de estilo aos links
  const getLinkClasses = (href: string) => {
    return `nav-link text-white py-4 px-3 px-md-4 d-flex align-items-center rounded-pill ${pathname === href ? "bg-primary fw-bold" : "hover-bg-light-opacity"
      } ${isCollapsed ? "justify-content-center" : ""}`;
  };

  // Check if we're on the simplified view
  const isSimplifiedView = pathname.includes('/simplified');

  return (
    <div
      className={`loja-submenu bg-primary rounded-3 shadow-sm ${isCollapsed ? "collapsed" : ""
        }`}
    >
      <ul
        className={`nav flex-row flex-wrap p-0 ${isCollapsed ? "d-none" : ""}`}
      >
        {/* Categoria Equipamentos de Loja - Item de menu horizontal */}
        <li className="nav-item me-0 me-md-2 mb-1">
          {/* Sub-submenu de equipamentos de loja - Também horizontal, aninhado e com indentação */}
          <ul
            className={`nav flex-row flex-wrap p-0 ms-0 ms-md-4 ${isCollapsed ? "d-none" : ""
              }`}
          >
            {" "}
            <li className="nav-item me-0 me-md-2 mb-1">
              <Link
                href="/pages/lojas"
                className={getLinkClasses("/pages/lojas")}
              >
                {!isCollapsed && (isSimplifiedView ? "Visualização Avançada" : "Lojas")}
              </Link>
            </li>
            {!isSimplifiedView && (
              <>
                <li className="nav-item me-0 me-md-2 mb-1">
                  <Link
                    href="/pages/lojas/componentes-loja"
                    className={getLinkClasses("/pages/lojas/componentes-loja")}
                  >
                    {!isCollapsed && "Componentes"}
                  </Link>
                </li>
                <li className="nav-item me-0 me-md-2 mb-1">
                  <Link
                    href="/pages/lojas/atuadores-loja"
                    className={getLinkClasses("/pages/lojas/atuadores-loja")}
                  >
                    {!isCollapsed && "Atuadores"}
                  </Link>
                </li>
                <li className="nav-item me-0 me-md-2 mb-1">
                  <Link
                    href="/pages/lojas/sensores-loja"
                    className={getLinkClasses("/pages/lojas/sensores-loja")}
                  >
                    {!isCollapsed && "Sensores"}
                  </Link>
                </li>
                <li className="nav-item me-0 me-md-2 mb-1">
                  <Link
                    href="/pages/lojas/deteccao-loja"
                    className={getLinkClasses("/pages/lojas/deteccao-loja")}
                  >
                    {!isCollapsed && "Detecção de Incêndio"}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default LojaNavigationSubmenu;