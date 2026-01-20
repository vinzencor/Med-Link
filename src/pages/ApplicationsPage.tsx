import React from 'react';
import Header from '@/components/layout/Header';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Building2,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ApplicationsPage: React.FC = () => {
  const { currentUser } = useApp();
  const [userApplications, setUserApplications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('applications')
          .select('*, job:jobs(*)')
          .eq('seeker_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUserApplications(data || []);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'reviewed': return 'bg-primary/10 text-primary border-primary/20';
      case 'shortlisted': return 'bg-success/10 text-success border-success/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'hired': return 'bg-success text-success-foreground';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'reviewed': return Eye;
      case 'shortlisted': return CheckCircle2;
      case 'rejected': return XCircle;
      case 'hired': return CheckCircle2;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track the status of your job applications
          </p>
        </div>

        {userApplications.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-6">
              Start applying to jobs to track your progress here
            </p>
            <Button asChild>
              <Link to="/feed">
                Browse Jobs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {userApplications.map(application => {
              const job = application.job;
              const StatusIcon = getStatusIcon(application.status);

              return (
                <div key={application.id} className="card-elevated p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{job?.title || 'Position'}</h3>
                          <p className="text-muted-foreground">{job?.company || 'Company'}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(application.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>

                      {job && (
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                        </span>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ApplicationsPage;
