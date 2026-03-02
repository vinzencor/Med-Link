import { Job, User, JobApplication, SavedJob, Partner, Ad } from '@/types';

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Registered Nurse - ICU',
    company: 'St. Mary\'s Medical Center',
    companyLogo: undefined,
    location: 'Los Angeles, CA',
    type: 'full-time',
    salary: { min: 75000, max: 95000, period: 'yearly' },
    description: 'We are seeking a dedicated Registered Nurse to join our ICU team. The ideal candidate will have experience in critical care and a passion for patient advocacy. You will be responsible for providing high-quality nursing care to critically ill patients.',
    requirements: [
      'Active RN license in California',
      'BSN degree preferred',
      '2+ years ICU experience',
      'BLS, ACLS, and PALS certifications',
      'Strong critical thinking skills'
    ],
    benefits: [
      'Comprehensive health insurance',
      '401(k) with employer match',
      'Paid time off',
      'Continuing education support',
      'Sign-on bonus available'
    ],
    category: 'Nursing',
    postedAt: '2024-01-15',
    expiresAt: '2024-02-15',
    recruiterId: 'r1',
    applicationsCount: 24,
    isActive: true
  },
  {
    id: '2',
    title: 'Emergency Room Nurse',
    company: 'Valley General Hospital',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: { min: 80000, max: 100000, period: 'yearly' },
    description: 'Join our fast-paced ER team and make a difference in patients\' lives during their most critical moments. We value nurses who thrive under pressure and can make quick, informed decisions.',
    requirements: [
      'Active RN license',
      'ER experience preferred',
      'Trauma certification',
      'Excellent communication skills'
    ],
    benefits: [
      'Night shift differential',
      'Tuition reimbursement',
      'Flexible scheduling',
      'Employee wellness program'
    ],
    category: 'Emergency Care',
    postedAt: '2024-01-14',
    expiresAt: '2024-02-14',
    recruiterId: 'r2',
    applicationsCount: 18,
    isActive: true
  },
  {
    id: '3',
    title: 'Pediatric Nurse Practitioner',
    company: 'Children\'s Health Network',
    location: 'San Diego, CA',
    type: 'full-time',
    salary: { min: 110000, max: 130000, period: 'yearly' },
    description: 'Be part of a caring team dedicated to children\'s health. As a Pediatric NP, you will diagnose and treat common pediatric conditions, provide preventive care, and educate families.',
    requirements: [
      'MSN with PNP certification',
      'Active NP license',
      '3+ years pediatric experience',
      'Bilingual (English/Spanish) preferred'
    ],
    benefits: [
      'Competitive salary',
      'Malpractice insurance',
      'CME allowance',
      'Relocation assistance'
    ],
    category: 'Pediatrics',
    postedAt: '2024-01-13',
    expiresAt: '2024-02-13',
    recruiterId: 'r1',
    applicationsCount: 12,
    isActive: true
  },
  {
    id: '4',
    title: 'Travel Nurse - Med/Surg',
    company: 'TravelCare Staffing',
    location: 'Multiple Locations',
    type: 'contract',
    salary: { min: 45, max: 65, period: 'hourly' },
    description: 'Exciting travel nursing opportunity! Work 13-week assignments at top facilities across the country. Housing and travel stipends provided.',
    requirements: [
      'Active compact RN license',
      '2+ years Med/Surg experience',
      'Flexible availability',
      'Strong adaptability'
    ],
    benefits: [
      'Housing stipend',
      'Travel reimbursement',
      '401(k)',
      'Bonus completion pay'
    ],
    category: 'Travel Nursing',
    postedAt: '2024-01-12',
    expiresAt: '2024-02-12',
    recruiterId: 'r3',
    applicationsCount: 45,
    isActive: true
  },
  {
    id: '5',
    title: 'Home Health Nurse',
    company: 'Comfort Home Care',
    location: 'Orange County, CA',
    type: 'part-time',
    salary: { min: 35, max: 45, period: 'hourly' },
    description: 'Provide compassionate nursing care in patients\' homes. Ideal for nurses seeking flexible schedules and meaningful one-on-one patient relationships.',
    requirements: [
      'Active RN license',
      'Valid driver\'s license',
      'Home health experience preferred',
      'Strong documentation skills'
    ],
    benefits: [
      'Flexible schedule',
      'Mileage reimbursement',
      'Competitive hourly rate',
      'Work-life balance'
    ],
    category: 'Home Health',
    postedAt: '2024-01-11',
    expiresAt: '2024-02-11',
    recruiterId: 'r2',
    applicationsCount: 8,
    isActive: true
  },
  {
    id: '6',
    title: 'Operating Room Nurse',
    company: 'Pacific Surgery Center',
    location: 'Sacramento, CA',
    type: 'full-time',
    salary: { min: 85000, max: 105000, period: 'yearly' },
    description: 'Join our state-of-the-art surgical center. We specialize in orthopedic and cardiovascular procedures. Experience the satisfaction of being part of life-changing surgeries.',
    requirements: [
      'Active RN license',
      'CNOR certification preferred',
      '2+ years OR experience',
      'Ability to stand for extended periods'
    ],
    benefits: [
      'No weekends',
      'No on-call',
      'Premium pay',
      'Modern facility'
    ],
    category: 'Surgical',
    postedAt: '2024-01-10',
    expiresAt: '2024-02-10',
    recruiterId: 'r1',
    applicationsCount: 15,
    isActive: true
  }
];

export const mockUser: User = {
  id: 'u1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  role: 'job_seeker',
  phone: '(555) 123-4567',
  experience: '5 years in Emergency Nursing',
  bio: 'Passionate ER nurse with experience in trauma care and patient advocacy.',
  cvUrl: '/uploads/sarah_johnson_cv.pdf',
  subscription: {
    plan: 'professional',
    billingCycle: 'monthly',
    applicationsRemaining: 25,
    startDate: '2024-01-01',
    endDate: '2024-02-01'
  }
};

export const mockRecruiter: User = {
  id: 'r1',
  name: 'Healthcare Recruiting Solutions',
  email: 'hiring@hcrsolutions.com',
  role: 'recruiter',
  employerStatus: 'approved',
  subscription: {
    plan: 'professional',
    billingCycle: 'monthly',
    revealsTotal: 25,
    revealsUsed: 8,
    revealsRemaining: 17,
    autoRenew: true,
    startDate: '2024-01-01',
    endDate: '2024-02-01'
  }
};

export const mockSavedJobs: SavedJob[] = [
  { id: 's1', jobId: '1', userId: 'u1', savedAt: '2024-01-15' },
  { id: 's2', jobId: '3', userId: 'u1', savedAt: '2024-01-14' },
];

export const mockApplications: JobApplication[] = [
  {
    id: 'a1',
    jobId: '2',
    applicantId: 'u1',
    applicantName: 'Sarah Johnson',
    applicantEmail: 'sarah.johnson@email.com',
    applicantPhone: '(555) 123-4567',
    experience: '5 years in Emergency Nursing',
    cvUrl: '/uploads/sarah_johnson_cv.pdf',
    status: 'reviewed',
    appliedAt: '2024-01-14'
  }
];

export const subscriptionPlans = {
  jobSeeker: [
    {
      id: 'js_starter',
      name: 'Starter',
      price: 9.99,
      features: [
        'Apply to 5 jobs per month',
        'Basic job alerts',
        'Profile visibility',
        'Email support'
      ],
      applicationsPerMonth: 5,
      recommended: false
    },
    {
      id: 'js_professional',
      name: 'Professional',
      price: 19.99,
      features: [
        'Apply to 30 jobs per month',
        'Priority job alerts',
        'Featured profile badge',
        'Resume review (1x/month)',
        'Priority support'
      ],
      applicationsPerMonth: 30,
      recommended: true
    },
    {
      id: 'js_enterprise',
      name: 'Premium',
      price: 39.99,
      features: [
        'Unlimited applications',
        'Instant job alerts',
        'Top profile placement',
        'Resume review (unlimited)',
        'Career coaching session',
        '24/7 priority support'
      ],
      applicationsPerMonth: -1, // unlimited
      recommended: false
    }
  ],
  recruiter: [
    {
      id: 'emp_agency',
      name: 'Agency',
      price: 40,
      features: [
        '10 candidate reveals per month',
        'View full applicant contact details',
        'Basic applicant tracking',
        'Email notifications',
        'Standard support'
      ],
      revealsPerMonth: 10,
      recommended: false
    },
    {
      id: 'emp_pro',
      name: 'Pro',
      price: 119,
      features: [
        '25 candidate reveals per month',
        'Advanced applicant tracking',
        'Featured job listings',
        'Match Alerts add-on eligible',
        'Priority support'
      ],
      revealsPerMonth: 25,
      recommended: true
    },
    {
      id: 'emp_enterprise',
      name: 'Enterprise',
      price: 249,
      features: [
        'Unlimited candidate reveals',
        'Premium applicant tracking',
        'Top placement for listings',
        'Custom branding on job cards',
        'Dedicated account manager',
        'Assessment reports add-on eligible',
        'Full analytics suite'
      ],
      revealsPerMonth: -1, // unlimited
      recommended: false
    }
  ]
};

export const employerAddOns = [
  {
    id: 'addon_match_alerts',
    name: 'Match Alerts',
    description: 'Get instant notifications when a professional matching your job criteria signs up.',
    price: 12,
    icon: 'Bell'
  },
  {
    id: 'addon_assessment',
    name: 'Assessment Reports',
    description: 'Receive AI-generated candidate assessment reports with skill scores and fit analysis.',
    price: 10,
    icon: 'ClipboardList'
  },
  {
    id: 'addon_branding',
    name: 'Employer Branding',
    description: 'Display your logo, banner, and "Hiring Now" badge on all your job listings.',
    price: 14,
    icon: 'Megaphone'
  }
];

export const mockPartners: Partner[] = [
  {
    id: 'p1',
    name: 'LinguaPro',
    logoUrl: '',
    commissionPct: 15,
    category: 'language',
    description: 'English language preparation courses for healthcare professionals'
  },
  {
    id: 'p2',
    name: 'LicenseEase',
    logoUrl: '',
    commissionPct: 20,
    category: 'licensing',
    description: 'End-to-end nursing license transfer and verification services'
  },
  {
    id: 'p3',
    name: 'NursePortfolio',
    logoUrl: '',
    commissionPct: 12,
    category: 'portfolio',
    description: 'Build a professional digital portfolio to stand out to employers'
  },
  {
    id: 'p4',
    name: 'DepartureReady',
    logoUrl: '',
    commissionPct: 18,
    category: 'training',
    description: 'Pre-departure orientation and cultural adaptation training'
  }
];

export const mockAds: Ad[] = [
  {
    id: 'ad1',
    title: 'LinguaPro — IELTS Prep for Nurses',
    imageUrl: '',
    targetUrl: 'https://linguapro.example.com',
    placement: 'job_feed_top',
    active: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    impressionCount: 1240
  },
  {
    id: 'ad2',
    title: 'LicenseEase — Fast-Track Licensing',
    imageUrl: '',
    targetUrl: 'https://licenseease.example.com',
    placement: 'dashboard_banner',
    active: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    impressionCount: 870
  }
];

export const mockRevenue = {
  mrr: 18640,
  arr: 223680,
  monthlyHistory: [
    { month: 'Sep', revenue: 12400, employers: 31, professionals: 88 },
    { month: 'Oct', revenue: 13900, employers: 35, professionals: 102 },
    { month: 'Nov', revenue: 15200, employers: 40, professionals: 115 },
    { month: 'Dec', revenue: 16800, employers: 46, professionals: 128 },
    { month: 'Jan', revenue: 17600, employers: 50, professionals: 140 },
    { month: 'Feb', revenue: 18640, employers: 56, professionals: 158 }
  ],
  planBreakdown: [
    { name: 'Agency ($40)', value: 1680, color: '#3b82f6' },
    { name: 'Pro ($119)', value: 4760, color: '#8b5cf6' },
    { name: 'Enterprise ($249)', value: 3486, color: '#06b6d4' },
    { name: 'Professional (Seeker)', value: 5980, color: '#10b981' },
    { name: 'Premium (Seeker)', value: 2734, color: '#f59e0b' }
  ],
  invoices: [
    { id: 'INV-2026-001', client: 'Healthcare Recruiting Solutions', amount: 119, plan: 'Pro', date: '2026-02-01', status: 'paid' },
    { id: 'INV-2026-002', client: 'TravelCare Staffing', amount: 249, plan: 'Enterprise', date: '2026-02-01', status: 'paid' },
    { id: 'INV-2026-003', client: 'Valley General HR', amount: 40, plan: 'Agency', date: '2026-02-03', status: 'paid' },
    { id: 'INV-2026-004', client: 'SunCare Medical', amount: 119, plan: 'Pro', date: '2026-02-10', status: 'pending' },
    { id: 'INV-2026-005', client: 'Pacific Surgery Group', amount: 249, plan: 'Enterprise', date: '2026-01-01', status: 'overdue' }
  ],
  commissions: [
    { partner: 'LinguaPro', sales: 12, revenue: 3600, commission: 540, pct: 15 },
    { partner: 'LicenseEase', sales: 8, revenue: 4000, commission: 800, pct: 20 },
    { partner: 'NursePortfolio', sales: 15, revenue: 2250, commission: 270, pct: 12 },
    { partner: 'DepartureReady', sales: 6, revenue: 1800, commission: 324, pct: 18 }
  ]
};
