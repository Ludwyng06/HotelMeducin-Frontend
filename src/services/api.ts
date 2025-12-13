import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});


API.interceptors.request.use(
  (config) => {
    console.log('🌐 Enviando request a:', (config.baseURL || '') + config.url);
    console.log('🔥 CÓDIGO ACTUALIZADO - VERSIÓN 2.0');
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
API.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta recibida:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Evitar logs vacíos o ruidosos
    const isNetworkError = error?.code === 'ERR_NETWORK' || error?.code === 'ERR_INTERNET_DISCONNECTED';
    const isTimeoutError = error?.code === 'ECONNABORTED';
    const isCanceled = error?.code === 'ERR_CANCELED';
    const status = error?.response?.status;
    const url = error?.config?.url;

    // Si es cancelado/timeout/red: no loggear como error ruidoso
    if (isCanceled) {
      // silencioso
    } else if (isNetworkError || isTimeoutError) {
      console.warn('⚠️ Error de conexión:', error?.message || 'Sin conexión');
    } else if (status || error?.message) {
      console.error('❌ Error en respuesta:', {
        message: error?.message || 'Sin mensaje',
        code: error?.code || 'Sin código',
        status: status || 'Sin status',
        url: url || 'Sin URL'
      });
    }

    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
