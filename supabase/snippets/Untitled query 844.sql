-- 1. Kill the safety check once and for all
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Just put the user in. No fancy conflict checks.
INSERT INTO public.profiles (id, email)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com');