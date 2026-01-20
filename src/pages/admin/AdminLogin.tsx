
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (email !== 'rahulpradeepan55@gmail.com') {
            toast({
                title: "Access Denied",
                description: "You are not authorized to access the admin panel.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                navigate('/admin/dashboard');
                toast({
                    title: "Admin Access Granted",
                    description: "Welcome, Superuser.",
                });
            }
        } catch (error: any) {
            toast({
                title: "Login failed",
                description: error.message || "Invalid credentials",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-gray-800 p-8 shadow-2xl rounded-xl border border-gray-700">
                <div className="text-center flex flex-col items-center">
                    <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-3xl font-extrabold text-white">Superuser Login</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Restricted Access Area
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email-address" className="text-gray-300">Admin Email</Label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 bg-gray-700 border-gray-600 text-white"
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="text-gray-300">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 bg-gray-700 border-gray-600 text-white"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Authenticate
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
