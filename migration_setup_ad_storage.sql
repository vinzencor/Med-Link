-- Migration: Setup storage buckets and policies for ad workflow
-- Buckets:
--   ad-documents: recruiter proof docs (hospital registration, etc.)
--   ad-assets: poster images / video ads

insert into storage.buckets (id, name, public)
values
  ('ad-documents', 'ad-documents', true),
  ('ad-assets', 'ad-assets', true)
on conflict (id) do nothing;

-- Public read for admin/recruiter UI previews

drop policy if exists "Public Access ad-documents" on storage.objects;
create policy "Public Access ad-documents"
on storage.objects for select
using (bucket_id = 'ad-documents');

drop policy if exists "Public Access ad-assets" on storage.objects;
create policy "Public Access ad-assets"
on storage.objects for select
using (bucket_id = 'ad-assets');

-- Recruiter uploads only to own folder prefix: <auth.uid()>/...

drop policy if exists "Upload ad-documents own folder" on storage.objects;
create policy "Upload ad-documents own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'ad-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Upload ad-assets own folder" on storage.objects;
create policy "Upload ad-assets own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'ad-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Recruiter can delete only own uploaded objects; admin can delete all

drop policy if exists "Delete ad-documents own or admin" on storage.objects;
create policy "Delete ad-documents own or admin"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'ad-documents'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
);

drop policy if exists "Delete ad-assets own or admin" on storage.objects;
create policy "Delete ad-assets own or admin"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'ad-assets'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
);
