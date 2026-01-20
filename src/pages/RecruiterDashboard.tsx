import React from 'react';
import Header from '@/components/layout/Header';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  Plus,
  Clock,
  ArrowRight,
  Building2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RecruiterDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const [recruiterJobs, setRecruiterJobs] = React.useState<any[]>([]);
  const [applications, setApplications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('recruiter_id', user.id)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;
        setRecruiterJobs(jobsData || []);

        // Fetch applications for these jobs
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select('*, job:jobs(title), applicant:profiles(full_name, email)')
          .in('job_id', (jobsData || []).map(j => j.id))
          .order('created_at', { ascending: false });

        if (appsError) throw appsError;
        setApplications(appsData || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalApplications = applications;
  const pendingApplications = applications.filter(a => a.status === 'pending');

  const stats = [
    {
      label: 'Active Jobs',
      value: recruiterJobs.filter(j => j.isActive).length,
      icon: Briefcase,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      label: 'Total Applicants',
      value: totalApplications.length,
      icon: Users,
      color: 'text-success',
      bg: 'bg-success/10'
    },
    {
      label: 'Pending Review',
      value: pendingApplications.length,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
    {
      label: 'Total Views',
      value: 0, // Views tracking not implemented yet
      icon: Eye,
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              Welcome back, {currentUser?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your recruitment activity
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/post-job">
              <Plus className="w-4 h-4" />
              Post New Job
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card-elevated p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Jobs */}
          <div className="lg:col-span-2">
            <div className="card-elevated">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-lg font-semibold">Your Job Listings</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/my-jobs">View All</Link>
                </Button>
              </div>

              {recruiterJobs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No jobs posted yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first job listing to start receiving applications
                  </p>
                  <Button asChild>
                    <Link to="/post-job">Post Your First Job</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recruiterJobs.slice(0, 5).map(job => (
                    <div key={job.id} className="p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium truncate">{job.title}</h3>
                              <p className="text-sm text-muted-foreground">{job.location}</p>
                            </div>
                            <Badge variant={'default'}>
                              Active
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {/* Count specific to this job from fetched apps */}
                              {applications.filter(a => a.job_id === job.id).length} applicants
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Applicants */}
          <div>
            <div className="card-elevated">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-lg font-semibold">Recent Applicants</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/applicants">View All</Link>
                </Button>
              </div>

              {totalApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No applications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {totalApplications.slice(0, 5).map(application => {
                    return (
                      <div key={application.id} className="p-4 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {application.applicant?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{application.applicant?.full_name || 'Unknown Candidate'}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              Applied for {application.job?.title}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0 bg-warning/10 text-warning border-warning/20">
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Subscription Card */}
            <div className="card-elevated p-5 mt-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{currentUser?.subscription?.plan || 'Starter'} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.subscription?.jobPostsRemaining === undefined
                      ? 'Unlimited posts'
                      : `${currentUser?.subscription?.jobPostsRemaining} posts left`
                    }
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/subscription">
                  Manage Subscription
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
