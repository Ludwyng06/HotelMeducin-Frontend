import API from './api';
import type { Room, RoomWithCategory, RoomFilters } from '@models/Room';

export const roomService = {
  // Obtener todas las habitaciones
  getAllRooms: async (): Promise<RoomWithCategory[]> => {
    try {
      const response = await API.get('/rooms');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener habitaciones:', error);
      throw error;
    }
  },

  // Obtener habitaciones disponibles
  getAvailableRooms: async (): Promise<RoomWithCategory[]> => {
    try {
      const response = await API.get('/rooms?available=true');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener habitaciones disponibles:', error);
      throw error;
    }
  },

  // Obtener habitación por ID
  getRoomById: async (id: string | number): Promise<RoomWithCategory> => {
    try {
      const response = await API.get(`/rooms/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener habitación:', error);
      throw error;
    }
  },

  // Obtener habitación por número
  getRoomByNumber: async (roomNumber: string): Promise<RoomWithCategory> => {
    try {
      const response = await API.get(`/rooms/number/${roomNumber}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener habitación por número:', error);
      throw error;
    }
  },

  // Obtener habitaciones por categoría
  getRoomsByCategory: async (categoryId: string): Promise<RoomWithCategory[]> => {
    try {
      const response = await API.get(`/rooms/category/${categoryId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener habitaciones por categoría:', error);
      throw error;
    }
  },

  // Obtener habitaciones por piso
  getRoomsByFloor: async (floor: number): Promise<RoomWithCategory[]> => {
    try {
      const response = await API.get(`/rooms/floor/${floor}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener habitaciones por piso:', error);
      throw error;
    }
  },

  // Buscar habitaciones con filtros
  searchRooms: async (filters: RoomFilters): Promise<RoomWithCategory[]> => {
    try {
      const response = await API.get('/rooms/search', { params: filters });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al buscar habitaciones:', error);
      throw error;
    }
  },

  // Verificar disponibilidad de habitación
  checkAvailability: async (roomId: string | number, checkIn: string, checkOut: string) => {
    try {
      const response = await API.get('/rooms/availability', {
        params: { roomId, checkIn, checkOut },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  },

  // Obtener habitaciones disponibles por fechas
  getAvailableRoomsByDates: async (checkIn: string, checkOut: string): Promise<RoomWithCategory[]> => {
    try {
      const response = await API.get('/rooms/available-by-dates', {
        params: { checkIn, checkOut },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener habitaciones disponibles por fechas:', error);
      throw error;
    }
  },

  // Obtener estadísticas de habitaciones (solo admin)
  getRoomStats: async (): Promise<any[]> => {
    try {
      const response = await API.get('/rooms/admin/stats');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de habitaciones:', error);
      throw error;
    }
  },

  // Actualizar disponibilidad de habitación (solo admin)
  updateAvailability: async (id: string, isAvailable: boolean) => {
    try {
      const response = await API.patch(`/rooms/${id}/availability`, { isAvailable });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      throw error;
    }
  },

  // Establecer mantenimiento de habitación (solo admin)
  setMaintenance: async (id: string, isMaintenance: boolean) => {
    try {
      const response = await API.patch(`/rooms/${id}/maintenance`, { isMaintenance });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al establecer mantenimiento:', error);
      throw error;
    }
  },

  // Obtener fechas ocupadas de una habitación
  getOccupiedDates: async (roomId: string): Promise<string[]> => {
    try {
      const response = await API.get(`/reservations/room/${roomId}/occupied-dates`);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error al obtener fechas ocupadas:', error);
      return [];
    }
  }
};

// Mock temporal, reemplazar por fetch real a la API
export async function getRoomById(id: string | number): Promise<Room> {
  // Aquí se haría la petición real, por ejemplo:
  // const res = await fetch(`/api/rooms/${id}`);
  // if (!res.ok) throw new Error('No se pudo obtener la habitación');
  // return await res.json();
  return {
    id: Number(id),
    name: "Suite Deluxe",
    description: "Habitación amplia con vista al mar, jacuzzi y balcón privado.",
    price: 250,
    capacity: 4,
    bedType: "King Size",
    imageUrls: [
      "/images/room1.jpg",
      "/images/room2.jpg",
      "/images/room3.jpg"
    ],
    amenities: ["WiFi", "Aire acondicionado", "TV Smart", "Minibar", "Caja fuerte"]
  };
}
