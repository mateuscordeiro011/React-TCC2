// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading, isCliente, isFuncionario } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado e não houver roles específicas exigidas, permite acesso
  if (allowedRoles.length === 0) {
    return children;
  }

  // Verifica se o usuário tem uma das roles permitidas
  const userHasRequiredRole = allowedRoles.includes(user?.tipo);
  
  if (!userHasRequiredRole) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return children;
};

export default ProtectedRoute;