import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2 } from 'lucide-react';

const RecruiterLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, role, loading: authLoading } = useAuth();

    // Redirect if user is already logged in
    useEffect(() => {
        if (!authLoading && user) {
            if (role === 'recruiter') {
                navigate('/dashboard', { replace: true });
            } else if (role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (role === 'job_seeker' || role === 'student') {
                navigate('/feed', { replace: true });
            } else {
                navigate('/feed', { replace: true });
            }
        }
    }, [user, role, authLoading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // First, check if user exists and their role BEFORE logging in
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('email', email)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                // PGRST116 is "not found" error, which is fine (user doesn't exist)
                throw profileError;
            }

            // If user exists, check their role
            if (profiles && profiles.role !== 'recruiter') {
                toast({
                    title: "Access Denied",
                    description: "This login is for recruiters only. Please use the correct login page for your account type.",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            // Now proceed with login
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast({
                title: "Welcome back!",
                description: "You have successfully logged in as a recruiter.",
            });

        } catch (error: any) {
            toast({
                title: "Login failed",
                description: error.message || "Please check your credentials",
                variant: "destructive",
            });
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 shadow-xl rounded-2xl border border-purple-100">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Building2 className="h-10 w-10 text-purple-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Recruiter Login</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your recruiter dashboard
                    </p>
                    <div className="mt-4 flex justify-center gap-4 text-xs">
                        <Link to="/login/student" className="text-purple-600 hover:text-purple-500">
                            Student Login
                        </Link>
                        <span className="text-gray-400">|</span>
                        <Link to="/login/professional" className="text-purple-600 hover:text-purple-500">
                            Professional Login
                        </Link>
                    </div>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email-address">Email address</Label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="recruiter@company.com"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Sign in as Recruiter
                    </Button>

                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register?role=recruiter" className="font-medium text-purple-600 hover:text-purple-500">
                            Register as Recruiter
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RecruiterLoginPage;

