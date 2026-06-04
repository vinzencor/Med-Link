-- Migration: Create ad_requests table for recruiter ads/partners workflow
-- Purpose: Recruiters submit ad requests; admins approve/reject.

create extension if not exists "uuid-ossp";

create table if not exists public.ad_requests (
  id uuid primary key default uuid_generate_v4(),
  recruiter_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  ad_type text not null check (ad_type in ('image', 'video')),
  placement text not null,
  target_location text not null,
  payment_reference text not null,
  budget numeric(12,2),
  document_url text,
  media_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_ad_requests_recruiter_id on public.ad_requests(recruiter_id);
create index if not exists idx_ad_requests_status on public.ad_requests(status);
create index if not exists idx_ad_requests_created_at on public.ad_requests(created_at desc);

alter table public.ad_requests enable row level security;

drop policy if exists "Recruiters can create own ad requests" on public.ad_requests;
create policy "Recruiters can create own ad requests"
  on public.ad_requests for insert
  with check (
    auth.uid() = recruiter_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'recruiter'
    )
  );

drop policy if exists "Recruiters can view own ad requests" on public.ad_requests;
create policy "Recruiters can view own ad requests"
  on public.ad_requests for select
  using (
    auth.uid() = recruiter_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins can update ad requests" on public.ad_requests;
create policy "Admins can update ad requests"
  on public.ad_requests for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins can delete ad requests" on public.ad_requests;
create policy "Admins can delete ad requests"
  on public.ad_requests for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create or replace function public.set_ad_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_set_ad_requests_updated_at on public.ad_requests;
create trigger trg_set_ad_requests_updated_at
before update on public.ad_requests
for each row
execute function public.set_ad_requests_updated_at();
