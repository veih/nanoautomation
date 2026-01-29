"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface SdaiNavigationProps {
  isCollapsed: boolean; // Para controlar a visibilidade e estilo quando o sidebar está colapsado
}

const SdaiNavigation: React.FC<SdaiNavigationProps> = ({ isCollapsed }) => {
  const pathname = usePathname() || "";

  // Função auxiliar para aplicar as classes de estilo aos links
  const getLinkClasses = (href: string) => {
    return `nav-link text-white py-2 px-3 px-md-4 d-flex align-items-center rounded-pill ${
      pathname === href ? "bg-primary fw-bold" : "hover-bg-light-opacity"
    } ${isCollapsed ? "justify-content-center" : ""}`;
  };

  return (
    <div
      className={`sdai-submenu bg-primary rounded-3 shadow-sm ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      <ul
        className={`nav flex-row flex-wrap p-0 ${isCollapsed ? "d-none" : ""}`}
      >
        {/* Categoria SDAI - Item de menu horizontal */}
        <li className="nav-item me-0 me-md-2 mb-1">
          {/* Sub-submenu de SDAI - Também horizontal, aninhado e com indentação */}
          <ul
            className={`nav flex-row flex-wrap p-0 ms-0 ms-md-4 ${
              isCollapsed ? "d-none" : ""
            }`}
          >
            {" "}
            <li className="nav-item me-0 me-md-2 mb-1">
              <Link
                href="/dashboard/dashboardSdai"
                className={getLinkClasses("/dashboard/dashboardSdai")}
              >
                {!isCollapsed && "Dashboard SDAI"}
              </Link>
            </li>
            {/* Removendo links que não existem no sistema */}
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default SdaiNavigation;
