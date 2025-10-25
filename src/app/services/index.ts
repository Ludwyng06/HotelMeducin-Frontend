import axios from 'axios';

// Configuración base de axios
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones autenticadas
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
  }
];

// Servicios de reservas con fallback a mock
export const reservationService = {
  createReservation: async (reservationData: any) => {
    try {
      // Filtrar solo los campos que el backend realmente espera según el DTO
      const allowedFields = [
        'userId', 'roomId', 'checkInDate', 'checkOutDate', 'totalPrice', 'status', 'specialRequests', 'serviceIds'
      ];
      const filteredData: any = {};
      for (const key of allowedFields) {
        if (reservationData[key] !== undefined) {
          filteredData[key] = reservationData[key];
          console.log(`🔍 Campo ${key}:`, reservationData[key], 'tipo:', typeof reservationData[key]);
        }
      }
      
      console.log('🚀 Enviando reserva al backend:', filteredData);
      console.log('🔍 userId tipo:', typeof filteredData.userId);
      console.log('🔍 userId valor:', filteredData.userId);
      const response = await API.post('/reservations', filteredData);
      console.log('✅ Respuesta del backend:', response.data);
      
      // Disparar evento para notificar que las reservas se actualizaron
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reservationsUpdated'));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al crear reserva en backend:', error.response?.data || error.message);
      
      // Solo usar mock como último recurso si el backend realmente no está disponible
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('⚠️ Backend no disponible, usando modo mock');
        const newReservation = {
          id: Date.now(),
          roomId: reservationData.roomId,
          room: { name: `Habitación ${reservationData.roomId}` },
          checkInDate: reservationData.checkInDate,
          checkOutDate: reservationData.checkOutDate,
          totalPrice: reservationData.totalPrice,
          status: 'PENDING',
          specialRequests: reservationData.specialRequests || '',
          userId: reservationData.userId
        };
        
        const existingReservations = JSON.parse(localStorage.getItem('userReservations') || '[]');
        existingReservations.push(newReservation);
        localStorage.setItem('userReservations', JSON.stringify(existingReservations));
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('reservationsUpdated'));
        }
        
        return newReservation;
      } else {
        // Si es un error del backend (400, 401, etc.), propagar el error
        throw error;
      }
    }
  },

  getReservationById: async (id: number) => {
    try {
      const response = await API.get(`/reservations/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`API no disponible, usando datos mock para reserva ${id}:`, error);
      return mockReservations.find(r => r.id === id) || null;
    }
  },

  getUserReservations: async () => {
    try {
      console.log('🚀 INICIANDO getUserReservations - VERSIÓN ACTUALIZADA');
      console.log('🔍 Obteniendo reservas del backend...');
      // Obtener el userId del usuario autenticado
      const cachedUser = sessionStorage.getItem('auth_user');
      console.log('🔍 cachedUser desde sessionStorage:', cachedUser);
      let userId = null;
      
      if (cachedUser) {
        try {
          const user = JSON.parse(cachedUser);
          console.log('🔍 Usuario parseado:', user);
          userId = user._id || user.id;
          console.log('👤 userId obtenido:', userId);
          console.log('👤 tipo de userId:', typeof userId);
        } catch (error) {
          console.error('Error al parsear usuario desde sessionStorage:', error);
        }
      } else {
        console.warn('⚠️ No se encontró auth_user en sessionStorage');
      }
      
      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }
      
      console.log('🌐 Enviando request a:', `/reservations/user?userId=${userId}`);
      const response = await API.get(`/reservations/user?userId=${userId}`);
      console.log('✅ Reservas del backend obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener reservas del backend:', error.response?.data || error.message);
      
      // Solo usar mock si hay error de conexión
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('⚠️ Backend no disponible, usando reservas mock');
        const userReservations = JSON.parse(localStorage.getItem('userReservations') || '[]');
        const allReservations = [...mockReservations, ...userReservations];
        return allReservations;
      } else {
        // Si es un error de autenticación o similar, propagar
        throw error;
      }
    }
  },

  cancelReservation: async (id: number) => {
    try {
      const response = await API.delete(`/reservations/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`API no disponible, simulando cancelación de reserva ${id}:`, error);
      
      // Remover la reserva del localStorage si existe ahí
      const userReservations = JSON.parse(localStorage.getItem('userReservations') || '[]');
      const updatedReservations = userReservations.filter((r: any) => r.id !== id);
      localStorage.setItem('userReservations', JSON.stringify(updatedReservations));
      
      // Disparar evento para notificar que las reservas se actualizaron
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reservationsUpdated'));
      }
      
      return { message: 'Reserva cancelada exitosamente' };
    }
  },

  getOccupiedDates: async (roomId: string) => {
    try {
      console.log('🔍 Obteniendo fechas ocupadas para habitación:', roomId);
      const response = await API.get(`/reservations/room/${roomId}/occupied-dates`);
      console.log('✅ Fechas ocupadas obtenidas:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener fechas ocupadas:', error.response?.data || error.message);
      return []; // Retornar array vacío en caso de error
    }
  },
};

// Exportar todos los servicios
export { authService } from './authService';
export { userService } from './userService';
export { roomService } from './roomService';
export { roomCategoryService } from './roomCategoryService';
export { serviceService } from './serviceService';
export { reportsService } from './reportsService';
export { paymentService } from './paymentService';

export default API; 