// seed.js
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://redqfdkukiduywrlbwte.supabase.co'; // apne project ka URL yahan dalein
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZHFmZGt1a2lkdXl3cmxid3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDMyNDgsImV4cCI6MjA2ODkxOTI0OH0.3BtxSEafshep5gRnYuUDigYOCGBLE6t6zWOF98647EY'; // apni anon key dalein
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// DataSeeder.js se categories aur foodItems import karein

const categories = [
  { name: "Popular", icon: "👌" },
  { name: "AMATURE BEGINNING", icon: "🌱" }
];

const foodItems = [
  { name: "CORN CRUNCH", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://drive.google.com/uc?export=view&id=1r8MKDfGAfx35SG6gNSPk_aroDvQvtNCg", description: "Sweet Corn + Capsicum + Red Peprika", category: "AMATURE BEGINNING" },
  { name: "COUNTRY SPECIAL", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://drive.google.com/uc?export=view&id=1Lgjq9GOdBSZ7E1WDLtBzqgk_YHfOjEPM", description: "Onion, Capsicum + Tomato", category: "AMATURE BEGINNING" },
  { name: "FARMER CHOICE", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://drive.google.com/uc?export=view&id=1a6Ssm_ZZoNdiEUX6NkE1Whj5MlfDZlkv", description: "Onion + Capsicum + Fresh Tomato + Mushroom", category: "AMATURE BEGINNING" },
  { name: "Veg. Spice", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://drive.google.com/uc?export=view&id=1U7zo3hA0wWMUM3oByVUp3MYcgSOnDwLb", description: "Onion + Capsicum + Sweet Corn + Red Peprika", category: "AMATURE BEGINNING" },
  { name: "ON THE TRACK", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://drive.google.com/uc?export=view&id=1CxHMbgTwQlJ3lSMWyEjeuGXlZ08PEV4c", description: "Onion + Capsicum + Sweet Corn", category: "AMATURE BEGINNING" },
  { name: "DOOFLE-WOODEL", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://drive.google.com/uc?export=view&id=1W7nc4NPnawQ7y2g6eiQRUmUhBtkTmKmq", description: "Onion + Capsicum + Aloo Tikki", category: "AMATURE BEGINNING" },
  { name: "SPICY JOURNEY", price: 150, prices: { S: 150, M: 280, L: 460 }, image_url: "https://drive.google.com/uc?export=view&id=1XqjUVyh60F5E96aBXdBBof-iznIhKZBq", description: "Onion + Capsicum + Jalapeno", category: "AMATURE BEGINNING" }
];

async function seed() {
  // Purane data ko delete karo
  await supabase.from('food_items').delete().neq('id', '');
  await supabase.from('categories').delete().neq('id', '');

  // Categories insert karo
  const { data: catData, error: catError } = await supabase.from('categories').insert(categories).select();
  if (catError) { console.error('Category insert error:', catError); return; }
  // Category name se id map banao
  const catMap = {};
  (catData || []).forEach(cat => { catMap[cat.name] = cat.id; });

  // Food items ko category_id ke saath insert karo
  const foodItemsWithCatId = foodItems.map(item => ({
    ...item,
    category_id: catMap[item.category],
    prices: item.prices
  }));
  const { error: foodError } = await supabase.from('food_items').insert(foodItemsWithCatId);
  if (foodError) { console.error('Food insert error:', foodError); return; }
  console.log('Seeded successfully!');
}

seed(); 