import { Job, User, JobApplication, SavedJob } from '@/types';

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
  subscription: {
    plan: 'enterprise',
    billingCycle: 'yearly',
    jobPostsRemaining: undefined, // unlimited
    startDate: '2024-01-01',
    endDate: '2025-01-01'
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
      id: 'rec_starter',
      name: 'Starter',
      price: 99,
      features: [
        'Post up to 5 jobs',
        'Basic applicant tracking',
        'Email notifications',
        'Standard support'
      ],
      jobPostsAllowed: 5,
      recommended: false
    },
    {
      id: 'rec_professional',
      name: 'Professional',
      price: 249,
      features: [
        'Post up to 20 jobs',
        'Advanced applicant tracking',
        'Featured job listings',
        'Analytics dashboard',
        'Priority support'
      ],
      jobPostsAllowed: 20,
      recommended: true
    },
    {
      id: 'rec_enterprise',
      name: 'Enterprise',
      price: 499,
      features: [
        'Unlimited job posts',
        'Premium applicant tracking',
        'Top placement for listings',
        'Advanced analytics',
        'Dedicated account manager',
        'API access',
        'Custom branding'
      ],
      jobPostsAllowed: -1, // unlimited
      recommended: false
    }
  ]
};
