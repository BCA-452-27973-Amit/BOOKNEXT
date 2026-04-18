-- Migration: Admin RLS for books table
BEGIN;

ALTER TABLE IF EXISTS public.books ENABLE ROW LEVEL SECURITY;

-- Admin policies: allow authenticated users with profiles.role = 'admin' to insert/update/delete
DROP POLICY IF EXISTS "Admins insert books" ON public.books;
CREATE POLICY "Admins insert books" ON public.books
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins update books" ON public.books;
CREATE POLICY "Admins update books" ON public.books
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins delete books" ON public.books;
CREATE POLICY "Admins delete books" ON public.books
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

COMMIT;
