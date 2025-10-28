import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:4200',
  },
  // Configuración explícita para evitar conflictos con rutas de API
  async rewrites() {
    return [
      // No hacer rewrite de rutas de API externas
      // Las rutas /api/* se manejan internamente por Next.js
    ];
  },
  // Configuración experimental para mejorar el rendimiento
  experimental: {
    // instrumentationHook ya no es necesario en Next.js 15+
  },
};

export default nextConfig;