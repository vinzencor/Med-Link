-- Migration: Fix Plan Column Names
-- Description: Renames applications_per_month and reveals_per_month to match the application code.

ALTER TABLE public.subscription_plans 
RENAME COLUMN applications_per_month TO applications_limit;

ALTER TABLE public.subscription_plans 
RENAME COLUMN reveals_per_month TO reveals_limit;
