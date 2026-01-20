import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Upload,
  FileText,
  CheckCircle,
  Building2,
  AlertCircle
} from 'lucide-react';
import { Job, JobApplication } from '@/types';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

interface ApplyModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ job, open, onClose }) => {
  const { currentUser, applyToJob, updateUserCV } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    experience: currentUser?.experience || '',
    coverLetter: ''
  });

  if (!job) return null;

  const hasExistingCV = !!currentUser?.cvUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file',
          variant: 'destructive'
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }
      setCvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { user } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // For MVP, we skip real file upload and just use a placeholder URL if a file is selected
      // In a real app, you would upload 'cvFile' to Supabase Storage here.
      const cvUrl = cvFile ? `https://fake-storage.com/${cvFile.name}` : currentUser?.cvUrl || '';

      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          seeker_id: user.id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error("You have already applied for this job.");
        }
        throw error;
      }

      toast({
        title: 'Application Submitted!',
        description: `Your application for ${job.title} has been sent successfully.`,
      });

      onClose();
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Application Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Apply for Position</DialogTitle>
          <div className="flex items-center gap-3 mt-2 p-3 bg-secondary rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{job.title}</p>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Personal Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience *</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g., 5 years in ER"
                required
              />
            </div>
          </div>

          {/* CV Upload */}
          <div className="space-y-2">
            <Label>Resume/CV *</Label>
            {hasExistingCV ? (
              <div className="p-4 border border-border rounded-lg bg-success/5 border-success/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-success">CV on file</p>
                    <p className="text-sm text-muted-foreground">Your previously uploaded CV will be used</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <label className="text-sm text-primary cursor-pointer hover:underline">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    Upload a different CV
                  </label>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                {cvFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{cvFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(cvFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCvFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium">Click to upload your CV</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF format, max 5MB</p>
                  </label>
                )}
              </div>
            )}
            {cvFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>This CV will be saved for future applications</span>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              placeholder="Tell the employer why you're a great fit for this role..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyModal;
