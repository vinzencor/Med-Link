import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  FileText,
  Mail,
  Phone,
  Clock,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Eye,
  Video,
  User,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const REVEALED_CANDIDATES_STORAGE_KEY = 'recruiter_revealed_candidates';

const ApplicantsPage: React.FC = () => {
  const [recruiterJobs, setRecruiterJobs] = useState<any[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch jobs for dropdown
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('recruiter_id', user.id);

        if (jobsError) throw jobsError;
        setRecruiterJobs(jobsData || []);

        const jobIds = (jobsData || []).map(j => j.id);
        if (jobIds.length === 0) {
          setAllApplications([]);
          return;
        }

        // Fetch applications for recruiter's jobs.
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select('*, job:jobs(title)')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false });

        if (appsError) throw appsError;

        const seekerIds = Array.from(new Set((appsData || []).map(app => app.seeker_id).filter(Boolean)));
        if (seekerIds.length === 0) {
          setAllApplications(appsData || []);
          return;
        }

        // Fetch profile details separately so missing optional columns do not break the applications list.
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', seekerIds);

        if (profilesError) {
          console.warn('Profiles fetch failed, falling back to application fields:', profilesError);
          setAllApplications(appsData || []);
          return;
        }

        const profileById = new Map((profilesData || []).map(profile => [profile.id, profile]));
        const mergedApplications = (appsData || []).map(app => ({
          ...app,
          applicant: profileById.get(app.seeker_id) || {
            full_name: app.full_name,
            email: app.email,
            phone: app.phone,
            experience: app.experience,
            cv_url: app.cv_url,
          },
        }));

        setAllApplications(mergedApplications);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setAllApplications(prev => prev.map(a =>
        a.id === applicationId ? { ...a, status: newStatus } : a
      ));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredApplications = allApplications.filter(app => {
    const name = app.applicant?.full_name || app.full_name || 'Unknown Candidate';
    const email = app.applicant?.email || app.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesJob = jobFilter === 'all' || app.job_id === jobFilter;
    return matchesSearch && matchesStatus && matchesJob;
  });

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

  const handleViewCV = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('No CV attached to this application');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Applicants</h1>
          <p className="text-muted-foreground">
            Review and manage applications for your job postings
          </p>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {recruiterJobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: allApplications.length, color: 'text-foreground' },
            { label: 'Pending', value: allApplications.filter(a => a.status === 'pending').length, color: 'text-warning' },
            { label: 'Shortlisted', value: allApplications.filter(a => a.status === 'shortlisted').length, color: 'text-success' },
            { label: 'Hired', value: allApplications.filter(a => a.status === 'hired').length, color: 'text-primary' },
          ].map((stat, i) => (
            <div key={i} className="card-elevated p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Applicants List */}
        {loading ? (
          <div className="card-elevated p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Loading applicants...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No applicants found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || jobFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Applications will appear here when candidates apply'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(application => {
              const job = application.job;
              const cvUrl = application.cv_url || application.resume_url;
              const seekerId = application.seeker_id;
              
              // Local state for reveal status of this specific application
              return <ApplicantRow 
                key={application.id} 
                application={application} 
                job={job}
                cvUrl={cvUrl}
                seekerId={seekerId}
                updateStatus={updateStatus}
                handleViewCV={handleViewCV}
              />;
            })}
          </div>
        )}
      </main>
    </div>
  );
};

// Extracted Row component to manage local reveal state
const ApplicantRow = ({ application, job, cvUrl, seekerId, updateStatus, handleViewCV }: any) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealLoading, setRevealLoading] = useState(true);
  const visibilitySettings = React.useMemo(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('recruiter_visibility_settings') || '{}');
      return settings[seekerId] || {
        email: true,
        phone: true,
        cv: true,
        video: true,
        experience: true,
        bio: true,
      };
    } catch {
      return {
        email: true,
        phone: true,
        cv: true,
        video: true,
        experience: true,
        bio: true,
      };
    }
  }, [seekerId]);

  React.useEffect(() => {
    const init = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(REVEALED_CANDIDATES_STORAGE_KEY) || '{}');
        setIsRevealed(Boolean(seekerId && stored[seekerId]));
      } catch {
        setIsRevealed(false);
      }
      setRevealLoading(false);
    };
    init();
  }, [seekerId]);

  const handleReveal = () => {
    if (!seekerId) {
      setIsRevealed(true);
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem(REVEALED_CANDIDATES_STORAGE_KEY) || '{}');
      stored[seekerId] = true;
      localStorage.setItem(REVEALED_CANDIDATES_STORAGE_KEY, JSON.stringify(stored));
      setIsRevealed(true);
    } catch {
      setIsRevealed(true);
    }
  };

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

  return (
    <div className="card-elevated p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
          {application.applicant?.avatar_url ? (
            <img src={application.applicant.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-semibold text-primary">
              {(application.applicant?.full_name || application.full_name || 'Unknown Candidate').split(' ').map((n: string) => n[0]).join('') || '?'}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold">{application.applicant?.full_name || application.full_name || 'Unknown Candidate'}</h3>
              <p className="text-muted-foreground">Applied for: {job?.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(application.status)}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => isRevealed ? handleViewCV(cvUrl) : handleReveal()}>
                    <Eye className="w-4 h-4 mr-2" />
                    {isRevealed ? 'View CV' : 'Reveal & View CV'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-success" onClick={() => updateStatus(application.id, 'shortlisted')}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Shortlist
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => updateStatus(application.id, 'rejected')}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Contact & Details */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {isRevealed && visibilitySettings.email ? (application.applicant?.email || application.email || '--') : '••••••••@••••.•••'}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {isRevealed && visibilitySettings.phone ? (application.applicant?.phone || application.phone || '--') : '•••••• ••••'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Experience */}
          <div className="mt-3 p-3 bg-secondary rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Experience:</span> {visibilitySettings.experience ? (application.applicant?.experience || application.experience || 'Not specified') : 'Hidden by admin'}
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium">Bio:</span> {visibilitySettings.bio ? (application.applicant?.bio || 'Not provided') : 'Hidden by admin'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            {isRevealed ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewCV(cvUrl)}
                  disabled={!visibilitySettings.cv}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  {visibilitySettings.cv ? 'View CV' : 'CV Hidden'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!visibilitySettings.video || !application.applicant?.video_url}
                  onClick={() => application.applicant?.video_url && window.open(application.applicant.video_url, '_blank')}
                >
                  <Video className="w-4 h-4 mr-1" />
                  {!visibilitySettings.video ? 'Video Hidden' : 'View Video'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `mailto:${application.applicant?.email || application.email || ''}`}
                  disabled={!visibilitySettings.email}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Contact
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleReveal}
                disabled={revealLoading}
              >
                {revealLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                Reveal Contact Details
              </Button>
            )}
            
            {(application.status === 'pending' || application.status === 'reviewed') && (
              <Button
                size="sm"
                variant="outline"
                className="text-success border-success/20 hover:bg-success/5"
                onClick={() => updateStatus(application.id, 'shortlisted')}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Shortlist
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantsPage;
