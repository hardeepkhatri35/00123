// cleanup_and_seed.cjs
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://redqfdkukiduywrlbwte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZHFmZGt1a2lkdXl3cmxid3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDMyNDgsImV4cCI6MjA2ODkxOTI0OH0.3BtxSEafshep5gRnYuUDigYOCGBLE6t6zWOF98647EY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const categories = [
  { name: "Popular", icon: "👌" },
  { name: "AMATURE BEGINNING", icon: "🌱" }
];

const foodItems = [
  { name: "CORN CRUNCH", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.48.01%20PM.jpeg", description: "Sweet Corn + Capsicum + Red Peprika", category: "AMATURE BEGINNING" },
  { name: "COUNTRY SPECIAL", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.49.09%20PM.jpeg", description: "Onion, Capsicum + Tomato", category: "AMATURE BEGINNING" },
  { name: "FARMER CHOICE", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.50.10%20PM.jpeg", description: "Onion + Capsicum + Fresh Tomato + Mushroom", category: "AMATURE BEGINNING" },
  { name: "Veg. Spice", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.50.56%20PM.jpeg", description: "Onion + Capsicum + Sweet Corn + Red Peprika", category: "AMATURE BEGINNING" },
  { name: "ON THE TRACK", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.51.34%20PM.jpeg", description: "Onion + Capsicum + Sweet Corn", category: "AMATURE BEGINNING" },
  { name: "DOOFLE-WOODEL", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.52.34%20PM.jpeg", description: "Onion + Capsicum + Aloo Tikki", category: "AMATURE BEGINNING" },
  { name: "SPICY JOURNEY", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.53.00%20PM.jpeg", description: "Onion + Capsicum + Jalapeno", category: "AMATURE BEGINNING" }
];

async function cleanupAndSeed() {
  // 1. Saare food_items delete karo
  await supabase.from('food_items').delete().neq('id', '');
  // 2. Saare categories delete karo
  await supabase.from('categories').delete().neq('id', '');

  // 3. Unique constraint lagane ki koshish karo (agar pehle se nahi hai)
  try {
    await supabase.rpc('execute_sql', { sql: `alter table public.categories add constraint unique_category_name unique (name);` });
  } catch (e) {
    // Agar already exists error aaye to ignore karo
    if (!String(e).includes('already exists')) {
      console.error('Unique constraint error:', e);
    }
  }

  // 4. Categories insert karo
  const { data: catData, error: catError } = await supabase.from('categories').insert(categories).select();
  if (catError) { console.error('Category insert error:', catError); return; }
  const catMap = {};
  (catData || []).forEach(cat => { catMap[cat.name] = cat.id; });

  // 5. Food items ko category_id ke saath insert karo
  const foodItemsWithCatId = foodItems.map(item => {
    const { category, ...rest } = item;
    return {
      ...rest,
      category_id: catMap[item.category],
      prices: item.prices
    };
  });
  const { error: foodError } = await supabase.from('food_items').insert(foodItemsWithCatId);
  if (foodError) { console.error('Food insert error:', foodError); return; }
  console.log('Cleanup + Seeded successfully!');
}

cleanupAndSeed(); 