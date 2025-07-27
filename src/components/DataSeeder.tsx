
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DataSeeder = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const category = {
    name: "AMATURE BEGINNING",
    icon: "utensils",
    image_url: ""
  };

  const foodItems = [
    {
      name: "CORN CRUNCH",
      description: "Sweet Corn + Capsicum",
      image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.48.01%20PM.jpeg",
      prices: { S: 150, M: 280, L: 460 }
    },
    {
      name: "COUNTRY SPECIAL",
      description: "Onion, Capsicum + Tomato",
      image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.49.09%20PM.jpeg",
      prices: { S: 150, M: 280, L: 460 }
    },
    {
      name: "FARMER CHOICE",
      description: "Onion + Capsicum + Fresh, Tomato + Mushroom",
      image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.50.10%20PM.jpeg",
      prices: { S: 150, M: 280, L: 460 }
    },
    {
      name: "Veg. Spice",
      description: "Onion + Capsicum + Sweet Corn + Red Peprika",
      image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.50.56%20PM.jpeg",
      prices: { S: 150, M: 280, L: 460 }
    },
    {
      name: "ON THE TRACK",
      description: "Onion + Capsicum + Sweet Corn",
      image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.51.34%20PM.jpeg",
      prices: { S: 150, M: 280, L: 460 }
    },
    {
      name: "DOOFLE-WOODEL",
      description: "Onion + Capsicum + Aloo Tikki",
      image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.52.34%20PM.jpeg",
      prices: { S: 150, M: 280, L: 460 }
    },
    {
      name: "SPICY JOURNEY",
      description: "Onion + Capsicum + Jalapeno",
      image_url: "https://redqfdkukiduywrlbwte.supabase.co/storage/v1/object/public/food-images//WhatsApp%20Image%202025-07-23%20at%2012.53.00%20PM.jpeg",
      prices: { S: 150, M: 280, L: 460 }
    },
  ];

  const seedData = async () => {
    setLoading(true);
    try {
      // 1. Insert or get category
      let { data: existingCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('name', category.name);
      let categoryId;
      if (existingCategories && existingCategories.length > 0) {
        categoryId = existingCategories[0].id;
        } else {
        const { data: newCategory, error: catError } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();
        if (catError) throw catError;
        categoryId = newCategory.id;
        }

      // 2. Insert food items
      for (const item of foodItems) {
        // Check if item exists
        const { data: existing } = await supabase
        .from('food_items')
          .select('id')
          .eq('name', item.name)
          .eq('category_id', categoryId);
        if (existing && existing.length > 0) continue;
        const { error: foodError } = await supabase
          .from('food_items')
          .insert([{ ...item, category_id: categoryId, is_available: true }]);
        if (foodError) throw foodError;
        }
      toast({ title: "Success!", description: "Category and food items added." });
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to seed data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Seeder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will add the 'AMATURE BEGINNING' category and its food items.
          </p>
          <Button 
            onClick={seedData} 
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {loading ? "Seeding Data..." : "Seed Menu Data"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSeeder;
