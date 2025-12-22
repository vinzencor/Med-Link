import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Bookmark, 
  BookmarkCheck,
  Building2,
  Users,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { Job } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';

interface JobDetailsModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onApply: (job: Job) => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, open, onClose, onApply }) => {
  const { isJobSaved, toggleSaveJob, hasApplied } = useApp();

  if (!job) return null;

  const saved = isJobSaved(job.id);
  const applied = hasApplied(job.id);

  const formatSalary = () => {
    const { min, max, period } = job.salary;
    if (period === 'hourly') {
      return `$${min} - $${max} per hour`;
    }
    return `$${min.toLocaleString()} - $${max.toLocaleString()} per year`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
              <p className="text-lg text-muted-foreground">{job.company}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 p-4 bg-secondary rounded-xl">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              <span>{formatSalary()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span>Posted {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span>{job.applicationsCount} applicants</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge>{job.type.replace('-', ' ')}</Badge>
            <Badge variant="secondary">{job.category}</Badge>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">About this role</h3>
            <p className="text-muted-foreground leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Benefits</h3>
            <ul className="space-y-2">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Gift className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button
              variant={saved ? 'save' : 'outline'}
              onClick={() => toggleSaveJob(job.id)}
              className="flex items-center gap-2"
            >
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {saved ? 'Saved' : 'Save Job'}
            </Button>
            {applied ? (
              <Button variant="secondary" disabled className="flex-1">
                Already Applied
              </Button>
            ) : (
              <Button onClick={() => onApply(job)} className="flex-1">
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
