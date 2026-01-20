
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/types';

// ... imports ...
import { useSearchParams } from 'react-router-dom';

const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const searchParamsRole = searchParams.get('role') as UserRole | null;
    const planId = searchParams.get('plan');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>(searchParamsRole || 'job_seeker');
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                        plan_id: planId, // Storing plan selection in metadata for now
                        cv_url: cvFile ? `https://fake-storage.com/${cvFile.name}` : null // Mock CV url
                    },
                },
            });

            if (error) throw error;

            if (data.session) {
                toast({
                    title: "Account created!",
                    description: "You have successfully registered.",
                });

                // Redirect based on role
                if (role === 'recruiter') {
                    navigate('/dashboard');
                } else {
                    navigate('/feed');
                }
            } else {
                toast({
                    title: "Verification email sent",
                    description: "Please check your email to confirm your account.",
                });
                navigate('/login');
            }

        } catch (error: any) {
            toast({
                title: "Registration failed",
                description: error.message || "Please check your details",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 shadow-lg rounded-xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email-address">Email address</Label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                className="mt-1"
                            />
                        </div>

                        {role === 'job_seeker' && (
                            <div>
                                <Label htmlFor="cv">Upload CV (Optional)</Label>
                                <Input
                                    id="cv"
                                    name="cv"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                                    className="mt-1 cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground mt-1">PDF format only (Max 5MB)</p>
                            </div>
                        )}

                        {!searchParamsRole && (
                            <div className="pt-2">
                                <Label className="text-base">I am a...</Label>
                                <RadioGroup defaultValue="job_seeker" value={role} onValueChange={(val) => setRole(val as UserRole)} className="mt-2 flex space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="job_seeker" id="r-seeker" />
                                        <Label htmlFor="r-seeker">Job Seeker</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="recruiter" id="r-recruiter" />
                                        <Label htmlFor="r-recruiter">Recruiter</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {planId ? 'Sign up & Subscribe' : 'Sign up'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
