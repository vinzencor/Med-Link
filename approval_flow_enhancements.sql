-- Migration: Approval Flow Enhancements
-- Description: Adds notifications and user_documents tables, plus profile fields for rejection.

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. User Documents Table
CREATE TABLE IF NOT EXISTS public.user_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'cv', 'education', 'certification'
    url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, type)
);

-- 3. Profile Enhancements
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS video_rejection_reason TEXT;

-- 4. RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. RLS for User Documents
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own docs" ON public.user_documents;
CREATE POLICY "Users can view own docs" ON public.user_documents FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all docs" ON public.user_documents;
CREATE POLICY "Admins can view all docs" ON public.user_documents FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update docs" ON public.user_documents;
CREATE POLICY "Admins can update docs" ON public.user_documents FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can insert own docs" ON public.user_documents;
CREATE POLICY "Users can insert own docs" ON public.user_documents FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
