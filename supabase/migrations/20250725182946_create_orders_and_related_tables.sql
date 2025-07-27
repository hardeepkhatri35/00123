create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  customer_name text,
  customer_phone text,
  delivery_address text,
  notes text,
  order_number integer,
  order_type text,
  payment_status text,
  status text,
  table_number integer,
  total_amount numeric,
  updated_at timestamp with time zone
);

create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  name text,
  price numeric,
  image_url text,
  description text,
  is_available boolean,
  category_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text,
  icon text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone
);