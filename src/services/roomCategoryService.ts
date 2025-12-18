import API from './api';
import type { RoomCategory, RoomCategoryFilters } from '@models/RoomCategory';

export const roomCategoryService = {
  // Obtener todas las categorías activas
  getAllCategories: async (): Promise<RoomCategory[]> => {
    const baseURL = API.defaults.baseURL || 'http://localhost:3000';
    console.log('🔍 Intentando obtener categorías desde:', baseURL + '/room-categories');
    
    try {
      const response = await API.get('/room-categories');
      
      // El backend devuelve: { success: true, data: [...], message: '...' }
      // El TransformInterceptor NO lo envuelve porque ya tiene 'success'
      // Entonces response.data = { success: true, data: [...], message: '...' }
      
      // Extraer las categorías de response.data.data
      const categories = response.data?.data;
      
      if (!categories) {
        console.error('❌ No se encontró la propiedad "data" en la respuesta');
        console.error('   Estructura recibida:', JSON.stringify(response.data, null, 2));
        throw new Error('Formato de respuesta inesperado: falta la propiedad "data"');
      }
      
      if (!Array.isArray(categories)) {
        console.error('❌ La propiedad "data" no es un array');
        console.error('   Tipo recibido:', typeof categories);
        console.error('   Valor:', categories);
        throw new Error('Formato de respuesta inesperado: "data" no es un array');
      }
      
      if (categories.length === 0) {
        console.warn('⚠️ El array de categorías está vacío');
      }
      
      console.log('✅ Categorías obtenidas:', `${categories.length} categorías`);
      
      return categories;
    } catch (error: any) {
      // El interceptor de axios ya maneja los logs de error de red
      // Solo agregamos contexto específico si es necesario
      const isNetworkError = error?.code === 'ERR_NETWORK' || 
                            error?.code === 'ECONNREFUSED' ||
                            error?.code === 'ERR_INTERNET_DISCONNECTED' ||
                            error?.message?.includes('Network Error') ||
                            error?.message?.includes('Failed to fetch');
      
      if (isNetworkError) {
        // El interceptor ya mostró el error, solo agregamos contexto
        console.error('❌ No se pudieron obtener las categorías debido a un error de conexión');
        console.error(`   Endpoint: ${baseURL}/room-categories`);
      } else if (error?.response?.status) {
        // Error HTTP del servidor
        console.error(`❌ Error ${error.response.status} al obtener categorías`);
        if (error.response.data?.message) {
          console.error(`   Mensaje: ${error.response.data.message}`);
        }
      } else if (error?.message) {
        // Otro tipo de error
        console.error('❌ Error al obtener categorías:', error.message);
      }
      
      // Re-lanzar el error para que el componente lo maneje
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
