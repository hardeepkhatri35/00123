import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CategoryCleaner = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categoriesToDelete = [
    "Sandwich",
    "Pizza", 
    "Noodles",
    "Manchurian",
    "Milk Shake",
    "Coffee"
  ];

  const deleteCategories = async () => {
    setLoading(true);
    try {
      console.log('Starting category deletion process...');

      // First, delete all food items in these categories
      for (const categoryName of categoriesToDelete) {
        console.log(`Processing category: ${categoryName}`);
        
        // Get category ID
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single();

        if (category) {
          // Delete food items in this category
          const { error: foodError } = await supabase
            .from('food_items')
            .delete()
            .eq('category_id', category.id);

          if (foodError) {
            console.error(`Error deleting food items for ${categoryName}:`, foodError);
          } else {
            console.log(`Deleted food items for category: ${categoryName}`);
          }

          // Delete the category
          const { error: categoryError } = await supabase
            .from('categories')
            .delete()
            .eq('id', category.id);

          if (categoryError) {
            console.error(`Error deleting category ${categoryName}:`, categoryError);
          } else {
            console.log(`Deleted category: ${categoryName}`);
          }
        } else {
          console.log(`Category ${categoryName} not found in database`);
        }
      }

      toast({
        title: "Success!",
        description: `Successfully deleted ${categoriesToDelete.length} categories and their food items`,
      });

    } catch (error) {
      console.error('Error during category deletion:', error);
      toast({
        title: "Error",
        description: `Failed to delete categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-600">Category Cleaner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will permanently delete these categories and all their food items from the database:
          </p>
          <div className="bg-red-50 p-3 rounded">
            <ul className="text-sm text-red-700 space-y-1">
              {categoriesToDelete.map((category, index) => (
                <li key={index}>• {category}</li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-red-500 bg-red-50 p-3 rounded border border-red-200">
            <strong>⚠️ Warning:</strong> This action cannot be undone! All food items in these categories will also be deleted.
          </div>
          <Button 
            onClick={deleteCategories} 
            disabled={loading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting Categories..." : "Delete Selected Categories"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCleaner;