-- Migration to add details to jobs table

alter table public.jobs 
add column if not exists job_type text,
add column if not exists category text,
add column if not exists requirements text[],
add column if not exists benefits text[];

-- Optional: Update existing rows if any (not needed for new app)
