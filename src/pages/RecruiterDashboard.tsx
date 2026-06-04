import React from 'react';
import Header from '@/components/layout/Header';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  Plus,
  Clock,
  ArrowRight,
  Building2,
  Zap,
  Megaphone,
  FileImage,
  Video
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EmployerAddOns from '@/components/subscription/EmployerAddOns';

const RecruiterDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const [recruiterJobs, setRecruiterJobs] = React.useState<any[]>([]);
  const [applications, setApplications] = React.useState<any[]>([]);
  const [professionals, setProfessionals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [adModalOpen, setAdModalOpen] = React.useState(false);
  const [submittingAd, setSubmittingAd] = React.useState(false);
  const [adForm, setAdForm] = React.useState({
    title: '',
    adType: 'image',
    placement: 'dashboard_banner',
    targetLocation: '',
    paymentReference: '',
    budget: ''
  });
  const [adDocFile, setAdDocFile] = React.useState<File | null>(null);
  const [adMediaFile, setAdMediaFile] = React.useState<File | null>(null);

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

        // Fetch all professionals for recruiter quick browse
        const { data: professionalsData, error: professionalsError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, bio, experience, avatar_url, created_at')
          .in('role', ['job_seeker', 'student'])
          .order('created_at', { ascending: false });

        if (professionalsError) throw professionalsError;
        setProfessionals(professionalsData || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmitAdRequest = async () => {
    if (!adForm.title || !adForm.targetLocation || !adForm.paymentReference || !adMediaFile || !adDocFile) {
      return;
    }

    setSubmittingAd(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let documentUrl = '';
      let mediaUrl = '';

      try {
        const docPath = `${user.id}/${Date.now()}_${adDocFile.name}`;
        const mediaPath = `${user.id}/${Date.now()}_${adMediaFile.name}`;

        const { data: docData, error: docError } = await supabase.storage
          .from('ad-documents')
          .upload(docPath, adDocFile, { upsert: true });
        if (!docError && docData?.path) {
          const { data: docPublic } = supabase.storage.from('ad-documents').getPublicUrl(docData.path);
          documentUrl = docPublic.publicUrl;
        }

        const { data: mediaData, error: mediaError } = await supabase.storage
          .from('ad-assets')
          .upload(mediaPath, adMediaFile, { upsert: true });
        if (!mediaError && mediaData?.path) {
          const { data: mediaPublic } = supabase.storage.from('ad-assets').getPublicUrl(mediaData.path);
          mediaUrl = mediaPublic.publicUrl;
        }
      } catch (uploadError) {
        console.warn('Ad upload buckets unavailable, using filenames only:', uploadError);
        documentUrl = adDocFile.name;
        mediaUrl = adMediaFile.name;
      }

      const payload = {
        recruiter_id: user.id,
        title: adForm.title,
        ad_type: adForm.adType,
        placement: adForm.placement,
        target_location: adForm.targetLocation,
        payment_reference: adForm.paymentReference,
        budget: adForm.budget ? Number(adForm.budget) : null,
        document_url: documentUrl,
        media_url: mediaUrl,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Persist in local fallback so admin can always review in UI.
      const existing = JSON.parse(localStorage.getItem('mock_ad_requests') || '[]');
      localStorage.setItem('mock_ad_requests', JSON.stringify([
        { id: crypto.randomUUID(), ...payload },
        ...existing
      ]));

      try {
        await supabase.from('ad_requests').insert(payload);
      } catch (dbError) {
        console.warn('ad_requests table unavailable, local fallback in use:', dbError);
      }

      setAdModalOpen(false);
      setAdDocFile(null);
      setAdMediaFile(null);
      setAdForm({
        title: '',
        adType: 'image',
        placement: 'dashboard_banner',
        targetLocation: '',
        paymentReference: '',
        budget: ''
      });
    } finally {
      setSubmittingAd(false);
    }
  };

  const totalApplications = applications;
  const pendingApplications = applications.filter(a => a.status === 'pending');
  const approvedJobs = recruiterJobs.filter(j => j.status === 'approved');
  const pendingJobs = recruiterJobs.filter(j => j.status === 'pending');

  const stats = [
    {
      label: 'Approved Jobs',
      value: approvedJobs.length,
      icon: Briefcase,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      label: 'Pending Approval',
      value: pendingJobs.length,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10'
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
      icon: TrendingUp,
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
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={() => setAdModalOpen(true)}>
              <Megaphone className="w-4 h-4" />
              Ads & Partners
            </Button>
            <Button asChild size="lg">
              <Link to="/post-job">
                <Plus className="w-4 h-4" />
                Post New Job
              </Link>
            </Button>
          </div>
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
                            <Badge className={
                              job.status === 'pending' ? 'bg-orange-500' :
                              job.status === 'approved' ? 'bg-green-500' :
                              job.status === 'rejected' ? 'bg-red-500' :
                              'bg-blue-500'
                            }>
                              {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Active'}
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
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold capitalize">{currentUser?.subscription?.plan || 'Starter'} Plan</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.subscription?.billingCycle || 'monthly'} billing</p>
                </div>
              </div>

              {/* Reveals counter */}
              {currentUser?.subscription?.revealsTotal !== undefined && (
                <div className="mb-4 p-3 bg-background rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Eye className="w-4 h-4 text-primary" />
                      Candidate Reveals
                    </div>
                    <span className="text-sm font-bold">
                      {currentUser.subscription.revealsUsed ?? 0}
                      <span className="text-muted-foreground font-normal">
                        /{currentUser.subscription.revealsTotal === -1 ? '∞' : currentUser.subscription.revealsTotal}
                      </span>
                    </span>
                  </div>
                  {currentUser.subscription.revealsTotal !== -1 && (
                    <Progress
                      value={((currentUser.subscription.revealsUsed ?? 0) / currentUser.subscription.revealsTotal) * 100}
                      className="h-1.5"
                    />
                  )}
                  {currentUser.subscription.revealsTotal !== -1 &&
                   (currentUser.subscription.revealsRemaining ?? currentUser.subscription.revealsTotal) <= 3 && (
                    <p className="text-xs text-warning mt-1.5 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Only {currentUser.subscription.revealsRemaining ?? 0} reveal{currentUser.subscription.revealsRemaining === 1 ? '' : 's'} remaining this cycle
                    </p>
                  )}
                </div>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link to="/subscription">
                  Manage Subscription
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Employer Add-Ons */}
            <EmployerAddOns />
          </div>
        </div>

        {/* Full Lists */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="card-elevated">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold">All Applied Candidates</h2>
              <p className="text-sm text-muted-foreground mt-1">Complete list of candidates who applied to your jobs</p>
            </div>
            <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
              {applications.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No applications yet.</div>
              ) : (
                applications.map((application) => (
                  <div key={application.id} className="p-4">
                    <p className="font-medium">{application.applicant?.full_name || 'Unknown Candidate'}</p>
                    <p className="text-sm text-muted-foreground truncate">{application.applicant?.email || 'No email available'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Applied for {application.job?.title || 'Unknown Job'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card-elevated">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold">All Professionals</h2>
              <p className="text-sm text-muted-foreground mt-1">Browse registered professionals on the platform</p>
            </div>
            <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
              {professionals.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No professionals found.</div>
              ) : (
                professionals.map((professional) => (
                  <div key={professional.id} className="p-4">
                    <p className="font-medium">{professional.full_name || 'Unnamed Professional'}</p>
                    <p className="text-sm text-muted-foreground truncate">{professional.email || 'No email available'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{professional.role === 'student' ? 'Student' : 'Professional'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={adModalOpen} onOpenChange={setAdModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Ad / Partner Request</DialogTitle>
            <DialogDescription>
              Upload your poster or video ad, supporting documents, choose ad location, and submit payment details for admin approval.
            </DialogDescription>
          </DialogHeader>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ad-title">Campaign Title</Label>
              <Input
                id="ad-title"
                value={adForm.title}
                onChange={(e) => setAdForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Hospital recruitment campaign"
              />
            </div>

            <div className="space-y-2">
              <Label>Ad Type</Label>
              <Select value={adForm.adType} onValueChange={(value) => setAdForm(prev => ({ ...prev, adType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ad Location</Label>
              <Select value={adForm.placement} onValueChange={(value) => setAdForm(prev => ({ ...prev, placement: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard_banner">Dashboard Banner</SelectItem>
                  <SelectItem value="job_feed_top">Job Feed Top</SelectItem>
                  <SelectItem value="job_feed_sidebar">Job Feed Sidebar</SelectItem>
                  <SelectItem value="profile_page">Profile Page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-location">Target Location</Label>
              <Input
                id="target-location"
                value={adForm.targetLocation}
                onChange={(e) => setAdForm(prev => ({ ...prev, targetLocation: e.target.value }))}
                placeholder="Dublin, Ireland"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                value={adForm.budget}
                onChange={(e) => setAdForm(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="500"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="payment-ref">Payment Reference</Label>
              <Input
                id="payment-ref"
                value={adForm.paymentReference}
                onChange={(e) => setAdForm(prev => ({ ...prev, paymentReference: e.target.value }))}
                placeholder="PAY-2026-0001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-upload">Hospital/Partner Document</Label>
              <Input
                id="doc-upload"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setAdDocFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">Upload registration or supporting document.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-upload">Poster / Ad Asset</Label>
              <Input
                id="media-upload"
                type="file"
                accept={adForm.adType === 'video' ? 'video/*' : 'image/*'}
                onChange={(e) => setAdMediaFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">Upload {adForm.adType === 'video' ? 'video ad' : 'poster image'}.</p>
            </div>
          </div>

          <div className="rounded-lg border border-border p-3 bg-secondary/40 flex items-start gap-2 text-sm">
            {adForm.adType === 'video' ? <Video className="w-4 h-4 mt-0.5" /> : <FileImage className="w-4 h-4 mt-0.5" />}
            <p>
              After submission and payment, admin will review and approve your ad before it goes live.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAdModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitAdRequest} disabled={submittingAd}>
              {submittingAd ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruiterDashboard;
