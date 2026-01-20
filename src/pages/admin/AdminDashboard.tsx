
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';

const AdminDashboard = () => {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/admin/login/superuser');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar - simplified for now */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">HealWell Admin</h1>
                    <p className="text-xs text-gray-400 mt-1">Superuser Control</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                        <Users className="mr-2 h-4 w-4" /> Users
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                        <FileText className="mr-2 h-4 w-4" /> Jobs
                    </Button>
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center font-bold">
                            A
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-64 p-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                        <p className="text-3xl font-bold mt-2">--</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-medium">Active Jobs</h3>
                        <p className="text-3xl font-bold mt-2">--</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-medium">Pending Applications</h3>
                        <p className="text-3xl font-bold mt-2">--</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
