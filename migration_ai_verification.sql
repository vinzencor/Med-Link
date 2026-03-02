-- Migration: Add AI verification fields to user_documents and applications tables
-- This enables AI-powered document verification and CV validation

-- Add AI verification fields to user_documents table
ALTER TABLE public.user_documents
ADD COLUMN IF NOT EXISTS ai_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS ai_analysis TEXT,
ADD COLUMN IF NOT EXISTS ai_extracted_data JSONB,
ADD COLUMN IF NOT EXISTS ai_issues TEXT[],
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add AI CV validation fields to applications table
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS cv_ai_validated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cv_ai_confidence NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS cv_ai_analysis TEXT,
ADD COLUMN IF NOT EXISTS cv_quality TEXT CHECK (cv_quality IN ('excellent', 'good', 'fair', 'poor')),
ADD COLUMN IF NOT EXISTS cv_sections TEXT[],
ADD COLUMN IF NOT EXISTS cv_validation_issues TEXT[];

-- Create index for faster queries on verified documents
CREATE INDEX IF NOT EXISTS idx_user_documents_ai_verified ON public.user_documents(ai_verified);
CREATE INDEX IF NOT EXISTS idx_user_documents_status ON public.user_documents(status);
CREATE INDEX IF NOT EXISTS idx_applications_cv_validated ON public.applications(cv_ai_validated);

-- Add comment for documentation
COMMENT ON COLUMN public.user_documents.ai_verified IS 'Whether the document has been verified by AI';
COMMENT ON COLUMN public.user_documents.ai_confidence IS 'AI confidence score (0-100)';
COMMENT ON COLUMN public.user_documents.ai_analysis IS 'Detailed AI analysis of the document';
COMMENT ON COLUMN public.user_documents.ai_extracted_data IS 'Structured data extracted by AI (license number, expiry date, etc.)';
COMMENT ON COLUMN public.user_documents.ai_issues IS 'Array of issues found by AI verification';

COMMENT ON COLUMN public.applications.cv_ai_validated IS 'Whether the CV has been validated by AI as a genuine resume';
COMMENT ON COLUMN public.applications.cv_ai_confidence IS 'AI confidence that this is a valid CV (0-100)';
COMMENT ON COLUMN public.applications.cv_ai_analysis IS 'AI analysis of CV quality and content';
COMMENT ON COLUMN public.applications.cv_quality IS 'AI-assessed quality of the CV';
COMMENT ON COLUMN public.applications.cv_sections IS 'Sections found in the CV by AI';

-- Update RLS policies to hide unverified documents from recruiters
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Recruiters can view applicant documents" ON public.user_documents;

-- Create new policy: Recruiters can only see verified documents of applicants
CREATE POLICY "Recruiters can view verified applicant documents"
ON public.user_documents
FOR SELECT
USING (
  -- Users can see their own documents regardless of verification status
  auth.uid() = user_id
  OR
  -- Admins can see all documents
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
  OR
  -- Recruiters can only see verified documents (status = 'verified' AND ai_verified = true)
  (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'recruiter'
    )
    AND status = 'verified'
    AND ai_verified = true
  )
);

-- Create function to auto-update verification timestamp
CREATE OR REPLACE FUNCTION update_verified_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
    NEW.verified_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update verified_at
DROP TRIGGER IF EXISTS trigger_update_verified_at ON public.user_documents;
CREATE TRIGGER trigger_update_verified_at
BEFORE UPDATE ON public.user_documents
FOR EACH ROW
EXECUTE FUNCTION update_verified_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.user_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.applications TO authenticated;

