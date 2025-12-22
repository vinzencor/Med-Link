import React from 'react';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Bookmark, 
  BookmarkCheck,
  Building2,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  onViewDetails: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onViewDetails }) => {
  const { isJobSaved, toggleSaveJob, hasApplied } = useApp();
  const saved = isJobSaved(job.id);
  const applied = hasApplied(job.id);

  const formatSalary = () => {
    const { min, max, period } = job.salary;
    if (period === 'hourly') {
      return `$${min} - $${max}/hr`;
    }
    return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k/yr`;
  };

  const getTypeColor = () => {
    switch (job.type) {
      case 'full-time': return 'bg-success/10 text-success border-success/20';
      case 'part-time': return 'bg-primary/10 text-primary border-primary/20';
      case 'contract': return 'bg-warning/10 text-warning border-warning/20';
      case 'per-diem': return 'bg-accent/10 text-accent border-accent/20';
      default: return '';
    }
  };

  return (
    <article className="card-interactive p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Company Logo */}
          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-muted-foreground" />
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 
                  className="font-semibold text-lg text-foreground hover:text-primary cursor-pointer transition-colors line-clamp-1"
                  onClick={() => onViewDetails(job)}
                >
                  {job.title}
                </h3>
                <p className="text-muted-foreground">{job.company}</p>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {formatSalary()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {job.applicationsCount} applicants
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className={getTypeColor()}>
                {job.type.replace('-', ' ')}
              </Badge>
              <Badge variant="secondary">{job.category}</Badge>
            </div>

            {/* Description Preview */}
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {job.description}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleSaveJob(job.id)}
          className={saved ? 'text-primary' : 'text-muted-foreground'}
        >
          {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </Button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Clock className="w-4 h-4" />
          Posted {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewDetails(job)}>
            View Details
          </Button>
          {applied ? (
            <Button variant="secondary" size="sm" disabled>
              Applied
            </Button>
          ) : (
            <Button size="sm" onClick={() => onApply(job)}>
              Apply Now
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default JobCard;
