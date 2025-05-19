import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor para agregar el token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Redirigir a login si no hay token (opcional)
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor de respuestas
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.log('Token inválido o expirado - redirigiendo a login');
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 500) {
      console.error('Error del servidor:', error.response.data);
      // Puedes mostrar un mensaje al usuario aquí
    }
    return Promise.reject(error);
  }
);

export default api;