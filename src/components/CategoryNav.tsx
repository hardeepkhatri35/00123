
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryNavProps {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
}

const CategoryNav = ({ onCategoryChange, activeCategory }: CategoryNavProps) => {
  const { t } = useLanguage();
  
  const categories = [
    { 
      name: "All", 
      icon: "🍽️", 
      bgColor: "bg-purple-400",
      translationKey: "all"
    },
    { 
      name: "Popular", 
      icon: "👌", 
      bgColor: "bg-red-400",
      translationKey: "popular"
    },
    { 
      name: "Sandwich", 
      icon: "🥪", 
      bgColor: "bg-orange-400",
      translationKey: "sandwich"
    },
    { 
      name: "Pizza", 
      icon: "🍕", 
      bgColor: "bg-red-400",
      translationKey: "pizza"
    },
    { 
      name: "Noodles", 
      icon: "🍜", 
      bgColor: "bg-green-400",
      translationKey: "noodles"
    },
    { 
      name: "Manchurian", 
      icon: "🥟", 
      bgColor: "bg-blue-400",
      translationKey: "manchurian"
    },
    { 
      name: "Milk Shake", 
      icon: "🥤", 
      bgColor: "bg-pink-400",
      translationKey: "milkshake"
    },
    { 
      name: "Coffee", 
      icon: "☕", 
      bgColor: "bg-amber-400",
      translationKey: "coffee"
    }
  ];

  const handleCategoryClick = (categoryName: string) => {
    onCategoryChange(categoryName);
  };

  return (
    <div className="px-6 py-4 bg-white dark:bg-gray-800">
      <div className="flex gap-4 overflow-x-auto">
        {categories.map((category, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center min-w-0 flex-shrink-0 cursor-pointer group"
            onClick={() => handleCategoryClick(category.name)}
          >
            <div className={`w-16 h-16 ${
              activeCategory === category.name ? category.bgColor : 'bg-gray-100 dark:bg-gray-700'
            } rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 ease-in-out 
            group-hover:scale-110 group-hover:${category.bgColor} group-hover:shadow-lg
            transform-gpu`}>
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                {category.icon}
              </span>
            </div>
            <span className={`text-sm font-medium transition-colors duration-200 ${
              activeCategory === category.name ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
            } group-hover:text-gray-800 dark:group-hover:text-gray-200`}>
              {category.name}
            </span>
          </div>
        ))}
      </div>
      {/* Active indicator line */}
      <div className="mt-4 flex justify-start">
        <div className="ml-8 w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full transition-all duration-300"></div>
      </div>
    </div>
  );
};

export default CategoryNav;
