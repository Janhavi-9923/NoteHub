import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap any page in this to require login. If not logged in, redirect to /login.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
