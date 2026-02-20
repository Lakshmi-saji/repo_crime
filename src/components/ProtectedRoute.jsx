import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, role }) {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="spinner" /></div>;
    if (!currentUser) return <Navigate to="/login" replace />;
    if (role && userRole !== role) return <Navigate to="/" replace />;

    return children;
}
