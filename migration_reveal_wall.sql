-- Migration: Dynamic Pricing & Reveal Wall
-- Description: Adds tables for subscription plans and tracking candidate reveals.

-- 1. Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY,
    user_type TEXT NOT NULL CHECK (user_type IN ('job_seeker', 'recruiter', 'student')),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
    features TEXT[] DEFAULT '{}',
    applications_per_month INTEGER DEFAULT -1, -- -1 for unlimited
    reveals_per_month INTEGER DEFAULT -1,      -- -1 for unlimited
    recommended BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Initial Plans (based on mockData.ts)
INSERT INTO public.subscription_plans (id, user_type, name, price, features, applications_per_month, reveals_per_month, recommended)
VALUES 
('js_starter', 'job_seeker', 'Starter', 9.99, '{"Apply to 5 jobs per month", "Basic job alerts", "Profile visibility", "Email support"}', 5, 0, false),
('js_professional', 'job_seeker', 'Professional', 19.99, '{"Apply to 30 jobs per month", "Priority job alerts", "Featured profile badge", "Resume review (1x/month)", "Priority support"}', 30, 0, true),
('js_enterprise', 'job_seeker', 'Premium', 39.99, '{"Unlimited applications", "Instant job alerts", "Top profile placement", "Resume review (unlimited)", "Career coaching session", "24/7 priority support"}', -1, 0, false),
('emp_agency', 'recruiter', 'Agency', 40.00, '{"10 candidate reveals per month", "View full applicant contact details", "Basic applicant tracking", "Email notifications", "Standard support"}', 0, 10, false),
('emp_pro', 'recruiter', 'Pro', 119.00, '{"25 candidate reveals per month", "Advanced applicant tracking", "Featured job listings", "Match Alerts add-on eligible", "Priority support"}', 0, 25, true),
('emp_enterprise', 'recruiter', 'Enterprise', 249.00, '{"Unlimited candidate reveals", "Premium applicant tracking", "Top placement for listings", "Custom branding on job cards", "Dedicated account manager", "Assessment reports add-on eligible", "Full analytics suite"}', 0, -1, false)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    features = EXCLUDED.features;

-- 2. User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id TEXT REFERENCES public.subscription_plans(id) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'past_due', 'canceled')),
    billing_cycle TEXT DEFAULT 'monthly',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- 3. Profile Reveals (The "Reveal Wall")
CREATE TABLE IF NOT EXISTS public.profile_reveals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    seeker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(recruiter_id, seeker_id)
);

-- 4. Update Profiles with usage stats
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS reveals_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS applications_used INTEGER DEFAULT 0;

-- 5. RLS Policies for New Tables

-- Subscription Plans: Read for all, Write for Admin
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscription plans are viewable by everyone" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Only admins can manage subscription plans" ON public.subscription_plans 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Subscriptions: Read self/admin, Write internal (usually done via edge functions or service role)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Profile Reveals: Read self/recruiter
ALTER TABLE public.profile_reveals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters can see who they revealed" ON public.profile_reveals FOR SELECT USING (auth.uid() = recruiter_id);
CREATE POLICY "Seekers can see who revealed them" ON public.profile_reveals FOR SELECT USING (auth.uid() = seeker_id);
CREATE POLICY "Recruiters can insert reveals" ON public.profile_reveals FOR INSERT WITH CHECK (auth.uid() = recruiter_id);
