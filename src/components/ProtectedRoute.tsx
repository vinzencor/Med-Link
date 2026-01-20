
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        // Redirect to landing page or login if not authenticated
        return <Navigate to="/get-started" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Redirect based on role if they try to access unauthorized area
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'recruiter') return <Navigate to="/dashboard" replace />;
        if (role === 'job_seeker') return <Navigate to="/feed" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
