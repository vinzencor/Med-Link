-- Migration: Setup Storage Buckets (Updated)
-- Description: Creates the necessary storage buckets and configures unique RLS policies to avoid collisions.

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('profile-videos', 'profile-videos', true),
    ('user-documents', 'user-documents', true),
    ('profile-avatars', 'profile-avatars', true),
    ('application-cvs', 'application-cvs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. profile-videos Policies
DROP POLICY IF EXISTS "Public Access profile-videos" ON storage.objects;
CREATE POLICY "Public Access profile-videos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-videos');

DROP POLICY IF EXISTS "Upload profile-videos" ON storage.objects;
CREATE POLICY "Upload profile-videos" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-videos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Delete profile-videos" ON storage.objects;
CREATE POLICY "Delete profile-videos" ON storage.objects FOR DELETE 
USING (bucket_id = 'profile-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. user-documents Policies
DROP POLICY IF EXISTS "Public Access user-documents" ON storage.objects;
CREATE POLICY "Public Access user-documents" ON storage.objects FOR SELECT USING (bucket_id = 'user-documents');

DROP POLICY IF EXISTS "Upload user-documents" ON storage.objects;
CREATE POLICY "Upload user-documents" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'user-documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Delete user-documents" ON storage.objects;
CREATE POLICY "Delete user-documents" ON storage.objects FOR DELETE 
USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. profile-avatars Policies
DROP POLICY IF EXISTS "Public Access profile-avatars" ON storage.objects;
CREATE POLICY "Public Access profile-avatars" ON storage.objects FOR SELECT USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "Upload profile-avatars" ON storage.objects;
CREATE POLICY "Upload profile-avatars" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Delete profile-avatars" ON storage.objects;
CREATE POLICY "Delete profile-avatars" ON storage.objects FOR DELETE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. application-cvs Policies
DROP POLICY IF EXISTS "Public Access application-cvs" ON storage.objects;
CREATE POLICY "Public Access application-cvs" ON storage.objects FOR SELECT USING (bucket_id = 'application-cvs');

DROP POLICY IF EXISTS "Upload application-cvs" ON storage.objects;
CREATE POLICY "Upload application-cvs" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'application-cvs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Delete application-cvs" ON storage.objects;
CREATE POLICY "Delete application-cvs" ON storage.objects FOR DELETE 
USING (bucket_id = 'application-cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
