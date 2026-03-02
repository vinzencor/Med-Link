export type UserRole = 'recruiter' | 'job_seeker' | 'admin' | 'student';

export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';

export type VideoStatus = 'pending' | 'approved' | 'rejected';

export type EmployerStatus = 'pending' | 'approved' | 'suspended';

export interface Badge {
  id: string;
  badgeType: string;
  label: string;
  awardedAt: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  active: boolean;
  purchasedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatarUrl?: string;
  subscription?: Subscription;
  cvUrl?: string;
  videoUrl?: string;
  videoStatus?: VideoStatus;
  phone?: string;
  experience?: string;
  bio?: string;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  profileScore?: number;
  documents?: UserDocument[];
  badges?: Badge[];
  addOns?: AddOn[];
  employerStatus?: EmployerStatus;
  consentGiven?: boolean;
  consentDate?: string;
}

export interface UserDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  aiVerified?: boolean;
  aiConfidence?: number;
  aiAnalysis?: string;
  aiExtractedData?: {
    name?: string;
    licenseNumber?: string;
    expiryDate?: string;
    issueDate?: string;
    issuingAuthority?: string;
  };
  aiIssues?: string[];
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface Subscription {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  jobPostsRemaining?: number;
  applicationsRemaining?: number;
  revealsTotal?: number;
  revealsUsed?: number;
  revealsRemaining?: number;
  autoRenew?: boolean;
  startDate: string;
  endDate: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: 'job_feed_top' | 'job_feed_sidebar' | 'profile_page' | 'dashboard_banner';
  active: boolean;
  startDate: string;
  endDate: string;
  impressionCount: number;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  commissionPct: number;
  category: 'language' | 'licensing' | 'portfolio' | 'training' | 'other';
  description?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  partnerId?: string;
  title: string;
  fileUrl: string;
  issuedDate: string;
  verified: boolean;
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
  cvAiValidated?: boolean;
  cvAiConfidence?: number;
  cvAiAnalysis?: string;
  cvQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  cvSections?: string[];
  cvValidationIssues?: string[];
}

export interface SavedJob {
  id: string;
  jobId: string;
  userId: string;
  savedAt: string;
}
