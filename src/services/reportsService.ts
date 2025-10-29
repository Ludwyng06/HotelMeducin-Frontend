import API from './api';

export const reportsService = {
  // Obtener usuarios activos (últimos 30 días)
  getActiveUsers: async () => {
    const response = await API.get('/reports/users-active');
    return response.data;
  },

  // Obtener análisis mensual de reservaciones
  getMonthlyReservations: async (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const response = await API.get(`/reports/reservations-monthly?${params.toString()}`);
    return response.data;
  },

  // Obtener análisis de ingresos
  getRevenueAnalysis: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await API.get(`/reports/revenue-analysis?${params.toString()}`);
    return response.data;
  },

  // Obtener ocupación de habitaciones
  getRoomOccupancy: async () => {
    const response = await API.get('/reports/room-occupancy');
    return response.data;
  },

  // Obtener servicios más populares
  getPopularServices: async () => {
    const response = await API.get('/reports/popular-services');
    return response.data;
  },
};
