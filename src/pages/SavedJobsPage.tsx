import React from 'react';
import Header from '@/components/layout/Header';
import JobCard from '@/components/jobs/JobCard';
import { useApp } from '@/context/AppContext';
import { Job } from '@/types';
import { Bookmark, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SavedJobsPage: React.FC = () => {
  const { jobs, savedJobs, currentUser } = useApp();
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [showApply, setShowApply] = React.useState(false);

  const savedJobsList = jobs.filter(job => 
    savedJobs.some(s => s.jobId === job.id && s.userId === currentUser?.id)
  );

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setShowApply(true);
  };

  const handleViewDetails = (job: Job) => {
    // Navigate to job details or open modal
    window.location.href = `/feed?job=${job.id}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Saved Jobs</h1>
          <p className="text-muted-foreground">
            {savedJobsList.length} job{savedJobsList.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {savedJobsList.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No saved jobs yet</h3>
            <p className="text-muted-foreground mb-6">
              Save jobs you're interested in to review them later
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
            {savedJobsList.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedJobsPage;
