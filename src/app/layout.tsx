// src/app/layout.tsx
'use client';
// IMPORTAR PRIMERO - antes que cualquier otro código
import '@js-temporal/polyfill';
import '../config/temporal.config';

import "../styles/globals.css";
import "../styles/theme.css";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutWrapper from "../views/components/LayoutWrapper";
import { AuthProvider } from "../views/context/AuthContext";
import { ThemeProvider } from "../components/ThemeProvider/ThemeProvider";
import ReactQueryProvider from "./providers/ReactQueryProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/images/foto piscina.avif" as="image" type="image/avif" />
        <link rel="dns-prefetch" href="//localhost:8080" />
        <link rel="preconnect" href="//localhost:8080" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
