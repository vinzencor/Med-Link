import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import JobCard from '@/components/jobs/JobCard';
import JobDetailsModal from '@/components/jobs/JobDetailsModal';
import ApplyModal from '@/components/jobs/ApplyModal';
import { useApp } from '@/context/AppContext';
import { Job } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, MapPin, X, Megaphone, ExternalLink } from 'lucide-react';

interface ApprovedAd {
  id: string;
  title: string;
  ad_type: 'image' | 'video';
  placement: string;
  target_location: string;
  media_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const JobFeedPage: React.FC = () => {
  const { currentUser, jobs, jobsLoading } = useApp();
  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [approvedAds, setApprovedAds] = useState<ApprovedAd[]>([]);

  React.useEffect(() => {
    const fetchApprovedAds = async () => {
      let dbAds: ApprovedAd[] = [];
      try {
        const { data } = await supabase
          .from('ad_requests')
          .select('id, title, ad_type, placement, target_location, media_url, status, created_at')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
        dbAds = (data || []) as ApprovedAd[];
      } catch {
        dbAds = [];
      }

      const localAds = (JSON.parse(localStorage.getItem('mock_ad_requests') || '[]') as ApprovedAd[])
        .filter(ad => ad.status === 'approved');

      const merged = [...dbAds, ...localAds.filter(local => !dbAds.some(db => db.id === local.id))]
        .sort((a, b) => {
          const rank = (p: string) => (p === 'job_feed_top' ? 0 : p === 'dashboard_banner' ? 1 : 2);
          const placementDiff = rank(a.placement) - rank(b.placement);
          if (placementDiff !== 0) return placementDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      setApprovedAds(merged);
    };

    fetchApprovedAds();
  }, []);

  // loading state comes from context now
  const loading = jobsLoading;

  // Remove local useEffect fetching
  // The jobs are now coming from context which is preserved on navigation events
  // if AppProvider is high enough in the tree.

  const categories = [...new Set(jobs.map(job => job.category))];
  const locations = [...new Set(jobs.map(job => job.location))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
    return matchesSearch && matchesLocation && matchesType && matchesCategory;
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDetails(true);
  };

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setShowApply(true);
    setShowDetails(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilter('all');
    setCategoryFilter('all');
  };

  const hasActiveFilters = searchTerm || locationFilter || typeFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Find Your Next Opportunity
          </h1>
          <p className="text-muted-foreground">
            Browse {filteredJobs.length} healthcare positions matching your criteria
          </p>
        </div>

        {approvedAds.length > 0 && (
          <div className="space-y-4 mb-6">
            {approvedAds.map(ad => (
              <div key={ad.id} className="card-elevated p-4 border-primary/20 bg-primary/5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold uppercase text-primary">Approved Sponsored Ad</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{ad.placement}</Badge>
                </div>
                <h3 className="text-lg font-semibold mb-1">{ad.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">Target location: {ad.target_location}</p>

                {ad.media_url && ad.ad_type === 'image' && (
                  <img src={ad.media_url} alt={ad.title} className="w-full max-h-52 object-cover rounded-lg border border-border" />
                )}

                {ad.media_url && ad.ad_type === 'video' && (
                  <video src={ad.media_url} controls className="w-full max-h-64 rounded-lg border border-border bg-black" />
                )}

                {ad.media_url && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" onClick={() => window.open(ad.media_url, '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-1" /> Open Ad Asset
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Search & Filters */}
        <div className="card-elevated p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative flex-1 sm:max-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="per-diem">Per Diem</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchTerm}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
              </Badge>
            )}
            {locationFilter && (
              <Badge variant="secondary" className="gap-1">
                Location: {locationFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setLocationFilter('')} />
              </Badge>
            )}
            {typeFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Type: {typeFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setTypeFilter('all')} />
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Category: {categoryFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCategoryFilter('all')} />
              </Badge>
            )}
          </div>
        )}

        {/* Subscription Info */}
        {currentUser?.subscription && (
          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {currentUser.subscription.plan.charAt(0).toUpperCase() + currentUser.subscription.plan.slice(1)} Plan
              </Badge>
              <span className="text-muted-foreground">
                {currentUser.subscription.applicationsRemaining === -1
                  ? 'Unlimited applications'
                  : `${currentUser.subscription.applicationsRemaining} applications remaining`
                }
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              Upgrade
            </Button>
          </div>
        )}

        {/* Job List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Loading jobs...</h3>
              <p className="text-muted-foreground">
                Please wait while we fetch available positions
              </p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                {jobs.length === 0
                  ? 'There are no jobs posted yet. Check back later!'
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            filteredJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </div>
      </main>

      {/* Modals */}
      <JobDetailsModal
        job={selectedJob}
        open={showDetails}
        onClose={() => setShowDetails(false)}
        onApply={handleApply}
      />

      <ApplyModal
        job={selectedJob}
        open={showApply}
        onClose={() => setShowApply(false)}
      />
    </div>
  );
};

export default JobFeedPage;
