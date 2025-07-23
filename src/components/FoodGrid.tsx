
import { Heart, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import FoodModal from "./FoodModal";

interface FoodItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string | null;
  is_available: boolean;
  category_id: string | null;
}

interface FoodGridProps {
  selectedCategory: string;
}

const FoodGrid = ({ selectedCategory }: FoodGridProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchData();
    loadFavorites();
    
    // Subscribe to real-time updates for food items
    const channel = supabase
      .channel('food-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_items'
        },
        () => {
          console.log('Food items updated, refetching...');
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const saveFavorites = (newFavorites: string[]) => {
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const fetchData = async () => {
    try {
      console.log('Fetching food items and categories...');
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // Fetch food items
      const { data: foodData, error: foodError } = await supabase
        .from('food_items')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (foodError) {
        console.error('Error fetching food items:', foodError);
        throw foodError;
      }
      
      console.log('Fetched food items:', foodData);
      setFoodItems(foodData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFoodItems = () => {
    if (selectedCategory === "All") {
      return foodItems;
    }

    if (selectedCategory === "Popular") {
      // Show favorite items as popular
      return foodItems.filter(item => favorites.includes(item.id));
    }

    // Find category by name
    const category = categories.find(cat => 
      cat.name.toLowerCase() === selectedCategory.toLowerCase()
    );

    if (!category) {
      // If no category found, filter by name matching
      return foodItems.filter(item => 
        item.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
      );
    }

    return foodItems.filter(item => item.category_id === category.id);
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id) 
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const openFoodModal = (dish: any) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  const closeFoodModal = () => {
    setIsModalOpen(false);
    setSelectedDish(null);
  };

  const filteredItems = getFilteredFoodItems();

  if (loading) {
    return (
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-700 rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mt-3"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 pb-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedCategory === "All" ? "All Items" : selectedCategory}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({filteredItems.length} items)
            </span>
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {filteredItems.map((dish) => (
            <div 
              key={dish.id} 
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative border border-gray-200 dark:border-gray-600"
            >
              {/* Heart Icon */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(dish.id);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 hover:bg-white transition-all duration-200 z-10"
              >
                <Heart 
                  size={16} 
                  className={`${favorites.includes(dish.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'} transition-colors duration-200`}
                />
              </button>

              {/* Food Image */}
              <div className="w-24 h-24 mx-auto mb-4 relative overflow-hidden rounded-lg">
                <img 
                  src={dish.image_url} 
                  alt={dish.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>

              {/* Food Name */}
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 text-center leading-tight">
                {dish.name}
              </h3>

              {/* Description */}
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-4 leading-relaxed min-h-[2.5rem]">
                {dish.description || "Delicious and freshly prepared"}
              </p>

              {/* Price */}
              <p className="text-gray-900 dark:text-white font-bold text-xl text-center mb-4">
                ₹{dish.price.toFixed(2)}
              </p>

              {/* Add Button */}
              <div className="flex justify-center">
                <button 
                  onClick={() => openFoodModal({
                    id: dish.id,
                    nameKey: dish.name,
                    name: dish.name,
                    price: `₹${dish.price.toFixed(2)}`,
                    image: dish.image_url,
                    description: dish.description
                  })}
                  className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <Plus size={24} className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No food items found for "{selectedCategory}"</p>
            <p className="text-sm mt-2">
              {selectedCategory === "Popular" 
                ? "Add items to favorites to see them here!" 
                : "Try selecting a different category or add items from the admin panel."
              }
            </p>
          </div>
        )}
      </div>

      {selectedDish && (
        <FoodModal
          isOpen={isModalOpen}
          onClose={closeFoodModal}
          dish={selectedDish}
        />
      )}
    </>
  );
};

export default FoodGrid;
