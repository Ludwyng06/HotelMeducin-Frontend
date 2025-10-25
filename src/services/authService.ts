import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface LoginCredentials {
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
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      if (response.data.token) {
        // Guardar en localStorage para acceso del cliente
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Guardar también en cookies para el middleware
        document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al iniciar sesión');
    }
  },

  async register(data: RegisterData): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al registrar usuario');
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Limpiar también la cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  },

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    
    // Para pruebas: si no hay usuario pero hay token, crear un usuario de prueba
    const token = this.getToken();
    if (token) {
      const testUser = {
        id: 1,
        firstName: 'Usuario',
        lastName: 'Prueba',
        email: 'test@example.com',
        role: 'user'
      };
      localStorage.setItem('user', JSON.stringify(testUser));
      return testUser;
    }
    
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Método temporal para pruebas
  createTestUser(): void {
    const testToken = 'test-token-123';
    const testUser = {
      id: 1,
      firstName: 'Usuario',
      lastName: 'De Prueba',
      email: 'test@example.com',
      role: 'user',
      phoneNumber: '+1234567890'
    };
    
    localStorage.setItem('token', testToken);
    localStorage.setItem('user', JSON.stringify(testUser));
    document.cookie = `token=${testToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
};

export default authService; 