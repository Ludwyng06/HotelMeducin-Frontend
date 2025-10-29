import API from './api';

export const userService = {
  // Obtener perfil del usuario autenticado
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
  },

  // Actualizar perfil del usuario
  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) => {
    const response = await API.put('/auth/profile', profileData);
    return response.data;
  },

  // Obtener todos los usuarios (solo admin)
  getAllUsers: async () => {
    const response = await API.get('/users');
    return response.data;
  },

  // Obtener usuario por ID
  getUserById: async (id: string | number) => {
    const response = await API.get(`/users/${id}`);
    return response.data;
  },

  // Actualizar usuario por ID (solo admin)
  updateUser: async (id: string | number, userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    isActive?: boolean;
  }) => {
    const response = await API.patch(`/users/${id}`, userData);
    return response.data;
  },

  // Eliminar usuario (solo admin)
  deleteUser: async (id: string | number) => {
    const response = await API.delete(`/users/${id}`);
    return response.data;
  },
};
