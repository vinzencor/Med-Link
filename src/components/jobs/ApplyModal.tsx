import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { validateCV } from '@/lib/ai-verification';
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
  AlertCircle,
  Video,
  Loader2,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { Job, JobApplication } from '@/types';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface ApplyModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ job, open, onClose }) => {
  const { currentUser, applyToJob, updateUserCV } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingCV, setIsValidatingCV] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvValidationResult, setCvValidationResult] = useState<{
    isValid: boolean;
    confidence: number;
    quality?: string;
    issues?: string[];
  } | null>(null);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    experience: currentUser?.experience || '',
    coverLetter: ''
  });

  if (!job) return null;

  const hasExistingCV = !!currentUser?.cvUrl;
  const hasApprovedVideo = currentUser?.videoStatus === 'approved';
  const hasVideoUploaded = !!currentUser?.videoUrl;
  const isJobSeeker = currentUser?.role === 'job_seeker' || currentUser?.role === 'student';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
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

    // AI-powered ATS validation
    setIsValidatingCV(true);
    setCvValidationResult(null);

    try {
      toast({
        title: 'Validating CV...',
        description: 'AI is analyzing your document to ensure it\'s a valid resume',
      });

      const result = await validateCV(file);

      if (!result.isCV || result.confidence < 70) {
        // Reject non-CV files
        toast({
          title: 'Invalid Document',
          description: 'The uploaded file does not appear to be a valid CV/Resume. Please upload your actual resume.',
          variant: 'destructive'
        });
        setCvValidationResult({
          isValid: false,
          confidence: result.confidence,
          issues: result.issues
        });
        e.target.value = ''; // Reset file input
        return;
      }

      // CV is valid
      setCvFile(file);
      setCvValidationResult({
        isValid: true,
        confidence: result.confidence,
        quality: result.quality,
        issues: result.issues
      });

      toast({
        title: 'CV Validated ✓',
        description: `Your resume has been verified (${result.confidence}% confidence, ${result.quality} quality)`,
      });
    } catch (error: any) {
      console.error('CV validation error:', error);
      toast({
        title: 'Validation Error',
        description: 'Could not validate CV. Please try again or contact support.',
        variant: 'destructive'
      });
      e.target.value = ''; // Reset file input
    } finally {
      setIsValidatingCV(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate CV requirement
      if (!cvFile && !hasExistingCV) {
        throw new Error('Please upload your CV/Resume');
      }

      // Upload CV to Supabase Storage if a new file is selected
      let cvUrl = currentUser?.cvUrl || '';
      if (cvFile) {
        const path = `${user.id}/${job.id}/${Date.now()}_cv.pdf`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('application-cvs')
          .upload(path, cvFile, { upsert: true });
        if (uploadError) {
          console.warn('CV upload failed, using existing CV:', uploadError.message);
        } else {
          const { data: { publicUrl } } = supabase.storage.from('application-cvs').getPublicUrl(uploadData.path);
          cvUrl = publicUrl;
          // Also update the user's profile CV
          updateUserCV(cvUrl);
        }
      }

      console.log('📝 Submitting application with data:', {
        job_id: job.id,
        seeker_id: user.id,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        experience: formData.experience,
        cv_url: cvUrl,
        cover_letter: formData.coverLetter || null,
        status: 'pending',
        cv_ai_validated: cvValidationResult?.isValid || false,
        cv_ai_confidence: cvValidationResult?.confidence || 0,
        cv_quality: cvValidationResult?.quality || null
      });

      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          seeker_id: user.id,
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          experience: formData.experience,
          cv_url: cvUrl,
          cover_letter: formData.coverLetter || null,
          status: 'pending',
          cv_ai_validated: cvValidationResult?.isValid || false,
          cv_ai_confidence: cvValidationResult?.confidence || 0,
          cv_quality: cvValidationResult?.quality || null
        });

      if (error) {
        console.error('❌ Error inserting application:', error);
        if (error.code === '23505') { // Unique violation
          throw new Error("You have already applied for this job.");
        }
        throw error;
      }

      console.log('✅ Application submitted successfully!');

      toast({
        title: 'Application Submitted!',
        description: `Your application for ${job.title} has been sent successfully.`,
      });

      onClose();
    } catch (error: any) {
      console.error('❌ Application submission error:', error);
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
          <DialogDescription>
            Complete the form below to apply for this position.
          </DialogDescription>
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

        {/* Mandatory video gate */}
        {isJobSeeker && !hasVideoUploaded && (
          <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg my-2">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive text-sm">Introduction Video Required</p>
              <p className="text-xs text-muted-foreground mt-0.5">You must upload a self-introduction video before applying.</p>
              <Button size="sm" variant="outline" className="mt-2 text-destructive border-destructive/30" asChild>
                <Link to="/profile" onClick={onClose}>
                  <Video className="w-3 h-3 mr-1" />
                  Upload Video on Profile Page
                </Link>
              </Button>
            </div>
          </div>
        )}

        {isJobSeeker && hasVideoUploaded && !hasApprovedVideo && (
          <div className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/20 rounded-lg my-2">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-warning text-sm">Video Pending Approval</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your introduction video is awaiting admin review. You can still submit your application and it will be held pending video approval.</p>
            </div>
          </div>
        )}

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
              <div className="p-4 border rounded-lg bg-success/5 border-success/20">
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
                {isValidatingCV ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <div>
                      <p className="font-medium">Validating your CV...</p>
                      <p className="text-sm text-muted-foreground mt-1">AI is analyzing your document</p>
                    </div>
                  </div>
                ) : cvFile && cvValidationResult?.isValid ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div className="text-left flex-1">
                        <p className="font-medium">{cvFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(cvFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCvFile(null);
                          setCvValidationResult(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-success" />
                      <div className="text-left text-sm">
                        <p className="font-medium text-success">CV Verified by AI</p>
                        <p className="text-xs text-muted-foreground">
                          {cvValidationResult.confidence}% confidence • {cvValidationResult.quality} quality
                        </p>
                      </div>
                    </div>
                  </div>
                ) : cvValidationResult && !cvValidationResult.isValid ? (
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="font-semibold text-destructive">Invalid Document</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This doesn't appear to be a valid CV/Resume. Please upload your actual resume.
                      </p>
                      {cvValidationResult.issues && cvValidationResult.issues.length > 0 && (
                        <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                          {cvValidationResult.issues.map((issue, idx) => (
                            <li key={idx}>• {issue}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isValidatingCV}
                    />
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium">Click to upload your CV</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF format, max 5MB</p>
                    <p className="text-xs text-primary mt-2">✓ AI-powered validation</p>
                  </label>
                )}
              </div>
            )}
            {cvFile && cvValidationResult?.isValid && (
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
            <Button
              type="submit"
              className="flex-1"
              disabled={
                isSubmitting ||
                isValidatingCV ||
                (isJobSeeker && !hasVideoUploaded) ||
                (!hasExistingCV && !cvValidationResult?.isValid)
              }
              title={
                isJobSeeker && !hasVideoUploaded
                  ? 'Upload your introduction video first'
                  : !hasExistingCV && !cvValidationResult?.isValid
                  ? 'Please upload and validate your CV first'
                  : undefined
              }
            >
              {isSubmitting ? 'Submitting...' : isValidatingCV ? 'Validating CV...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyModal;
