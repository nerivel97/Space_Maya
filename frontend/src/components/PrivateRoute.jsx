import useAuth from '../context/useAuth';
import { Navigate } from 'react-router-dom';

export function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Cargando...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}