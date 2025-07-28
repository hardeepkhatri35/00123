-- Add size column to order_items table
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS size text DEFAULT 'M';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_size ON order_items(size); 