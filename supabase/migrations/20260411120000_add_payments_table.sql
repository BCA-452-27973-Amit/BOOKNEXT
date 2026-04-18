-- Migration: Add payments table for manual payment proof workflow
-- Run this in the Supabase SQL editor or include in your migration set

-- 1. PAYMENTS TABLE (Manual payment proof uploads)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  method TEXT NOT NULL, -- 'bank_transfer' | 'upi' | 'manual'
  status TEXT NOT NULL DEFAULT 'pending', -- pending|verified|failed
  reference TEXT,
  provider_txn_id TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  proof_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can insert their own payment records
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- Users can view their own payments
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);


-- Users can update their own payments (attach proof) but not status
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
CREATE POLICY "Users can update own payments" ON public.payments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: Admins must verify (status change) via a server-side function using
-- the service_role key (Edge Function recommended). Do not allow clients to
-- update `status` directly.
