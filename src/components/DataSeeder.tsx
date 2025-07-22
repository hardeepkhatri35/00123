
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DataSeeder = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { name: "Popular", icon: "👌" },
    { name: "Sandwich", icon: "🥪" },
    { name: "Pizza", icon: "🍕" },
    { name: "Noodles", icon: "🍜" },
    { name: "Manchurian", icon: "🥟" },
    { name: "Milk Shake", icon: "🥤" },
    { name: "Coffee", icon: "☕" }
  ];

  const foodItems = [
    // Sandwich Category
    {
      name: "Potato Sandwich",
      price: 30,
      image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80",
      description: "Fresh potato sandwich with crispy vegetables",
      category: "Sandwich"
    },
    {
      name: "Cheese Sandwich",
      price: 40,
      image_url: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80",
      description: "Grilled cheese sandwich with melted cheese",
      category: "Sandwich"
    },
    {
      name: "Chocolate Sandwich",
      price: 60,
      image_url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80",
      description: "Sweet chocolate sandwich perfect for dessert",
      category: "Sandwich"
    },
    // Pizza Category
    {
      name: "Classic Pizza",
      price: 160,
      image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1081&q=80",
      description: "Traditional margherita pizza with fresh basil",
      category: "Pizza"
    },
    {
      name: "Cheese Corn Pizza",
      price: 200,
      image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80",
      description: "Delicious pizza topped with cheese and sweet corn",
      category: "Pizza"
    },
    {
      name: "Corn Paneer Pizza",
      price: 250,
      image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Premium pizza with paneer and corn toppings",
      category: "Pizza"
    },
    // Noodles Category
    {
      name: "Chow Mein (Small)",
      price: 50,
      image_url: "https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1100&q=80",
      description: "Classic stir-fried noodles with vegetables",
      category: "Noodles"
    },
    {
      name: "Chow Mein (Large)",
      price: 70,
      image_url: "https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1100&q=80",
      description: "Large portion of classic stir-fried noodles",
      category: "Noodles"
    },
    {
      name: "Manchurian Noodle (Small)",
      price: 50,
      image_url: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Noodles with manchurian sauce",
      category: "Noodles"
    },
    {
      name: "Manchurian Noodle (Large)",
      price: 90,
      image_url: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Large portion of noodles with manchurian sauce",
      category: "Noodles"
    },
    // Manchurian Category
    {
      name: "Gravy Manchurian (Small)",
      price: 40,
      image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1464&q=80",
      description: "Delicious manchurian balls in rich gravy",
      category: "Manchurian"
    },
    {
      name: "Gravy Manchurian (Large)",
      price: 80,
      image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1464&q=80",
      description: "Large portion of manchurian balls in rich gravy",
      category: "Manchurian"
    },
    {
      name: "Dry Manchurian (Small)",
      price: 40,
      image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1517&q=80",
      description: "Crispy dry manchurian with spices",
      category: "Manchurian"
    },
    {
      name: "Dry Manchurian (Large)",
      price: 80,
      image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1517&q=80",
      description: "Large portion of crispy dry manchurian",
      category: "Manchurian"
    },
    // Milk Shake Category
    {
      name: "Cold Coffee",
      price: 50,
      image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80",
      description: "Refreshing cold coffee shake",
      category: "Milk Shake"
    },
    {
      name: "Chocolate Shake",
      price: 60,
      image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Rich and creamy chocolate milkshake",
      category: "Milk Shake"
    },
    {
      name: "Oreo Shake",
      price: 70,
      image_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Delicious Oreo cookies milkshake",
      category: "Milk Shake"
    },
    // Coffee Category
    {
      name: "Hot Coffee",
      price: 100,
      image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Fresh hot coffee brewed to perfection",
      category: "Coffee"
    },
    {
      name: "Strong Coffee",
      price: 150,
      image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
      description: "Extra strong coffee for coffee lovers",
      category: "Coffee"
    }
  ];

  const seedData = async () => {
    setLoading(true);
    try {
      console.log('Starting data seeding process...');

      // Step 1: Check if categories already exist
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('*');

      console.log('Existing categories:', existingCategories);

      // Step 2: Insert categories one by one to handle conflicts better
      const categoryMap: { [key: string]: string } = {};
      
      for (const category of categories) {
        console.log(`Processing category: ${category.name}`);
        
        // Check if category already exists
        const existing = existingCategories?.find(cat => cat.name === category.name);
        
        if (existing) {
          console.log(`Category ${category.name} already exists with ID: ${existing.id}`);
          categoryMap[category.name] = existing.id;
        } else {
          // Insert new category
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();

          if (categoryError) {
            console.error(`Error creating category ${category.name}:`, categoryError);
            throw categoryError;
          }

          console.log(`Created category ${category.name} with ID: ${newCategory.id}`);
          categoryMap[category.name] = newCategory.id;
        }
      }

      console.log('Category mapping:', categoryMap);

      // Step 3: Check existing food items
      const { data: existingFoodItems } = await supabase
        .from('food_items')
        .select('name');

      const existingNames = existingFoodItems?.map(item => item.name) || [];
      console.log('Existing food items:', existingNames);

      // Step 4: Filter out existing food items
      const newFoodItems = foodItems.filter(item => !existingNames.includes(item.name));
      console.log(`Found ${newFoodItems.length} new food items to add`);

      if (newFoodItems.length === 0) {
        toast({
          title: "Info",
          description: "All food items already exist in the database.",
        });
        return;
      }

      // Step 5: Process food items with category IDs
      const foodItemsWithCategoryIds = newFoodItems.map(item => {
        const categoryId = categoryMap[item.category];
        if (!categoryId) {
          console.error(`No category ID found for category: ${item.category}`);
          throw new Error(`Category "${item.category}" not found`);
        }
        
        return {
          name: item.name,
          price: item.price,
          image_url: item.image_url,
          description: item.description,
          category_id: categoryId,
          is_available: true
        };
      });

      console.log('Processing food items with category IDs...');

      // Step 6: Insert food items in batches
      const batchSize = 5;
      let totalInserted = 0;

      for (let i = 0; i < foodItemsWithCategoryIds.length; i += batchSize) {
        const batch = foodItemsWithCategoryIds.slice(i, i + batchSize);
        console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}: ${batch.length} items`);

        const { data: insertedItems, error: foodError } = await supabase
          .from('food_items')
          .insert(batch)
          .select();

        if (foodError) {
          console.error('Error inserting food items batch:', foodError);
          throw foodError;
        }

        totalInserted += insertedItems?.length || 0;
        console.log(`Successfully inserted ${insertedItems?.length} items in this batch`);
      }

      console.log(`Data seeding completed successfully! Total items inserted: ${totalInserted}`);

      toast({
        title: "Success!",
        description: `Successfully added ${totalInserted} new food items across ${categories.length} categories`,
      });

    } catch (error) {
      console.error('Error during data seeding:', error);
      toast({
        title: "Error",
        description: `Failed to seed data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
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
            This will populate your database with categories and food items including:
            Popular, Sandwich, Pizza, Noodles, Manchurian, Milk Shake, and Coffee categories
            with all their respective items and pricing.
          </p>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Note:</strong> This process will only add new items that don't already exist. 
            Existing items will be skipped to prevent duplicates.
          </div>
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
