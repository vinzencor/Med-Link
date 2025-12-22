export type UserRole = 'recruiter' | 'job_seeker';

export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  subscription?: Subscription;
  cvUrl?: string;
  phone?: string;
  experience?: string;
  bio?: string;
}

export interface Subscription {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  jobPostsRemaining?: number;
  applicationsRemaining?: number;
  startDate: string;
  endDate: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'per-diem';
  salary: {
    min: number;
    max: number;
    period: 'hourly' | 'yearly';
  };
  description: string;
  requirements: string[];
  benefits: string[];
  category: string;
  postedAt: string;
  expiresAt: string;
  recruiterId: string;
  applicationsCount: number;
  isActive: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  experience: string;
  cvUrl: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
}

export interface SavedJob {
  id: string;
  jobId: string;
  userId: string;
  savedAt: string;
}
