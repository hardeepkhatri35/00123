import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Utensils, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('categories').select('id, name').order('name');
      if (!error && data) setCategories(data);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'popular':
        return <span className="text-2xl">👌</span>;
      case 'amature beginning':
        return <span className="text-2xl">🍕</span>;
      default:
        return <Utensils size={24} />;
    }
  };

  const scrollLeft = () => {
    const container = document.getElementById('category-scroll');
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('category-scroll');
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Calculate progress bar position based on active category
  const getProgressBarStyle = () => {
    const totalCategories = 3; // All, Popular, AMATURE BEGINNING
    let activeIndex = 0;
    
    if (activeCategory === 'All') {
      activeIndex = 0;
    } else if (activeCategory === 'Popular') {
      activeIndex = 1;
    } else if (activeCategory === 'AMATURE BEGINNING') {
      activeIndex = 2;
    }
    
    const width = 100 / totalCategories;
    const left = (activeIndex * width);
    
    return {
      width: `${width}%`,
      left: `${left}%`,
      transition: 'all 0.3s ease-in-out'
    };
  };

  return (
    <div className="relative px-4 mb-6">
      {/* Scroll Buttons */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-all"
      >
        <ChevronLeft size={16} className="text-gray-600" />
      </button>
      
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-all"
      >
        <ChevronRight size={16} className="text-gray-600" />
      </button>

      {/* Categories Container */}
      <div 
        id="category-scroll"
        className="flex gap-3 overflow-x-auto scrollbar-hide px-8 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All Category */}
        <button
          className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[80px] ${
            activeCategory === 'All' 
              ? 'bg-purple-500 border-purple-500 text-white shadow-lg' 
              : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
          }`}
          onClick={() => onCategoryChange('All')}
        >
          <Utensils size={24} />
          <span className="text-xs font-medium">All</span>
        </button>

        {/* Popular Category */}
        <button
          className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[80px] ${
            activeCategory === 'Popular' 
              ? 'bg-purple-500 border-purple-500 text-white shadow-lg' 
              : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
          }`}
          onClick={() => onCategoryChange('Popular')}
        >
          <span className="text-2xl">👌</span>
          <span className="text-xs font-medium">Popular</span>
        </button>

        {/* Dynamic Categories from Database (AMATURE BEGINNING) */}
        {loading ? (
          <div className="flex items-center justify-center px-4 py-3 text-gray-400">
            <span className="text-sm">Loading...</span>
          </div>
        ) : (
          categories.map((cat) => (
            <button
              key={cat.id}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[80px] ${
                activeCategory === cat.name 
                  ? 'bg-purple-500 border-purple-500 text-white shadow-lg' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
              }`}
              onClick={() => onCategoryChange(cat.name)}
            >
              {getCategoryIcon(cat.name)}
              <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
            </button>
          ))
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-2 px-8">
        <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute h-1 bg-purple-500 rounded-full transition-all duration-300 ease-in-out"
            style={getProgressBarStyle()}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;