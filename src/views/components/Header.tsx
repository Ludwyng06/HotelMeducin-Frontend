"use client";
import "@styles/Header.css";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@context/AuthContext";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

const Header = () => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const toggleLanguageMenu = () => setShowLanguageMenu(!showLanguageMenu);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="header">
      <div className="header-container">
        
      <Link href="/" style={{ textDecoration: "none" }}>
          <div className="logo" style={{ cursor: "pointer" }}>
          <strong>Hotel Meducin</strong>
          <span className="tagline">Because your comfort is our commitment.</span>
        </div>
      </Link>

        <nav className="nav">
          <div
            className="language-selector"
            onClick={toggleLanguageMenu}
            onBlur={() => setTimeout(() => setShowLanguageMenu(false), 100)}
            tabIndex={0}
          >
            <span className="language-label">Idioma</span>
            <span className="lang">Español ▾</span>
            {showLanguageMenu && (
              <div className="language-dropdown">
                <div className="language-option">Español</div>
                <div className="language-option">English</div>
              </div>
            )}
          </div>
          <Link href="/reservations" className="header-link">
            Encontrar estadía <span className="calendar-icon">📅</span>
          </Link>
          {!isAuthenticated && (
            <a href="/login" className="login-link">Inicie sesión 👤</a>
          )}
          {isAuthenticated && (
            <>
              <Link href="/user/profile" className="login-link">Perfil 👤</Link>
              <button
                className="logout-button"
                title="Cerrar sesión"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                style={{
                  background: '#fff',
                  border: '2px solid #002d62',
                  cursor: 'pointer',
                  fontSize: '1.7rem',
                  marginLeft: '1.5rem',
                  color: '#002d62',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#e6f0fa';
                  e.currentTarget.style.color = '#004494';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#002d62';
                }}
              >
                <FiLogOut />
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
