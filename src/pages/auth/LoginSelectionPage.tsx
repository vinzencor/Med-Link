import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Briefcase, Building2 } from 'lucide-react';

const LoginSelectionPage = () => {
    const navigate = useNavigate();

    const loginOptions = [
        {
            title: 'Student',
            description: 'Access your student account to find internships and entry-level positions',
            icon: GraduationCap,
            color: 'blue',
            path: '/login/student',
            gradient: 'from-blue-500 to-indigo-600'
        },
        {
            title: 'Professional',
            description: 'Access your professional account to find healthcare jobs',
            icon: Briefcase,
            color: 'green',
            path: '/login/professional',
            gradient: 'from-green-500 to-emerald-600'
        },
        {
            title: 'Recruiter',
            description: 'Access your recruiter dashboard to post jobs and manage applications',
            icon: Building2,
            color: 'purple',
            path: '/login/recruiter',
            gradient: 'from-purple-500 to-violet-600'
        }
    ];

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        Welcome to HealWell Recruitment
                    </h1>
                    <p className="text-lg text-gray-600">
                        Choose your account type to sign in
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loginOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <div
                                key={option.title}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300"
                            >
                                <div className={`h-32 bg-gradient-to-br ${option.gradient} flex items-center justify-center`}>
                                    <Icon className="h-16 w-16 text-white" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {option.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6 min-h-[60px]">
                                        {option.description}
                                    </p>
                                    <Button
                                        onClick={() => navigate(option.path)}
                                        className={`w-full bg-gradient-to-r ${option.gradient} hover:opacity-90 text-white`}
                                    >
                                        Sign in as {option.title}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center space-y-2">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Create an account
                        </a>
                    </p>
                    <p className="text-xs text-gray-400">
                        <a href="/admin/login/superuser" className="hover:text-gray-600">
                            Admin Access
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginSelectionPage;

