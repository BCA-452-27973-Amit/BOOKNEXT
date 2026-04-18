-- Migration: Upsert admin profile(s) for specified admin emails
-- Idempotent: safe to run multiple times

BEGIN;

-- Insert or update profiles for admin emails if corresponding auth.users exist
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'full_name', 'Administrator'),
       'admin',
       now(),
       now()
FROM auth.users u
WHERE u.email IN ('admin@bookwoven.test')
ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role,
      updated_at = now();

COMMIT;

-- NOTE: If you want to add more admin emails, edit the IN (...) list above.
