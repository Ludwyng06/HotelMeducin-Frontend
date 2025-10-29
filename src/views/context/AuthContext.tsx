'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@services/authService';
import type { User, AuthContextType } from '@models/Auth';

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener usuario actual al cargar la app
  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    try {
      // Primero intentar obtener usuario desde sessionStorage
      const cachedUser = sessionStorage.getItem('auth_user');
      const token = localStorage.getItem('token');
      
      if (cachedUser && token) {
        setUser(JSON.parse(cachedUser));
        setIsLoading(false);
        
        // Verificar token en background sin bloquear UI (optimizado)
        // Usar requestIdleCallback si está disponible, sino setTimeout
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            refreshUser();
          });
        } else {
          setTimeout(() => {
            refreshUser();
          }, 1000); // Aumentar delay para evitar bucles
        }
      } else {
        await refreshUser();
      }
    } catch {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      // Primero verificar si hay token
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        sessionStorage.removeItem('auth_user');
        setIsLoading(false);
        return;
      }

      // Si hay token, obtener usuario del backend
      const userData = await authService.getProfile();
      if (userData && userData.data) {
        setUser(userData.data);
        // Cachear usuario en sessionStorage
        sessionStorage.setItem('auth_user', JSON.stringify(userData.data));
      } else {
        setUser(null);
        sessionStorage.removeItem('auth_user');
      }
    } catch {
      setUser(null);
      sessionStorage.removeItem('auth_user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        // Guardar datos de autenticación
        authService.saveAuthData(response.data.user, (response.data as any).access_token || response.data.token);
        setUser(response.data.user);
        sessionStorage.setItem('auth_user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        // Guardar datos de autenticación
        authService.saveAuthData(response.data.user, (response.data as any).access_token || response.data.token);
        setUser(response.data.user);
        sessionStorage.setItem('auth_user', JSON.stringify(response.data.user));
      }
    } catch (error: any) {
      throw error; // Propaga el error para que el componente lo maneje
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    sessionStorage.removeItem('auth_user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
