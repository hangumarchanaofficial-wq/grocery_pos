-- Atomic billing: stock + bill + bill_items in one transaction.
-- Run in Supabase SQL Editor if not using migration CLI.

CREATE SEQUENCE IF NOT EXISTS bill_number_seq;

CREATE OR REPLACE FUNCTION public.process_bill(
  p_items jsonb,
  p_subtotal numeric,
  p_tax numeric,
  p_discount numeric,
  p_total numeric,
  p_payment_method text,
  p_paid_amount numeric,
  p_change_amount numeric,
  p_customer_id uuid,
  p_user_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_product record;
  v_bill_id uuid;
  v_bill_number text;
  v_name text;
BEGIN
  -- Lock all stock rows and validate before writing any bill
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM products WHERE id = (v_item->>'product_id')::uuid FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found';
    END IF;
    IF NOT v_product.active THEN
      RAISE EXCEPTION 'One or more products are unavailable';
    END IF;
    IF v_product.quantity < (v_item->>'quantity')::integer THEN
      v_name := COALESCE(v_product.name, 'a product');
      RAISE EXCEPTION 'Insufficient stock for %', v_name;
    END IF;
  END LOOP;

  v_bill_number := 'BILL-' || TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYYMMDD') || '-' ||
    LPAD(nextval('bill_number_seq')::text, 6, '0');

  INSERT INTO bills (
    bill_number, subtotal, tax, discount, total,
    payment_method, paid_amount, change_amount, customer_id, user_id
  )
  VALUES (
    v_bill_number,
    p_subtotal,
    p_tax,
    p_discount,
    p_total,
    p_payment_method,
    p_paid_amount,
    p_change_amount,
    p_customer_id,
    p_user_id
  )
  RETURNING id INTO v_bill_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    UPDATE products
    SET quantity = quantity - (v_item->>'quantity')::integer
    WHERE id = (v_item->>'product_id')::uuid;

    INSERT INTO bill_items (bill_id, product_id, quantity, price, cost_price, total)
    VALUES (
      v_bill_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::numeric,
      COALESCE(NULLIF(v_item->>'cost_price', '')::numeric, 0),
      (v_item->>'total')::numeric
    );
  END LOOP;

  RETURN jsonb_build_object(
    'bill_id', v_bill_id,
    'bill_number', v_bill_number
  );
END;
$$;
