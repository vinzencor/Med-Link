-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enum for User Roles
create type user_role as enum ('recruiter', 'job_seeker', 'admin');

-- Create Profiles Table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  role user_role not null default 'job_seeker',
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Create Jobs Table
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  recruiter_id uuid references public.profiles(id) not null,
  title text not null,
  description text not null,
  location text not null,
  company_name text not null,
  salary_range text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on jobs
alter table public.jobs enable row level security;

-- Jobs Policies
create policy "Jobs are viewable by everyone"
  on public.jobs for select
  using ( true );

create policy "Recruiters can insert jobs"
  on public.jobs for insert
  with check (
    auth.uid() = recruiter_id and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'recruiter')
  );

create policy "Recruiters can update own jobs"
  on public.jobs for update
  using ( auth.uid() = recruiter_id );

create policy "Recruiters can delete own jobs"
  on public.jobs for delete
  using ( auth.uid() = recruiter_id );

-- Create Applications Table
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  seeker_id uuid references public.profiles(id) not null,
  status text not null default 'pending', -- pending, accepted, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(job_id, seeker_id)
);

-- Enable RLS on applications
alter table public.applications enable row level security;

-- Applications Policies
create policy "Recruiters can view applications for their jobs"
  on public.applications for select
  using (
    exists (
      select 1 from public.jobs
      where public.jobs.id = public.applications.job_id
      and public.jobs.recruiter_id = auth.uid()
    )
  );

create policy "Seekers can view their own applications"
  on public.applications for select
  using ( auth.uid() = seeker_id );

create policy "Seekers can insert applications"
  on public.applications for insert
  with check (
    auth.uid() = seeker_id and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'job_seeker')
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    case
      when new.email = 'rahulpradeepan55@gmail.com' then 'admin'::user_role
      else coalesce((new.raw_user_meta_data->>'role')::user_role, 'job_seeker')
    end,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

