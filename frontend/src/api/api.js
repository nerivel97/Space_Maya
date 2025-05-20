import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para solicitudes
api.interceptors.request.use(
  config => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      // Verificar si es una ruta de autenticación
      const isAuthRoute = ['/auth/login', '/auth/register'].some(route =>
        config.url.includes(route)
      );

      // Si no es ruta de autenticación, requerir token
      if (!isAuthRoute) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          // Solo redirigir si no es una ruta pública
          if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
            window.location.href = '/login?redirect=' +
              encodeURIComponent(window.location.pathname);
          }
          return Promise.reject(new Error('No authentication token found'));
        }
      }
    }

    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
api.interceptors.response.use(
  response => {
    // Calcular tiempo de respuesta para debugging
    if (response.config.metadata) {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;
      console.log(`Request to ${response.config.url} took ${duration}ms`);
    }

    // Puedes procesar la respuesta aquí si es necesario
    return response.data; // Retornar solo los datos para simplificar
  },
  error => {
    // Manejo centralizado de errores
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const { status, data } = error.response;

      console.error(`API Error ${status}:`, data?.message || 'Error desconocido');

      switch (status) {
        case 401:
          // No autorizado - token inválido o expirado
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            const redirect = window.location.pathname !== '/login'
              ? `?redirect=${encodeURIComponent(window.location.pathname)}`
              : '';
            window.location.href = `/login${redirect}`;
          }
          break;

        case 403:
          // Prohibido - permisos insuficientes
          console.error('Acceso denegado:', data?.message);
          break;

        case 404:
          // Recurso no encontrado
          console.error('Recurso no encontrado:', error.config.url);
          break;

        case 429:
          // Demasiadas solicitudes
          console.error('Límite de tasa excedido:', data?.message);
          break;

        case 500:
          // Error interno del servidor
          console.error('Error del servidor:', data?.message || 'Error interno');
          break;

        default:
          console.error('Error no manejado:', status, data);
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      // Algo pasó al configurar la solicitud
      console.error('Error al configurar la solicitud:', error.message);
    }

    // Puedes personalizar el error antes de rechazarlo
    const customError = {
      ...error,
      message: error.response?.data?.message || error.message || 'Error desconocido',
      status: error.response?.status || 0
    };

    return Promise.reject(customError);
  }
);

// Métodos personalizados para facilitar el uso
const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

  // Método para rutas públicas (sin autenticación)
  publicGet: (url, config = {}) => api.get(url, { ...config, publicRoute: true }),
  publicPost: (url, data, config = {}) => api.post(url, data, { ...config, publicRoute: true }),

  // Método para subir archivos
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/markers/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Método para cancelar solicitudes
  cancelToken: () => axios.CancelToken.source()
};

export default apiService;