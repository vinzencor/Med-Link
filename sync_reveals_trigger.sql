-- Migration: Sync Reveal Counters
-- Description: Sets up a trigger to automatically keep reveals_used in sync with profile_reveals table.

-- 1. Correct existing counts for all recruiters
UPDATE public.profiles p
SET reveals_used = (
    SELECT count(*)
    FROM public.profile_reveals pr
    WHERE pr.recruiter_id = p.id
)
WHERE role = 'recruiter';

-- 2. Create the trigger function to handle future changes
CREATE OR REPLACE FUNCTION public.handle_reveal_count_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.profiles
        SET reveals_used = reveals_used + 1
        WHERE id = NEW.recruiter_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles
        SET reveals_used = GREATEST(0, reveals_used - 1)
        WHERE id = OLD.recruiter_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach the trigger to the profile_reveals table
DROP TRIGGER IF EXISTS on_reveal_change ON public.profile_reveals;
CREATE TRIGGER on_reveal_change
AFTER INSERT OR DELETE ON public.profile_reveals
FOR EACH ROW EXECUTE FUNCTION public.handle_reveal_count_change();
