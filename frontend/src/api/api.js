import axios from 'axios';
import { io } from 'socket.io-client';

// Configuración de Axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Configuración de Socket.io
const socket = io('http://localhost:5000', {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 5000,
  transports: ['websocket'] // Fuerza usar WebSocket
});


// Función para conectar socket con autenticación
const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (token && !socket.connected) {
    socket.auth = { token };
    socket.connect();
  }
};

// Interceptor para solicitudes Axios
api.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const isAuthRoute = ['/auth/login', '/auth/register'].some(route =>
        config.url.includes(route)
      );

      if (!isAuthRoute) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (!window.location.pathname.includes('/login') &&
                 !window.location.pathname.includes('/register')) {
          window.location.href = '/login?redirect=' +
            encodeURIComponent(window.location.pathname);
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

// Interceptor para respuestas Axios
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Redirigir a login si no está autenticado
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Objeto API mejorado
const apiService = {
  // Métodos HTTP
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  
  // Métodos públicos
  publicGet: (url, config = {}) => api.get(url, { ...config, publicRoute: true }),
  publicPost: (url, data, config = {}) => api.post(url, data, { ...config, publicRoute: true }),
  
  // Métodos para archivos
  uploadImage: (file, isMyth = false) => {
  const formData = new FormData();
  formData.append('image', file);
  const endpoint = isMyth ? '/myths/upload-image' : '/markers/upload-image';
  
  return api.post(endpoint, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('token')}` // Asegura autenticación
    }
  });
},
  
  // Métodos para Socket.io
  socket,
  connectSocket,
  joinGroup: (groupId) => socket.emit('joinGroup', groupId),
  sendMessage: (messageData) => socket.emit('newMessage', messageData),
  onMessageReceived: (callback) => socket.on('messageReceived', callback),
  disconnectSocket: () => socket.disconnect(),
  
  // Utilidades
  cancelToken: () => axios.CancelToken.source()
};

export default apiService;