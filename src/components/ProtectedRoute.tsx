
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, role, loading } = useAuth();

    console.log('🛡️ ProtectedRoute - loading:', loading, 'user:', !!user, 'role:', role);

    if (loading) {
        console.log('⏳ Still loading auth...');
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        console.log('❌ No user, redirecting to login');
        // Redirect to login page if not authenticated
        return <Navigate to="/login" replace />;
    }

    // If user exists but role is still loading, show loading
    if (allowedRoles && !role) {
        console.log('⏳ User exists but role not loaded yet...');
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        console.log('🚫 Role not allowed, redirecting based on role:', role);
        // Redirect based on role if they try to access unauthorized area
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'recruiter') return <Navigate to="/dashboard" replace />;
        if (role === 'job_seeker' || role === 'student') return <Navigate to="/feed" replace />;
        return <Navigate to="/" replace />;
    }

    console.log('✅ Access granted');
    return <Outlet />;
};
