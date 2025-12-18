import axios from 'axios';

// HTTPS para desarrollo local (con certificados mkcert)
const getBaseURL = () => {
  // Si estamos en el servidor (SSR), usar el nombre del servicio Docker
  // Si estamos en el cliente (navegador), usar localhost
  const isServer = typeof window === 'undefined';
  
  let url: string;
  if (isServer) {
    // En el servidor Next.js dentro de Docker, usar el nombre del servicio
    // En desarrollo local, usar HTTPS
    url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3443';
  } else {
    // En el cliente (navegador), usar HTTPS localhost para desarrollo local
    url = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3443';
  }
  
  return url;
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});


API.interceptors.request.use(
  (config) => {
    const fullUrl = (config.baseURL || '') + config.url;
    console.log('🌐 Enviando request a:', fullUrl);
    console.log('🌐 Método:', config.method?.toUpperCase());
    console.log('🌐 Headers:', config.headers);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token agregado a la petición');
      } else {
        console.log('🔓 Petición sin token (público)');
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
API.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta recibida:', response.status, response.config.url);
    console.log('✅ Headers de respuesta:', response.headers);
    console.log('✅ Datos de respuesta:', response.data);
    return response;
  },
  (error) => {
    // Manejar error 401 primero (token expirado)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('auth_user');
        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }

    // Evitar logs vacíos o ruidosos
    const isNetworkError = error?.code === 'ERR_NETWORK' || 
                          error?.code === 'ERR_INTERNET_DISCONNECTED' ||
                          error?.code === 'ECONNREFUSED' ||
                          error?.message?.includes('Network Error') ||
                          error?.message?.includes('Failed to fetch');
    const isTimeoutError = error?.code === 'ECONNABORTED';
    const isCanceled = error?.code === 'ERR_CANCELED';
    const status = error?.response?.status;
    const url = error?.config?.url;
    const baseURL = error?.config?.baseURL || process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3443';

    // Si es cancelado: silencioso
    if (isCanceled) {
      return Promise.reject(error);
    }
    
    // Si es error de red o timeout
    if (isNetworkError || isTimeoutError) {
      // Solo mostrar error una vez por sesión para evitar spam en consola
      const errorKey = `network_error_shown_${baseURL}`;
      if (typeof window !== 'undefined' && !sessionStorage.getItem(errorKey)) {
        const fullUrl = baseURL + (url || '');
        const isHttps = baseURL.startsWith('https://');
        
        console.error('❌ Error de conexión con el backend');
        console.error(`   URL intentada: ${fullUrl}`);
        console.error(`   Backend esperado: ${baseURL}`);
        console.error(`   Código de error: ${error?.code || 'desconocido'}`);
        
        if (error?.code === 'ECONNREFUSED') {
          console.error('   💡 El backend no está corriendo o no está escuchando en ese puerto');
          console.error('   💡 Verifica que el backend esté iniciado: cd Backend && npm run start:dev');
        } else if (error?.code === 'ERR_NETWORK') {
          console.error('   💡 Error de red. Verifica tu conexión a internet');
          console.error('   💡 O verifica que el backend esté accesible en:', baseURL);
        } else if (isTimeoutError) {
          console.error('   💡 El backend no respondió a tiempo (timeout)');
          console.error('   💡 Verifica que el backend no esté bloqueado o sobrecargado');
        }
        
        // Nota: Ya no usamos HTTPS en desarrollo local
        
        sessionStorage.setItem(errorKey, 'true');
      }
      
      // Marcar el error para que los servicios sepan que es un error de red
      (error as any).isNetworkError = true;
      
      // Retornar el error original sin crear uno nuevo
      return Promise.reject(error);
    }
    
    // Si es error HTTP del servidor
    if (status || error?.response) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          `Error ${status || 'desconocido'}`;
      
      console.error('❌ Error en respuesta del servidor');
      console.error('   Status:', status || 'N/A');
      console.error('   Mensaje:', errorMessage);
      console.error('   URL:', url || 'N/A');
      
      const httpError = new Error(errorMessage);
      (httpError as any).status = status;
      (httpError as any).response = error?.response;
      return Promise.reject(httpError);
    }
    
    // Error desconocido
    if (error?.message) {
      console.error('❌ Error desconocido:', error.message);
      return Promise.reject(error);
    }
    
    // Si no hay información útil, crear un error genérico
    const genericError = new Error('Error desconocido al comunicarse con el servidor');
    return Promise.reject(genericError);
  }
);

export default API;
