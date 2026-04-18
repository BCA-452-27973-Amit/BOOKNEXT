-- Migration: Add `role` column to `profiles` and admin RLS policies
-- Run this in Supabase SQL editor or apply via your migration system.

BEGIN;

-- 1) Add `role` column to profiles (default 'user')
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- 2) Ensure RLS enabled (safe if already enabled)
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

-- 3) Admin policies: allow users with profile.role = 'admin' to SELECT payments and orders
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

COMMIT;

-- IMPORTANT: After running this migration, mark any existing admin users by updating
-- the `profiles.role` value. Example (run once, replacing emails):
-- UPDATE public.profiles p
-- SET role = 'admin'
-- FROM auth.users u
-- WHERE u.id = p.id AND u.email IN ('admin@example.com');
