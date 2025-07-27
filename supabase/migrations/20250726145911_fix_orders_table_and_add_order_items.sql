-- Create sequence for order_number first
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq;

-- Fix orders table - add auto-increment for order_number
ALTER TABLE orders 
ALTER COLUMN order_number SET DEFAULT nextval('orders_order_number_seq');

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  dish_name text NOT NULL,
  dish_price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  item_total numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
