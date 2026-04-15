-- Run in Supabase SQL Editor if migrations are not applied via CLI.
-- Low-stock counts (DB-side, avoids loading all product rows).

CREATE OR REPLACE FUNCTION public.count_low_stock_products()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM products
  WHERE active = true AND quantity <= min_stock;
$$;

CREATE OR REPLACE FUNCTION public.get_low_stock_products()
RETURNS TABLE(
  id uuid,
  name text,
  quantity numeric,
  min_stock numeric,
  category text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name::text, quantity::numeric, min_stock::numeric, category::text
  FROM products
  WHERE active = true AND quantity <= min_stock;
$$;

-- Aggregated daily sales for reports / charts (replaces loading all bills + bill_items in Node).

CREATE OR REPLACE FUNCTION public.get_daily_sales_report(
  p_from timestamptz,
  p_to timestamptz
)
RETURNS TABLE(
  sale_date date,
  total_sales numeric,
  total_profit numeric,
  bill_count bigint,
  top_product text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH daily AS (
    SELECT
      (b.created_at AT TIME ZONE 'UTC')::date AS d,
      SUM(b.total)::numeric AS ts,
      SUM(bi.total - bi.cost_price * bi.quantity)::numeric AS tp,
      COUNT(DISTINCT b.id)::bigint AS bc
    FROM bills b
    INNER JOIN bill_items bi ON bi.bill_id = b.id
    WHERE b.created_at >= p_from AND b.created_at <= p_to
    GROUP BY (b.created_at AT TIME ZONE 'UTC')::date
  ),
  product_daily AS (
    SELECT
      (b.created_at AT TIME ZONE 'UTC')::date AS d,
      p.name AS pname,
      SUM(bi.quantity)::numeric AS qty
    FROM bills b
    INNER JOIN bill_items bi ON bi.bill_id = b.id
    INNER JOIN products p ON p.id = bi.product_id
    WHERE b.created_at >= p_from AND b.created_at <= p_to
    GROUP BY (b.created_at AT TIME ZONE 'UTC')::date, p.name
  ),
  ranked AS (
    SELECT
      d,
      pname,
      qty,
      ROW_NUMBER() OVER (PARTITION BY d ORDER BY qty DESC NULLS LAST) AS rn
    FROM product_daily
  )
  SELECT
    daily.d AS sale_date,
    daily.ts AS total_sales,
    daily.tp AS total_profit,
    daily.bc AS bill_count,
    COALESCE(r.pname, 'N/A')::text AS top_product
  FROM daily
  LEFT JOIN ranked r ON r.d = daily.d AND r.rn = 1
  ORDER BY sale_date;
$$;
