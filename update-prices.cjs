const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oaxerqspdvtnrzmqevvk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9heGVycXNwZHZ0bnJ6bXFldnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjE4NDAsImV4cCI6MjA2OTAzNzg0MH0.aK9n2tCgBryH-JOaZJYpsPTTGli-knbOX3-uWHl6O_Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePrices() {
  try {
    console.log('Updating AMATURE BEGINNING food items with prices...');
    
    // First, get the AMATURE BEGINNING category
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'AMATURE BEGINNING')
      .single();
    
    if (catError || !category) {
      console.error('Category not found:', catError);
      return;
    }
    
    console.log('Found category ID:', category.id);
    
    // Get all food items in this category
    const { data: foodItems, error: foodError } = await supabase
      .from('food_items')
      .select('id, name')
      .eq('category_id', category.id);
    
    if (foodError) {
      console.error('Error fetching food items:', foodError);
      return;
    }
    
    console.log(`Found ${foodItems.length} food items to update`);
    
    // Update each item with prices
    const prices = { S: 150, M: 280, L: 460 };
    
    for (const item of foodItems) {
      console.log(`Updating ${item.name}...`);
      
      const { error: updateError } = await supabase
        .from('food_items')
        .update({ prices: prices })
        .eq('id', item.id);
      
      if (updateError) {
        console.error(`Error updating ${item.name}:`, updateError);
      } else {
        console.log(`✅ Updated ${item.name}`);
      }
    }
    
    console.log('🎉 All prices updated successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

updatePrices(); 