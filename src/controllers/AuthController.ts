// Controlador de Autenticación - Orquesta servicios de auth
import { authService } from '@services/authService';
import type { LoginData, RegisterData, AuthResponse, User } from '@models/Auth';

export class AuthController {
  /**
   * Inicializa la autenticación al cargar la app
   */
  static async initializeAuth(): Promise<{ user: User | null; token: string | null }> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        return { user: null, token: null };
      }

      // Verificar si hay usuario en caché
      if (typeof window !== 'undefined') {
        const cachedUser = sessionStorage.getItem('auth_user');
        if (cachedUser) {
          return { user: JSON.parse(cachedUser), token };
        }
      }

      // Obtener usuario del servidor
      const profileResponse = await authService.getProfile();
      const user = profileResponse.data?.user || null;
      
      if (user && typeof window !== 'undefined') {
        sessionStorage.setItem('auth_user', JSON.stringify(user));
      }

      return { user, token };
    } catch (error: any) {
      // Si el token es inválido, limpiar
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        sessionStorage.removeItem('auth_user');
      }
      return { user: null, token: null };
    }
  }

  /**
   * Procesa el login completo
   */
  static async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await authService.login(loginData);
      
      if (response.success && response.data) {
        // Guardar datos de autenticación
        authService.saveAuthData(response.data.user, response.data.token);
        
        // Guardar en sessionStorage también
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_user', JSON.stringify(response.data.user));
        }
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  /**
   * Procesa el registro completo
   */
  static async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await authService.register(registerData);
      
      if (response.success && response.data) {
        // Guardar datos de autenticación
        authService.saveAuthData(response.data.user, response.data.token);
        
        // Guardar en sessionStorage también
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_user', JSON.stringify(response.data.user));
        }
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  }

  /**
   * Realiza logout completo
   */
  static logout(): void {
    authService.logout();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_user');
    }
  }

  /**
   * Refresca los datos del usuario
   */
  static async refreshUser(): Promise<User | null> {
    try {
      const profileResponse = await authService.getProfile();
      const user = profileResponse.data?.user || null;
      
      if (user && typeof window !== 'undefined') {
        sessionStorage.setItem('auth_user', JSON.stringify(user));
      }
      
      return user;
    } catch (error: any) {
      // Si falla, limpiar sesión
      AuthController.logout();
      return null;
    }
  }
}

