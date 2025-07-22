
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DataSeeder = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { name: "Popular", icon: "👌" }
  ];

  const foodItems = [
    // No food items - all categories removed
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
            Popular category with all their respective items and pricing.
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
