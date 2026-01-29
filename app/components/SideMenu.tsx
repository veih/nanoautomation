// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import React from "react";
import { sidebarItems } from "./SidebarItens";
import styles from "./SideMenu.module.css";

// Define the type for sidebar items
interface SidebarItem {
  href: string;
  label: string;
  icon?: string;
  description?: string;
}

const Sidebar: React.FC = () => {
  const pathname = usePathname() || "";
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if we're on mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // On mobile, start with collapsed menu
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Lógica para selecionar o menu correto
  const selectedMenu =
    sidebarItems[pathname as keyof typeof sidebarItems] || sidebarItems.main;

  // Função para aplicar as classes de estilo aos links
  const getLinkClasses = (href: string) => {
    return `nav-link text-white py-2 px-3 d-flex align-items-center ${styles.sidebarItem} ${pathname === href
      ? "bg-primary fw-bold rounded"
      : "hover-bg-light-opacity"
      } ${isCollapsed ? "justify-content-center" : ""}`;
  };

  // Close menu on mobile after clicking a link
  const handleLinkClick = () => {
    if (isMobile && !isCollapsed) {
      setIsCollapsed(true);
    }
  };

  return (
    <div
      className={`sidebar bg-dark text-white p-3 d-flex flex-column h-100 ${isCollapsed ? "collapsed" : "expanded"
        } ${styles.sidebar}`}
    >
      <div className={`d-flex justify-content-between align-items-center mb-4 ${isCollapsed ? 'flex-column' : ''} d-none d-md-flex`}>
        {!isCollapsed && <h5 className="mb-0">Dashboards</h5>}
        <button
          className={`btn btn-outline-light btn-sm toggle-btn ${styles.toggleBtn} ${isCollapsed ? 'mt-2' : ''}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? "▶️" : "◀️"}
        </button>
      </div>

      <ul className="nav flex-column flex-grow-1">
        {selectedMenu.map((item: SidebarItem, index) => (
          // Usando o 'index' como chave para evitar o erro
          <li className="nav-item mb-1" key={index}>
            <Link
              href={item.href}
              className={getLinkClasses(item.href)}
              title={item.description || item.label}
              onClick={handleLinkClick}
            >
              {item.icon && (
                <span className={isCollapsed ? "" : "me-2"}>
                  <i className={item.icon}></i>
                </span>
              )}
              {!isCollapsed && (
                <div className={`d-flex flex-column ${styles.sidebarItemContent}`}>
                  <span>{item.label}</span>
                  {item.description && (
                    <small className="text-light opacity-75 mt-1">
                      {item.description}
                    </small>
                  )}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;