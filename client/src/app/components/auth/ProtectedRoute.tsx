import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  role?: 'patient' | 'doctor' | 'admin';
}

const fallbackPaths: Record<string, string> = {
  patient: '/my-appointments',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    const target = userRole ? fallbackPaths[userRole] || '/' : '/login';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
