// src/app/components/LayoutWrapper.tsx
"use client";
import "@styles/LayoutWrapper.css"; // Asegúrate de importar los estilos necesarios

import { ReactNode, lazy, Suspense } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";

// Lazy load de componentes pesados
const Footer = lazy(() => import("./Footer"));
const Navbar = lazy(() => import("./Navbar"));

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hide = pathname === "/login" || pathname === "/register";

  return (
    <div className="layout-wrapper">
      {!hide && <Header />}
      {!hide && (
        <Suspense fallback={<div className="navbar-skeleton" style={{height: '60px', background: '#f0f0f0'}} />}>
          <Navbar />
        </Suspense>
      )}
      <div className="main-content">{children}</div>
      {!hide && (
        <Suspense fallback={<div className="footer-skeleton" style={{height: '200px', background: '#f0f0f0'}} />}>
          <Footer />
        </Suspense>
      )}
    </div>
  );
}
