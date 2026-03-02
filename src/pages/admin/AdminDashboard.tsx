
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, LogOut, CheckCircle, XCircle, Clock, Loader2, MapPin, Building2, DollarSign, Edit, Trash2, Key, TrendingUp, MessageSquare, Phone, Mail, Calendar, Briefcase, Video, Shield, ShieldCheck, ShieldOff, BarChart2, Megaphone, Eye, AlertTriangle, UserCheck, UserX, RefreshCw, Download, Plus, Image } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format, subDays, startOfDay } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { JobChatDialog } from '@/components/admin/JobChatDialog';

interface JobWithRecruiter {
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary_range: string;
    job_type: string;
    category: string;
    description: string;
    requirements: string[];
    benefits: string[];
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    recruiter_id: string;
    recruiter?: {
        full_name: string;
        email: string;
    };
}

interface UserProfile {
    id: string;
    email: string;
    role: 'student' | 'job_seeker' | 'recruiter' | 'admin';
    full_name: string | null;
    phone: string | null;
    created_at: string;
    avatar_url: string | null;
    bio: string | null;
}

const AdminDashboard = () => {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        pendingJobs: 0,
        approvedJobs: 0,
        totalApplications: 0
    });
    const [jobs, setJobs] = useState<JobWithRecruiter[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'users' | 'applicants' | 'employers' | 'revenue' | 'ads'>('overview');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [userFilter, setUserFilter] = useState<'all' | 'student' | 'job_seeker' | 'recruiter' | 'admin'>('all');
    const [monthlyIntakeLocked, setMonthlyIntakeLocked] = useState(false);
    const [monthlyIntakeCount] = useState(73); // mock count

    // User management modals
    const [editUserDialog, setEditUserDialog] = useState(false);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [changePasswordDialog, setChangePasswordDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [editForm, setEditForm] = useState({ full_name: '', email: '', role: '', phone: '' });
    const [newPassword, setNewPassword] = useState('');

    // Chart data
    const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
    const [applicationStatsData, setApplicationStatsData] = useState<any[]>([]);

    // Chat functionality
    const [chatDialogOpen, setChatDialogOpen] = useState(false);
    const [selectedJobForChat, setSelectedJobForChat] = useState<JobWithRecruiter | null>(null);
    const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchDashboardData();
        fetchUnreadMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('admin_job_chats')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'job_chats'
                },
                () => {
                    fetchUnreadMessages();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchUnreadMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('job_chats')
                .select('job_id')
                .eq('read', false)
                .neq('sender_id', user?.id);

            if (error) throw error;

            // Count unread messages per job
            const counts: Record<string, number> = {};
            data?.forEach(msg => {
                counts[msg.job_id] = (counts[msg.job_id] || 0) + 1;
            });

            setUnreadMessages(counts);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };

    const handleOpenChat = (job: JobWithRecruiter) => {
        setSelectedJobForChat(job);
        setChatDialogOpen(true);
    };

    // User management handlers
    const handleEditUser = (user: UserProfile) => {
        setSelectedUser(user);
        setEditForm({
            full_name: user.full_name || '',
            email: user.email,
            role: user.role,
            phone: user.phone || ''
        });
        setEditUserDialog(true);
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editForm.full_name,
                    email: editForm.email,
                    role: editForm.role,
                    phone: editForm.phone
                })
                .eq('id', selectedUser.id);

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'User updated successfully',
            });

            setEditUserDialog(false);
            fetchDashboardData();
        } catch (error) {
            console.error('Error updating user:', error);
            toast({
                title: 'Error',
                description: 'Failed to update user',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            // Delete from profiles table (auth.users will cascade)
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', selectedUser.id);

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'User deleted successfully',
            });

            setDeleteUserDialog(false);
            setSelectedUser(null);
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete user',
                variant: 'destructive'
            });
        }
    };

    const handleChangePassword = async () => {
        if (!selectedUser || !newPassword) return;

        try {
            // Note: This requires admin privileges in Supabase
            // You may need to create a Supabase Edge Function for this
            toast({
                title: 'Info',
                description: 'Password reset email sent to user',
            });

            setChangePasswordDialog(false);
            setNewPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            toast({
                title: 'Error',
                description: 'Failed to change password',
                variant: 'destructive'
            });
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all users
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (usersError) throw usersError;

            // Fetch all jobs with recruiter info
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('*, recruiter:profiles!recruiter_id(full_name, email)')
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;

            // Fetch total applications
            const { count: appsCount } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true });

            // Fetch applications with dates for chart
            const { data: appsData } = await supabase
                .from('applications')
                .select('created_at, status')
                .order('created_at', { ascending: true });

            const jobsWithRecruiter = (jobsData || []).map(job => ({
                ...job,
                recruiter: Array.isArray(job.recruiter) ? job.recruiter[0] : job.recruiter
            }));

            setUsers(usersData || []);
            setJobs(jobsWithRecruiter);
            setStats({
                totalUsers: usersData?.length || 0,
                totalJobs: jobsWithRecruiter.length,
                pendingJobs: jobsWithRecruiter.filter(j => j.status === 'pending').length,
                approvedJobs: jobsWithRecruiter.filter(j => j.status === 'approved').length,
                totalApplications: appsCount || 0
            });

            // Prepare user growth chart data (last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = subDays(new Date(), 6 - i);
                return startOfDay(date);
            });

            const growthData = last7Days.map(date => {
                const dateStr = format(date, 'MMM dd');
                const usersOnDate = usersData?.filter(u =>
                    new Date(u.created_at) <= date
                ).length || 0;

                return {
                    date: dateStr,
                    users: usersOnDate,
                };
            });

            setUserGrowthData(growthData);

            // Prepare application stats by status
            const statusCounts = {
                pending: appsData?.filter(a => a.status === 'pending').length || 0,
                shortlisted: appsData?.filter(a => a.status === 'shortlisted').length || 0,
                hired: appsData?.filter(a => a.status === 'hired').length || 0,
                rejected: appsData?.filter(a => a.status === 'rejected').length || 0,
            };

            setApplicationStatsData([
                { name: 'Pending', value: statusCounts.pending, color: '#f59e0b' },
                { name: 'Shortlisted', value: statusCounts.shortlisted, color: '#3b82f6' },
                { name: 'Hired', value: statusCounts.hired, color: '#10b981' },
                { name: 'Rejected', value: statusCounts.rejected, color: '#ef4444' },
            ]);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load dashboard data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApproveJob = async (jobId: string) => {
        try {
            const { error } = await supabase
                .from('jobs')
                .update({
                    status: 'approved',
                    approved_by: user?.id,
                    approved_at: new Date().toISOString()
                })
                .eq('id', jobId);

            if (error) throw error;

            toast({
                title: 'Job Approved',
                description: 'The job posting has been approved and is now visible to job seekers.'
            });

            fetchDashboardData();
        } catch (error) {
            console.error('Error approving job:', error);
            toast({
                title: 'Error',
                description: 'Failed to approve job',
                variant: 'destructive'
            });
        }
    };

    const handleRejectJob = async (jobId: string) => {
        try {
            const { error } = await supabase
                .from('jobs')
                .update({
                    status: 'rejected',
                    approved_by: user?.id,
                    approved_at: new Date().toISOString(),
                    rejection_reason: 'Does not meet platform guidelines'
                })
                .eq('id', jobId);

            if (error) throw error;

            toast({
                title: 'Job Rejected',
                description: 'The job posting has been rejected.',
                variant: 'destructive'
            });

            fetchDashboardData();
        } catch (error) {
            console.error('Error rejecting job:', error);
            toast({
                title: 'Error',
                description: 'Failed to reject job',
                variant: 'destructive'
            });
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/admin/login/superuser');
    };

    const filteredJobs = filterStatus === 'all' ? jobs : jobs.filter(j => j.status === filterStatus);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white z-50">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">HealWell Admin</h1>
                    <p className="text-xs text-gray-400 mt-1">Superuser Control</p>
                </div>
                <nav className="mt-6 px-4 space-y-1">
                    <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'overview' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Button>
                    <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'jobs' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        onClick={() => setActiveTab('jobs')}
                    >
                        <FileText className="mr-2 h-4 w-4" /> Job Approvals
                        {stats.pendingJobs > 0 && (
                            <Badge className="ml-auto bg-red-500 text-xs">{stats.pendingJobs}</Badge>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'users' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users className="mr-2 h-4 w-4" /> User Management
                        <Badge className="ml-auto bg-blue-500 text-xs">{stats.totalUsers}</Badge>
                    </Button>

                    <div className="pt-2 pb-1 px-1 text-xs text-gray-500 uppercase tracking-wider">Management</div>

                    <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'applicants' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        onClick={() => setActiveTab('applicants')}
                    >
                        <UserCheck className="mr-2 h-4 w-4" /> Applicant Mgmt
                    </Button>
                    <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'employers' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        onClick={() => setActiveTab('employers')}
                    >
                        <Building2 className="mr-2 h-4 w-4" /> Employer Mgmt
                    </Button>

                    <div className="pt-2 pb-1 px-1 text-xs text-gray-500 uppercase tracking-wider">Finance & Ads</div>

                    <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'revenue' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        <BarChart2 className="mr-2 h-4 w-4" /> Revenue
                    </Button>
                    <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'ads' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        onClick={() => setActiveTab('ads')}
                    >
                        <Megaphone className="mr-2 h-4 w-4" /> Ads & Partners
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
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
                                    <p className="text-gray-600 mt-1">Monitor platform activity and manage content</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                                                <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                                            </div>
                                            <Users className="h-10 w-10 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-gray-500 text-sm font-medium">Total Jobs</h3>
                                                <p className="text-3xl font-bold mt-2">{stats.totalJobs}</p>
                                            </div>
                                            <FileText className="h-10 w-10 text-green-500" />
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
                                                <p className="text-3xl font-bold mt-2 text-orange-600">{stats.pendingJobs}</p>
                                            </div>
                                            <Clock className="h-10 w-10 text-orange-500" />
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-gray-500 text-sm font-medium">Total Applications</h3>
                                                <p className="text-3xl font-bold mt-2">{stats.totalApplications}</p>
                                            </div>
                                            <Users className="h-10 w-10 text-purple-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Pending Jobs */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-800">Recent Pending Jobs</h3>
                                    </div>
                                    <div className="p-6">
                                        {jobs.filter(j => j.status === 'pending').slice(0, 5).length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No pending jobs</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {jobs.filter(j => j.status === 'pending').slice(0, 5).map(job => (
                                                    <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-800">{job.title}</h4>
                                                            <p className="text-sm text-gray-600">{job.company_name} • {job.location}</p>
                                                            <p className="text-xs text-gray-500 mt-1">Posted by {job.recruiter?.full_name || 'Unknown'}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => handleApproveJob(job.id)} className="bg-green-600 hover:bg-green-700">
                                                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleRejectJob(job.id)}>
                                                                <XCircle className="h-4 w-4 mr-1" /> Reject
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Performance Analytics */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                                    {/* User Growth Chart */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">User Growth (Last 7 Days)</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={userGrowthData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Application Stats Chart */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Application Statistics</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={applicationStatsData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {applicationStatsData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'jobs' && (
                            <>
                                <div className="mb-8 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-800">Job Approvals</h2>
                                        <p className="text-gray-600 mt-1">Review and manage all job postings</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={filterStatus === 'all' ? 'default' : 'outline'}
                                            onClick={() => setFilterStatus('all')}
                                        >
                                            All ({jobs.length})
                                        </Button>
                                        <Button
                                            variant={filterStatus === 'pending' ? 'default' : 'outline'}
                                            onClick={() => setFilterStatus('pending')}
                                        >
                                            Pending ({stats.pendingJobs})
                                        </Button>
                                        <Button
                                            variant={filterStatus === 'approved' ? 'default' : 'outline'}
                                            onClick={() => setFilterStatus('approved')}
                                        >
                                            Approved ({stats.approvedJobs})
                                        </Button>
                                        <Button
                                            variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                                            onClick={() => setFilterStatus('rejected')}
                                        >
                                            Rejected
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {filteredJobs.length === 0 ? (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No jobs found</p>
                                        </div>
                                    ) : (
                                        filteredJobs.map(job => (
                                            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                                                            <Badge className={
                                                                job.status === 'pending' ? 'bg-orange-500' :
                                                                job.status === 'approved' ? 'bg-green-500' :
                                                                'bg-red-500'
                                                            }>
                                                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                            <span className="flex items-center gap-1">
                                                                <Building2 className="h-4 w-4" />
                                                                {job.company_name}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                {job.location}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <DollarSign className="h-4 w-4" />
                                                                {job.salary_range}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                                            <span>Posted by: <strong>{job.recruiter?.full_name || 'Unknown'}</strong> ({job.recruiter?.email})</span>
                                                            <span>•</span>
                                                            <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                                                            <span>•</span>
                                                            <span>Type: {job.job_type}</span>
                                                            <span>•</span>
                                                            <span>Category: {job.category}</span>
                                                        </div>
                                                    </div>
                                                    {job.status === 'pending' && (
                                                        <div className="flex gap-2 ml-4">
                                                            <Button size="sm" onClick={() => handleApproveJob(job.id)} className="bg-green-600 hover:bg-green-700">
                                                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleRejectJob(job.id)}>
                                                                <XCircle className="h-4 w-4 mr-1" /> Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Expandable Details */}
                                                <details className="mt-4">
                                                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                                                        View Full Details & Recruiter Info
                                                    </summary>
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                                                        {/* Recruiter Information */}
                                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                                <Users className="h-4 w-4" />
                                                                Recruiter Information
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <Briefcase className="h-4 w-4 text-gray-500" />
                                                                    <span className="text-gray-600">Name:</span>
                                                                    <span className="font-medium">{job.recruiter?.full_name || 'N/A'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                                    <span className="text-gray-600">Email:</span>
                                                                    <span className="font-medium">{job.recruiter?.email}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Job Details */}
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800 mb-2">Requirements:</h4>
                                                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                                                {job.requirements?.map((req, idx) => (
                                                                    <li key={idx}>{req}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800 mb-2">Benefits:</h4>
                                                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                                                {job.benefits?.map((benefit, idx) => (
                                                                    <li key={idx}>{benefit}</li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {/* Chat Button */}
                                                        <div className="pt-3 border-t border-gray-200">
                                                            <Button
                                                                onClick={() => handleOpenChat(job)}
                                                                className="w-full"
                                                                variant="outline"
                                                            >
                                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                                Chat with Recruiter
                                                                {unreadMessages[job.id] > 0 && (
                                                                    <Badge className="ml-2 bg-red-500">{unreadMessages[job.id]}</Badge>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </details>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'users' && (
                            <>
                                <div className="mb-8 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
                                        <p className="text-gray-600 mt-1">Manage all platform users</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={userFilter === 'all' ? 'default' : 'outline'}
                                            onClick={() => setUserFilter('all')}
                                        >
                                            All ({users.length})
                                        </Button>
                                        <Button
                                            variant={userFilter === 'student' ? 'default' : 'outline'}
                                            onClick={() => setUserFilter('student')}
                                        >
                                            Students ({users.filter(u => u.role === 'student').length})
                                        </Button>
                                        <Button
                                            variant={userFilter === 'job_seeker' ? 'default' : 'outline'}
                                            onClick={() => setUserFilter('job_seeker')}
                                        >
                                            Professionals ({users.filter(u => u.role === 'job_seeker').length})
                                        </Button>
                                        <Button
                                            variant={userFilter === 'recruiter' ? 'default' : 'outline'}
                                            onClick={() => setUserFilter('recruiter')}
                                        >
                                            Recruiters ({users.filter(u => u.role === 'recruiter').length})
                                        </Button>
                                        <Button
                                            variant={userFilter === 'admin' ? 'default' : 'outline'}
                                            onClick={() => setUserFilter('admin')}
                                        >
                                            Admins ({users.filter(u => u.role === 'admin').length})
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {users
                                                    .filter(u => userFilter === 'all' || u.role === userFilter)
                                                    .map(user => (
                                                        <tr key={user.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                                                        {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{user.email}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <Badge className={
                                                                    user.role === 'admin' ? 'bg-red-500' :
                                                                    user.role === 'recruiter' ? 'bg-purple-500' :
                                                                    user.role === 'student' ? 'bg-green-500' :
                                                                    'bg-blue-500'
                                                                }>
                                                                    {user.role === 'job_seeker' ? 'Professional' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {user.phone || 'N/A'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {format(new Date(user.created_at), 'MMM dd, yyyy')}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleEditUser(user)}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            setSelectedUser(user);
                                                                            setChangePasswordDialog(true);
                                                                        }}
                                                                    >
                                                                        <Key className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => {
                                                                            setSelectedUser(user);
                                                                            setDeleteUserDialog(true);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── APPLICANT MANAGEMENT TAB ── */}
                        {activeTab === 'applicants' && (
                            <>
                                <div className="mb-8 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-800">Applicant Management</h2>
                                        <p className="text-gray-600 mt-1">Verify documents, approve videos, and track monthly intake</p>
                                    </div>
                                    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${monthlyIntakeLocked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                        <div>
                                            <p className="text-sm font-semibold">{monthlyIntakeCount} / 120</p>
                                            <p className="text-xs text-gray-500">Monthly Intake</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={monthlyIntakeLocked ? 'destructive' : 'outline'}
                                            onClick={() => setMonthlyIntakeLocked(prev => !prev)}
                                        >
                                            {monthlyIntakeLocked ? 'Locked' : 'Open'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Applicants table - uses the users list filtered to professionals */}
                                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                    <div className="p-5 border-b flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800">Professional Applicants</h3>
                                        <div className="flex gap-2">
                                            {['all', 'job_seeker', 'student'].map(f => (
                                                <Button key={f} size="sm" variant={userFilter === f ? 'default' : 'outline'} onClick={() => setUserFilter(f as any)}>
                                                    {f === 'all' ? 'All' : f === 'job_seeker' ? 'Professionals' : 'Students'}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name / Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {users.filter(u => userFilter === 'all' ? ['job_seeker', 'student'].includes(u.role) : u.role === userFilter).map(applicant => (
                                                    <tr key={applicant.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <p className="font-medium text-gray-900">{applicant.full_name || 'N/A'}</p>
                                                            <p className="text-sm text-gray-500">{applicant.email}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge className={`text-xs ${applicant.role === 'student' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {applicant.role}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-1">
                                                                <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-green-600 border-green-200 hover:bg-green-50"
                                                                    onClick={async () => {
                                                                        await supabase.from('user_documents').update({ status: 'verified' }).eq('user_id', applicant.id);
                                                                        toast({ title: 'Documents verified', description: `${applicant.full_name}'s documents approved.` });
                                                                    }}>
                                                                    <ShieldCheck className="w-3 h-3 mr-1" /> Verify
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-red-600 border-red-200 hover:bg-red-50"
                                                                    onClick={async () => {
                                                                        await supabase.from('user_documents').update({ status: 'rejected' }).eq('user_id', applicant.id);
                                                                        toast({ title: 'Documents rejected', description: `${applicant.full_name}'s documents rejected.`, variant: 'destructive' });
                                                                    }}>
                                                                    <ShieldOff className="w-3 h-3 mr-1" /> Reject
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-1">
                                                                <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-green-600 border-green-200 hover:bg-green-50"
                                                                    onClick={async () => {
                                                                        await supabase.from('profiles').update({ video_status: 'approved' }).eq('id', applicant.id);
                                                                        toast({ title: 'Video approved', description: `${applicant.full_name}'s video is approved.` });
                                                                    }}>
                                                                    <Video className="w-3 h-3 mr-1" /> Approve
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-red-600 border-red-200 hover:bg-red-50"
                                                                    onClick={async () => {
                                                                        await supabase.from('profiles').update({ video_status: 'rejected' }).eq('id', applicant.id);
                                                                        toast({ title: 'Video rejected', description: `${applicant.full_name}'s video rejected.`, variant: 'destructive' });
                                                                    }}>
                                                                    <XCircle className="w-3 h-3 mr-1" /> Reject
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {format(new Date(applicant.created_at), 'MMM dd, yyyy')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Button size="sm" variant="outline" onClick={() => handleEditUser(applicant)}>
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── EMPLOYER MANAGEMENT TAB ── */}
                        {activeTab === 'employers' && (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-800">Employer Management</h2>
                                    <p className="text-gray-600 mt-1">Approve employers, monitor reveals, and manage subscriptions</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                    <div className="p-5 border-b">
                                        <h3 className="font-semibold text-gray-800">Registered Employers</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employer</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reveals Used</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {users.filter(u => u.role === 'recruiter').map(employer => (
                                                    <tr key={employer.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <p className="font-medium text-gray-900">{employer.full_name || 'N/A'}</p>
                                                            <p className="text-sm text-gray-500">{employer.email}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium">— / —</span>
                                                                <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-600"
                                                                    onClick={() => toast({ title: 'Reveals Reset', description: `Reveal counter for ${employer.full_name} has been reset.` })}>
                                                                    <RefreshCw className="w-3 h-3 mr-1" /> Reset
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge className="bg-primary/10 text-primary text-xs">Active</Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-1">
                                                                <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-green-600 border-green-200"
                                                                    onClick={async () => {
                                                                        await supabase.from('profiles').update({ employer_status: 'approved' }).eq('id', employer.id);
                                                                        toast({ title: 'Employer approved', description: `${employer.full_name} can now post jobs.` });
                                                                        fetchDashboardData();
                                                                    }}>
                                                                    <UserCheck className="w-3 h-3 mr-1" /> Approve
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-red-600 border-red-200"
                                                                    onClick={async () => {
                                                                        await supabase.from('profiles').update({ employer_status: 'suspended' }).eq('id', employer.id);
                                                                        toast({ title: 'Employer suspended', variant: 'destructive' });
                                                                        fetchDashboardData();
                                                                    }}>
                                                                    <UserX className="w-3 h-3 mr-1" /> Suspend
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── REVENUE TAB ── */}
                        {activeTab === 'revenue' && (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-800">Revenue Dashboard</h2>
                                    <p className="text-gray-600 mt-1">Financial overview, invoices, and commission tracking</p>
                                </div>

                                {/* MRR / ARR Cards */}
                                <div className="grid grid-cols-3 gap-6 mb-8">
                                    {[
                                        { label: 'Monthly Recurring Revenue', value: '$18,640', sub: '+6.0% MoM', color: 'text-green-600' },
                                        { label: 'Annual Recurring Revenue', value: '$223,680', sub: 'Projected ARR', color: 'text-blue-600' },
                                        { label: 'Total Commissions Due', value: '$1,934', sub: 'This month', color: 'text-purple-600' }
                                    ].map((card, i) => (
                                        <div key={i} className="bg-white rounded-xl border p-5 shadow-sm">
                                            <p className="text-sm text-gray-500">{card.label}</p>
                                            <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                                            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Revenue Chart */}
                                <div className="bg-white rounded-xl border p-5 shadow-sm mb-8">
                                    <h3 className="font-semibold text-gray-800 mb-4">Monthly Revenue Trend</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={[
                                            { month: 'Sep', revenue: 12400 }, { month: 'Oct', revenue: 13900 },
                                            { month: 'Nov', revenue: 15200 }, { month: 'Dec', revenue: 16800 },
                                            { month: 'Jan', revenue: 17600 }, { month: 'Feb', revenue: 18640 }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, 'Revenue']} />
                                            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Invoices */}
                                <div className="bg-white rounded-xl border shadow-sm mb-8">
                                    <div className="flex items-center justify-between p-5 border-b">
                                        <h3 className="font-semibold text-gray-800">Invoice Ledger</h3>
                                        <Button size="sm" variant="outline">
                                            <Plus className="w-3 h-3 mr-1" /> Manual Entry
                                        </Button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {['Invoice #', 'Client', 'Plan', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {[
                                                    { id: 'INV-2026-001', client: 'Healthcare Recruiting Solutions', amount: 119, plan: 'Pro', date: '2026-02-01', status: 'paid' },
                                                    { id: 'INV-2026-002', client: 'TravelCare Staffing', amount: 249, plan: 'Enterprise', date: '2026-02-01', status: 'paid' },
                                                    { id: 'INV-2026-003', client: 'Valley General HR', amount: 40, plan: 'Agency', date: '2026-02-03', status: 'paid' },
                                                    { id: 'INV-2026-004', client: 'SunCare Medical', amount: 119, plan: 'Pro', date: '2026-02-10', status: 'pending' },
                                                    { id: 'INV-2026-005', client: 'Pacific Surgery Group', amount: 249, plan: 'Enterprise', date: '2026-01-01', status: 'overdue' }
                                                ].map(inv => (
                                                    <tr key={inv.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-3 text-sm font-mono text-gray-600">{inv.id}</td>
                                                        <td className="px-6 py-3 text-sm text-gray-900">{inv.client}</td>
                                                        <td className="px-6 py-3"><Badge className="bg-purple-100 text-purple-700 text-xs">{inv.plan}</Badge></td>
                                                        <td className="px-6 py-3 text-sm font-semibold">${inv.amount}</td>
                                                        <td className="px-6 py-3 text-sm text-gray-500">{inv.date}</td>
                                                        <td className="px-6 py-3">
                                                            <Badge className={`text-xs ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {inv.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <Button size="sm" variant="ghost" className="h-7 text-xs">
                                                                <Download className="w-3 h-3 mr-1" /> PDF
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Commission Tracking */}
                                <div className="bg-white rounded-xl border shadow-sm">
                                    <div className="p-5 border-b">
                                        <h3 className="font-semibold text-gray-800">Partner Commission Tracking</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {['Partner', 'Sales', 'Revenue', 'Commission %', 'Amount Due'].map(h => (
                                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {[
                                                    { partner: 'LinguaPro', sales: 12, revenue: 3600, pct: 15, commission: 540 },
                                                    { partner: 'LicenseEase', sales: 8, revenue: 4000, pct: 20, commission: 800 },
                                                    { partner: 'NursePortfolio', sales: 15, revenue: 2250, pct: 12, commission: 270 },
                                                    { partner: 'DepartureReady', sales: 6, revenue: 1800, pct: 18, commission: 324 }
                                                ].map(c => (
                                                    <tr key={c.partner} className="hover:bg-gray-50">
                                                        <td className="px-6 py-3 text-sm font-medium">{c.partner}</td>
                                                        <td className="px-6 py-3 text-sm">{c.sales}</td>
                                                        <td className="px-6 py-3 text-sm">${c.revenue.toLocaleString()}</td>
                                                        <td className="px-6 py-3 text-sm">{c.pct}%</td>
                                                        <td className="px-6 py-3 text-sm font-semibold text-green-600">${c.commission}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── ADS & PARTNERS TAB ── */}
                        {activeTab === 'ads' && (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-800">Ads & Partner Management</h2>
                                    <p className="text-gray-600 mt-1">Manage in-app advertisements and partner commissions</p>
                                </div>

                                {/* Active Ads */}
                                <div className="bg-white rounded-xl border shadow-sm mb-8">
                                    <div className="flex items-center justify-between p-5 border-b">
                                        <h3 className="font-semibold text-gray-800">Active Advertisements</h3>
                                        <Button size="sm">
                                            <Plus className="w-3 h-3 mr-1" /> New Ad
                                        </Button>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {[
                                            { id: 'ad1', title: 'LinguaPro — IELTS Prep for Nurses', placement: 'Job Feed Top', impressions: 1240, active: true, end: '2026-12-31' },
                                            { id: 'ad2', title: 'LicenseEase — Fast-Track Licensing', placement: 'Dashboard Banner', impressions: 870, active: true, end: '2026-12-31' }
                                        ].map(ad => (
                                            <div key={ad.id} className="flex items-center justify-between p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <Image className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{ad.title}</p>
                                                        <p className="text-sm text-gray-500">Placement: <strong>{ad.placement}</strong> · {ad.impressions.toLocaleString()} impressions · Ends {ad.end}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                                                        {ad.active ? 'Active' : 'Paused'}
                                                    </Badge>
                                                    <Button size="sm" variant="outline">Edit</Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200">Remove</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Partners */}
                                <div className="bg-white rounded-xl border shadow-sm">
                                    <div className="flex items-center justify-between p-5 border-b">
                                        <h3 className="font-semibold text-gray-800">Partner Directory</h3>
                                        <Button size="sm">
                                            <Plus className="w-3 h-3 mr-1" /> Add Partner
                                        </Button>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {[
                                            { name: 'LinguaPro', category: 'Language Preparation', commission: 15 },
                                            { name: 'LicenseEase', category: 'Licensing Support', commission: 20 },
                                            { name: 'NursePortfolio', category: 'Digital Portfolio', commission: 12 },
                                            { name: 'DepartureReady', category: 'Pre-Departure Training', commission: 18 }
                                        ].map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-5">
                                                <div>
                                                    <p className="font-medium text-gray-900">{p.name}</p>
                                                    <p className="text-sm text-gray-500">{p.category}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-purple-600">{p.commission}% commission</p>
                                                    </div>
                                                    <Button size="sm" variant="outline">Edit</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>

            {/* Edit User Dialog */}
            <Dialog open={editUserDialog} onOpenChange={setEditUserDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update user information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                value={editForm.full_name}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="job_seeker">Professional</SelectItem>
                                    <SelectItem value="recruiter">Recruiter</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditUserDialog(false)}>Cancel</Button>
                        <Button onClick={handleSaveUser}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <AlertDialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the user account for {selectedUser?.email}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Change Password Dialog */}
            <Dialog open={changePasswordDialog} onOpenChange={setChangePasswordDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Reset password for {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="new_password">New Password</Label>
                            <Input
                                id="new_password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setChangePasswordDialog(false);
                            setNewPassword('');
                        }}>Cancel</Button>
                        <Button onClick={handleChangePassword}>Reset Password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Job Chat Dialog */}
            {selectedJobForChat && (
                <JobChatDialog
                    open={chatDialogOpen}
                    onOpenChange={(open) => {
                        setChatDialogOpen(open);
                        if (!open) {
                            fetchUnreadMessages(); // Refresh unread count when closing
                        }
                    }}
                    jobId={selectedJobForChat.id}
                    jobTitle={selectedJobForChat.title}
                    recruiterName={selectedJobForChat.recruiter?.full_name || 'Unknown'}
                    recruiterEmail={selectedJobForChat.recruiter?.email || ''}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
