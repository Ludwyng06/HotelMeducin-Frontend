import API from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      phoneNumber?: string;
    };
    token: string;
  };
  message: string;
}

export const authService = {
  // Login de usuario
  login: async (loginData: LoginData): Promise<AuthResponse> => {
    const response = await API.post('/auth/login', loginData);
    return response.data;
  },

  // Registro de usuario
  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('🚀 Enviando datos de registro:', registerData);
      const response = await API.post('/auth/register', registerData);
      console.log('✅ Respuesta del backend:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en registro:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obtener perfil del usuario autenticado
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
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
