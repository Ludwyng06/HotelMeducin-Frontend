import API from './api';
import type { LoginData, RegisterData, AuthResponse } from '@models/Auth';

export const authService = {
  // Login de usuario
  login: async (loginData: LoginData): Promise<AuthResponse> => {
    try {
      const response = await API.post('/auth/login', loginData);
      return response.data;
    } catch (error: any) {
      // Si es error de red, mostrar mensaje claro
      if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
        const baseURL = API.defaults.baseURL || 'http://localhost:3000';
        throw new Error(`No se pudo conectar con el backend en ${baseURL}. Verifica que el servidor esté corriendo.`);
      }
      // Para otros errores, propagar el error original
      throw error;
    }
  },

  // Registro de usuario
  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('🚀 Enviando datos de registro:', registerData);
      const response = await API.post('/auth/register', registerData);
      console.log('✅ Respuesta del backend:', response.data);
      return response.data;
    } catch (error: any) {
      // Evitar imprimir objetos vacíos
      const payload = error?.response?.data || { message: error?.message || 'Error desconocido' };
      console.error('❌ Error en registro:', payload);
      // Propagar un error con mensaje claro para mostrar en UI
      const err = new Error(payload?.message || 'Error al registrar usuario');
      (err as any).status = error?.response?.status;
      throw err;
    }
  },

  // Obtener perfil del usuario autenticado
  getProfile: async () => {
    try {
      const response = await API.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      // Si es error de red, no intentar parsear response
      if (error?.isNetworkError || error?.code === 'ERR_NETWORK' || error?.code === 'ECONNREFUSED') {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      }
      // Para otros errores, propagar el error original
      throw error;
    }
  },

  // Logout (opcional, ya que el token se maneja en localStorage)
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Obtener token del localStorage
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  // Guardar datos de autenticación
  saveAuthData: (user: any, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    }
  }
};
