import { useAuth } from '../context/useAuth';
import { Navigate } from 'react-router-dom';

export function PrivateRoute({ children, adminOnly = false }) {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // O un spinner
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}