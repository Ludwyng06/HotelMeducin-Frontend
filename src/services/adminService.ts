import API from './api';
import type { Admin, CreateAdminData, UpdateAdminData } from '@models/Admin';

export const adminService = {
  // Obtener todos los administradores
  getAdmins: async (): Promise<Admin[]> => {
    try {
      const response = await API.get('/superadmin/admins');
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener administradores:', error);
      throw error;
    }
  },

  // Obtener un administrador por ID
  getAdmin: async (id: string): Promise<Admin> => {
    try {
      const response = await API.get(`/superadmin/admins/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener administrador:', error);
      throw error;
    }
  },

  // Crear nuevo administrador
  createAdmin: async (adminData: CreateAdminData): Promise<Admin> => {
    try {
      const response = await API.post('/superadmin/admins', adminData);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear administrador:', error);
      throw error;
    }
  },

  // Actualizar administrador
  updateAdmin: async (id: string, adminData: UpdateAdminData): Promise<Admin> => {
    try {
      const response = await API.patch(`/superadmin/admins/${id}`, adminData);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar administrador:', error);
      throw error;
    }
  },

  // Eliminar administrador
  deleteAdmin: async (id: string): Promise<void> => {
    try {
      await API.delete(`/superadmin/admins/${id}`);
    } catch (error) {
      console.error('Error al eliminar administrador:', error);
      throw error;
    }
  },

  // Obtener dashboard del superadmin
  getDashboard: async () => {
    try {
      const response = await API.get('/superadmin/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener dashboard:', error);
      throw error;
    }
  }
};
