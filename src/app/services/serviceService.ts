import API from './api';

export const serviceService = {
  // Obtener todos los servicios
  getAllServices: async () => {
    const response = await API.get('/services');
    return response.data;
  },

  // Obtener servicios disponibles
  getAvailableServices: async () => {
    const response = await API.get('/services?available=true');
    return response.data;
  },

  // Obtener servicios por categoría
  getServicesByCategory: async (category: string) => {
    const response = await API.get(`/services?category=${category}`);
    return response.data;
  },

  // Obtener servicio por ID
  getServiceById: async (id: string | number) => {
    const response = await API.get(`/services/${id}`);
    return response.data;
  },

  // Reservar servicio
  bookService: async (serviceData: {
    serviceId: string;
    userId: string;
    reservationDate: string;
    specialRequests?: string;
  }) => {
    const response = await API.post('/services/book', serviceData);
    return response.data;
  },

  // Crear nuevo servicio (solo admin)
  createService: async (serviceData: {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
  }) => {
    const response = await API.post('/services', serviceData);
    return response.data;
  },

  // Actualizar servicio (solo admin)
  updateService: async (id: string | number, serviceData: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    isAvailable?: boolean;
    imageUrl?: string;
  }) => {
    const response = await API.patch(`/services/${id}`, serviceData);
    return response.data;
  },

  // Eliminar servicio (solo admin)
  deleteService: async (id: string | number) => {
    const response = await API.delete(`/services/${id}`);
    return response.data;
  },
}; 