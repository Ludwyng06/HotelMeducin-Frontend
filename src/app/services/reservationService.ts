import API from './api';

// Datos mock para reservas
const mockReservations = [
  {
    id: 1,
    room: { name: 'Suite Presidencial' },
    checkInDate: '2024-01-15',
    checkOutDate: '2024-01-18',
    status: 'confirmed',
    totalPrice: 450.00
  },
  {
    id: 2,
    room: { name: 'Habitación Estándar' },
    checkInDate: '2024-02-10',
    checkOutDate: '2024-02-12',
    status: 'pending',
    totalPrice: 180.00
  },
  {
    id: 3,
    room: { name: 'Suite Ejecutiva' },
    checkInDate: '2024-03-05',
    checkOutDate: '2024-03-08',
    status: 'confirmed',
    totalPrice: 320.00
  }
];

export const reservationService = {
  // Crear nueva reservación
  createReservation: async (reservationData: {
    userId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    status?: string;
    specialRequests?: string;
    serviceIds?: string[];
  }) => {
    const response = await API.post('/reservations', reservationData);
    return response.data;
  },

  // Obtener reservación por ID
  getReservationById: async (id: string | number) => {
    const response = await API.get(`/reservations/${id}`);
    return response.data;
  },

  // Obtener todas las reservaciones
  getAllReservations: async () => {
    const response = await API.get('/reservations');
    return response.data;
  },

  // Obtener reservaciones de un usuario específico
  getUserReservations: async (userId?: string) => {
    try {
      console.log('🚀 INICIANDO getUserReservations - VERSIÓN ACTUALIZADA');
      console.log('🔍 Obteniendo reservas del backend...');
      // Obtener el userId del usuario autenticado
      const cachedUser = sessionStorage.getItem('auth_user');
      console.log('🔍 cachedUser desde sessionStorage:', cachedUser);
      let finalUserId = userId;
      
      if (!finalUserId && cachedUser) {
        try {
          const user = JSON.parse(cachedUser);
          console.log('🔍 Usuario parseado:', user);
          finalUserId = user._id || user.id;
          console.log('👤 userId obtenido:', finalUserId);
          console.log('👤 tipo de userId:', typeof finalUserId);
        } catch (error) {
          console.error('Error al parsear usuario desde sessionStorage:', error);
        }
      } else if (!finalUserId) {
        console.warn('⚠️ No se encontró auth_user en sessionStorage');
      }
      
      if (!finalUserId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }
      
      console.log('🌐 Enviando request a:', `/reservations/user?userId=${finalUserId}`);
      const response = await API.get(`/reservations/user?userId=${finalUserId}`);
      console.log('✅ Reservas del backend obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener reservas del backend:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obtener reservaciones por rango de fechas
  getReservationsByDateRange: async (startDate: string, endDate: string) => {
    const response = await API.get('/reservations/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Actualizar reservación
  updateReservation: async (id: string | number, updateData: {
    checkInDate?: string;
    checkOutDate?: string;
    totalPrice?: number;
    status?: string;
    specialRequests?: string;
    serviceIds?: string[];
  }) => {
    const response = await API.patch(`/reservations/${id}`, updateData);
    return response.data;
  },

  // Cancelar reservación
  cancelReservation: async (id: string | number) => {
    const response = await API.delete(`/reservations/${id}`);
    return response.data;
  },
}; 