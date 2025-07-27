const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oaxerqspdvtnrzmqevvk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9heGVycXNwZHZ0bnJ6bXFldnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjE4NDAsImV4cCI6MjA2OTAzNzg0MH0.aK9n2tCgBryH-JOaZJYpsPTTGli-knbOX3-uWHl6O_Q';

const supabase = createClient(supabaseUrl, supabaseKey);

const newImageUrls = {
  "CORN CRUNCH": "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.48.01%20PM.jpeg",
  "COUNTRY SPECIAL": "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.49.09%20PM.jpeg",
  "FARMER CHOICE": "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.50.10%20PM.jpeg",
  "Veg. Spice": "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.50.56%20PM.jpeg",
  "ON THE TRACK": "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.51.34%20PM.jpeg",
  "DOOFLE-WOODEL": "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.52.34%20PM.jpeg",
  "SPICY JOURNEY": "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.53.00%20PM.jpeg"
};

async function updateImages() {
  try {
    console.log('Updating AMATURE BEGINNING food items with new images...');
    
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
    
    // Update each food item with new image URL
    for (const [itemName, imageUrl] of Object.entries(newImageUrls)) {
      console.log(`Updating ${itemName}...`);
      
      const { error: updateError } = await supabase
        .from('food_items')
        .update({ image_url: imageUrl })
        .eq('name', itemName)
        .eq('category_id', category.id);
      
      if (updateError) {
        console.error(`Error updating ${itemName}:`, updateError);
      } else {
        console.log(`✅ Updated ${itemName} with new image`);
      }
    }
    
    console.log('🎉 All images updated successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

updateImages(); 