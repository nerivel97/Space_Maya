import { useState, useEffect } from 'react';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';
import AuthContext from './AuthContext';

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializa la autenticación al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setCurrentUser({ id: decoded.userId });
          
          // Verificación opcional con el backend
          await api.get('/auth/verify');
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Error verifying token:', error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      
      const decoded = jwtDecode(response.data.token);
      setCurrentUser({ id: decoded.userId });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Función para registrarse
  const register = async (email, password) => {
    try {
      const response = await api.post('/auth/register', { email, password });
      localStorage.setItem('token', response.data.token);
      
      const decoded = jwtDecode(response.data.token);
      setCurrentUser({ id: decoded.userId });
      
      return true;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Valor que proveerá el contexto
  const value = {
    currentUser,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;