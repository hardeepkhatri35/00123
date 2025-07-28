const fetch = require('node-fetch');

const supabaseUrl = 'https://oaxerqspdvtnrzmqevvk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9heGVycXNwZHZ0bnJ6bXFldnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjE4NDAsImV4cCI6MjA2OTAzNzg0MH0.aK9n2tCgBryH-JOaZJYpsPTTGli-knbOX3-uWHl6O_Q';

async function createTableIfNotExists() {
  const sql = `
    create table if not exists public.orders (
      id uuid primary key default gen_random_uuid(),
      created_at timestamp with time zone default timezone('utc'::text, now()),
      customer_name text,
      customer_phone text,
      delivery_address text,
      notes text,
      order_number integer,
      order_type text,
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
  `;

  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });

  if (res.ok) {
    console.log('Tables checked/created successfully!');
  } else {
    const error = await res.text();
    console.error('Error creating tables:', error);
  }
}

createTableIfNotExists(); 