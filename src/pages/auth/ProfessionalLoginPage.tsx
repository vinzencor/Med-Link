import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase } from 'lucide-react';

const ProfessionalLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, role, loading: authLoading } = useAuth();

    // Redirect if user is already logged in
    useEffect(() => {
        if (!authLoading && user) {
            if (role === 'job_seeker') {
                navigate('/feed', { replace: true });
            } else if (role === 'recruiter') {
                navigate('/dashboard', { replace: true });
            } else if (role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (role === 'student') {
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
            if (profiles && profiles.role !== 'job_seeker') {
                toast({
                    title: "Access Denied",
                    description: "This login is for professionals only. Please use the correct login page for your account type.",
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
                description: "You have successfully logged in as a professional.",
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
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 shadow-xl rounded-2xl border border-green-100">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <Briefcase className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Professional Login</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your professional account
                    </p>
                    <div className="mt-4 flex justify-center gap-4 text-xs">
                        <Link to="/login/student" className="text-green-600 hover:text-green-500">
                            Student Login
                        </Link>
                        <span className="text-gray-400">|</span>
                        <Link to="/login/recruiter" className="text-green-600 hover:text-green-500">
                            Recruiter Login
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
                                placeholder="professional@example.com"
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

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Sign in as Professional
                    </Button>

                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register?role=job_seeker" className="font-medium text-green-600 hover:text-green-500">
                            Register as Professional
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ProfessionalLoginPage;

