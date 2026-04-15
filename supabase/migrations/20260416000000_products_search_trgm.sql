-- Speeds up POS product search: ilike '%q%' on name / barcode (substring match).
-- Apply in Supabase SQL Editor if migrations are not run via CLI.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS products_name_trgm_idx
  ON public.products
  USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS products_barcode_trgm_idx
  ON public.products
  USING gin (barcode gin_trgm_ops);
