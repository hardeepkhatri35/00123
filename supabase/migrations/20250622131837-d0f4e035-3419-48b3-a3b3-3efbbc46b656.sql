
-- Create enum for order types
CREATE TYPE order_type AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');

-- Create enum for order status
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED');

-- Create orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number SERIAL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  order_type order_type NOT NULL DEFAULT 'DINE_IN',
  status order_status NOT NULL DEFAULT 'PENDING',
  table_number INTEGER,
  delivery_address TEXT,
  notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  dish_name TEXT NOT NULL,
  dish_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  item_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for now, you can restrict later)
CREATE POLICY "Allow public read access on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on orders" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Allow public read access on order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on order_items" ON public.order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on order_items" ON public.order_items FOR DELETE USING (true);

-- Enable realtime for orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.orders;
ALTER publication supabase_realtime ADD TABLE public.order_items;
