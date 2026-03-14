-- Migration: Profile Wizard Fields
-- Description: Adds JSONB columns to profiles for Education, Certifications, and Preferences.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.education IS 'Array of education objects: {school, degree, field, start_date, end_date}';
COMMENT ON COLUMN public.profiles.certifications IS 'Array of certification objects: {name, issuer, date, expiry}';
COMMENT ON COLUMN public.profiles.preferences IS 'Job preferences object: {desired_role, locations, salary_expectation, job_type}';
