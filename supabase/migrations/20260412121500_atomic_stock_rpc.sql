-- Migration: atomic stock RPC to prevent oversell
BEGIN;

-- Function: purchase_book(book_id uuid, qty int)
DROP FUNCTION IF EXISTS public.purchase_book(uuid, integer);
CREATE FUNCTION public.purchase_book(_book_id uuid, _qty integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count int;
BEGIN
  IF _qty <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.books
  SET stock = stock - _qty
  WHERE id = _book_id AND stock >= _qty;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count = 0 THEN
    RETURN FALSE; -- not enough stock
  END IF;

  RETURN TRUE;
END;
$$;

COMMIT;
