import { useState, useEffect } from 'react';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';
import AuthContext from './AuthContext';

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setCurrentUser({ id: decoded.userId });
          setIsAdmin(decoded.isAdmin);
          
          // Verificación adicional con el backend
          const response = await api.get('/auth/verify-admin');
          setIsAdmin(response.data.isAdmin);
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Error verifying token:', error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      
      const decoded = jwtDecode(response.data.token);
      setCurrentUser({ id: decoded.userId });
      setIsAdmin(decoded.isAdmin);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      const response = await api.post('/auth/register', { email, password });
      localStorage.setItem('token', response.data.token);
      
      const decoded = jwtDecode(response.data.token);
      setCurrentUser({ id: decoded.userId });
      setIsAdmin(decoded.isAdmin);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const value = {
    currentUser,
    isAdmin,
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