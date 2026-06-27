import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'FARMER':
      return <Navigate to="/farmer/extract" replace />;
    case 'BUYER':
      return <Navigate to="/buyer/recommendations" replace />;
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
