"use client";
import React, { useState, useEffect } from "react";
import "../styles/Navbar.css";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  {
    title: "Servicios del Hotel",
    submenu: ["Spa & Bienestar", "Restaurantes", "Piscina y Gimnasio"],
  },
  {
    title: "Experiencias",
    submenu: ["Tours Locales", "Eventos Especiales", "Actividades al Aire Libre"],
  },
  {
    title: "Reservaciones",
    submenu: ["Buscar habitación", "Paquetes promocionales", "Solicitar cotización"],
  },
  {
    title: "Contacto y Ayuda",
    submenu: ["Contáctanos", "Preguntas Frecuentes"],
  },
];

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="navbar-menu">
          {menuItems.map((item) => (
            <div
              key={item.title}
              className="nav-link-wrapper"
              onMouseEnter={() => setActiveMenu(item.title)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <div
                className={`nav-link ${
                  activeMenu === item.title ? "active" : ""
                }`}
              >
                {item.title} <span className="dropdown-icon">▾</span>
              </div>
              {activeMenu === item.title && (
                <div className="dropdown-menu">
                  {item.submenu.map((subitem) => (
                    <Link
                      href={`/${item.title
                        .toLowerCase()
                        .replace(/\s/g, "-")}/${subitem
                        .toLowerCase()
                        .replace(/\s/g, "-")
                        .replace(/&/g, "y")
                        .replace(/á/g, "a")
                        .replace(/é/g, "e")
                        .replace(/í/g, "i")
                        .replace(/ó/g, "o")
                        .replace(/ú/g, "u")
                        .replace(/ñ/g, "n")}`}
                      className="dropdown-item"
                      key={subitem}
                    >
                      {subitem}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Enlace para Superadministrador */}
          {isClient && user?.role === "superadmin" && (
            <div
              className="nav-link-wrapper"
              onMouseEnter={() => setActiveMenu("superadmin")}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href="/superadmin/dashboard"
                className={`nav-link ${
                  activeMenu === "superadmin" ? "active" : ""
                }`}
              >
                Gestionar Administradores
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
