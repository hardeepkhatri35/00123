
import { useState } from "react";
import RestaurantHeader from "@/components/RestaurantHeader";
import CategoryNav from "@/components/CategoryNav";
import FoodGrid from "@/components/FoodGrid";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleCategoryChange = (category: string) => {
    console.log('Category changed to:', category);
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 min-h-screen relative">
        {/* Theme toggle button */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <RestaurantHeader />
        <CategoryNav 
          onCategoryChange={handleCategoryChange}
          activeCategory={selectedCategory}
        />
        <FoodGrid selectedCategory={selectedCategory} />
      </div>
    </div>
  );
};

export default Index;
