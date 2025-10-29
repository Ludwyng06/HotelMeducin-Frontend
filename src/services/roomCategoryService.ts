import API from './api';
import type { RoomCategory, RoomCategoryFilters } from '@models/RoomCategory';

export const roomCategoryService = {
  // Obtener todas las categorías activas
  getAllCategories: async (): Promise<RoomCategory[]> => {
    try {
      const response = await API.get('/room-categories');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  // Obtener categoría por ID
  getCategoryById: async (id: string): Promise<RoomCategory> => {
    try {
      const response = await API.get(`/room-categories/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      throw error;
    }
  },

  // Obtener categorías por rango de precio
  getCategoriesByPriceRange: async (minPrice: number, maxPrice: number): Promise<RoomCategory[]> => {
    try {
      const response = await API.get(`/room-categories/search/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener categorías por precio:', error);
      throw error;
    }
  },

  // Obtener categorías por capacidad
  getCategoriesByCapacity: async (capacity: number): Promise<RoomCategory[]> => {
    try {
      const response = await API.get(`/room-categories/search/capacity?capacity=${capacity}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener categorías por capacidad:', error);
      throw error;
    }
  },

  // Obtener estadísticas de categorías (solo admin)
  getCategoryStats: async (): Promise<any[]> => {
    try {
      const response = await API.get('/room-categories/admin/stats');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de categorías:', error);
      throw error;
    }
  }
};
