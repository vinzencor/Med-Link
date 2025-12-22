import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  X, 
  Briefcase, 
  DollarSign,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Job } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const PostJobPage: React.FC = () => {
  const { addJob, currentUser } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: currentUser?.name || '',
    location: '',
    type: 'full-time' as Job['type'],
    salaryMin: '',
    salaryMax: '',
    salaryPeriod: 'yearly' as 'hourly' | 'yearly',
    description: '',
    category: '',
    requirements: [''],
    benefits: ['']
  });

  const categories = [
    'Nursing',
    'Emergency Care',
    'Pediatrics',
    'Surgical',
    'Home Health',
    'Travel Nursing',
    'ICU/Critical Care',
    'Labor & Delivery',
    'Mental Health',
    'Oncology'
  ];

  const addListItem = (field: 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeListItem = (field: 'requirements' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateListItem = (field: 'requirements' | 'benefits', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newJob: Job = {
      id: `j${Date.now()}`,
      title: formData.title,
      company: formData.company,
      location: formData.location,
      type: formData.type,
      salary: {
        min: parseInt(formData.salaryMin) || 0,
        max: parseInt(formData.salaryMax) || 0,
        period: formData.salaryPeriod
      },
      description: formData.description,
      requirements: formData.requirements.filter(r => r.trim()),
      benefits: formData.benefits.filter(b => b.trim()),
      category: formData.category,
      postedAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recruiterId: currentUser?.id || '',
      applicationsCount: 0,
      isActive: true
    };

    addJob(newJob);
    setIsSubmitting(false);

    toast({
      title: 'Job Posted Successfully!',
      description: 'Your job listing is now live and visible to job seekers.',
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Post a New Job</h1>
          <p className="text-muted-foreground">
            Create a job listing to attract qualified healthcare professionals
          </p>
        </div>

        {/* Subscription Info */}
        {currentUser?.subscription && (
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {currentUser.subscription.plan.charAt(0).toUpperCase() + currentUser.subscription.plan.slice(1)} Plan
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentUser.subscription.jobPostsRemaining === undefined
                    ? 'Unlimited job posts'
                    : `${currentUser.subscription.jobPostsRemaining} job posts remaining`
                  }
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success">Active</Badge>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Registered Nurse - ICU"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company/Facility Name *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., St. Mary's Hospital"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Los Angeles, CA"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Employment Type *</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Job['type'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="per-diem">Per Diem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Info */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              Compensation
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Minimum *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    placeholder="50000"
                    className="pl-7"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Maximum *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    placeholder="75000"
                    className="pl-7"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryPeriod">Pay Period</Label>
                <Select value={formData.salaryPeriod} onValueChange={(v) => setFormData({ ...formData, salaryPeriod: v as 'hourly' | 'yearly' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Per Year</SelectItem>
                    <SelectItem value="hourly">Per Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold mb-4">Job Description *</h2>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
              rows={6}
              required
            />
          </div>

          {/* Requirements */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold mb-4">Requirements</h2>
            <div className="space-y-3">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <Input
                    value={req}
                    onChange={(e) => updateListItem('requirements', index, e.target.value)}
                    placeholder="e.g., Active RN license required"
                  />
                  {formData.requirements.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('requirements', index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addListItem('requirements')}>
                <Plus className="w-4 h-4 mr-1" />
                Add Requirement
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold mb-4">Benefits</h2>
            <div className="space-y-3">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <Input
                    value={benefit}
                    onChange={(e) => updateListItem('benefits', index, e.target.value)}
                    placeholder="e.g., Comprehensive health insurance"
                  />
                  {formData.benefits.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('benefits', index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addListItem('benefits')}>
                <Plus className="w-4 h-4 mr-1" />
                Add Benefit
              </Button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>This job posting will be visible for 30 days</span>
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PostJobPage;
