import { useState, useEffect } from 'react';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';
import AuthContext from './AuthContext';
import axios from 'axios';

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setCurrentUser({ id: decoded.userId, email: decoded.email });
          setIsAdmin(decoded.isAdmin || false);
          
          // Verificación adicional con el backend
          try {
            const adminStatus = await api.get('/auth/verify-admin');
            setIsAdmin(adminStatus.isAdmin || false);
          } catch (error) {
            console.error('Admin verification error:', error);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Token verification error:', error);
          localStorage.removeItem('token');
          setAuthError('La sesión ha expirado');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
  try {
    // Crear una instancia temporal de axios sin interceptores para el login
    const authApi = axios.create({
      baseURL: 'http://localhost:5000/api',
      timeout: 10000
    });

    const response = await authApi.post('/auth/login', { email, password });
    
    if (!response.data.token) {
      throw new Error('No se recibió token de autenticación');
    }

    localStorage.setItem('token', response.data.token);
    const decoded = jwtDecode(response.data.token);
    
    setCurrentUser({ 
      id: decoded.userId, 
      email: decoded.email 
    });
    setIsAdmin(decoded.isAdmin || false);
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Credenciales incorrectas';
    
    if (error.response) {
      // Manejar errores específicos del backend
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

  const register = async (email, password, profile = {}) => {
  try {
    const authApi = axios.create({
      baseURL: 'http://localhost:5000/api',
      timeout: 10000
    });

    const response = await authApi.post('/auth/register', { 
      email, 
      password,
      profile 
    });
    
    if (!response.data.token) {
      throw new Error('No se recibió token de autenticación');
    }

    localStorage.setItem('token', response.data.token);
    const decoded = jwtDecode(response.data.token);
    
    setCurrentUser({ 
      id: decoded.userId,
      email: decoded.email,
      profile: {
        name: profile.name,
        lastname: profile.lastname,
        avatar: profile.avatar
      }
    });
    setIsAdmin(decoded.isAdmin || false);
    
    return true;
  } catch (error) {
    console.error('Register error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Error en el registro');
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAdmin(false);
    setAuthError(null);
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    authError,
    login,
    register,
    logout,
    setAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;