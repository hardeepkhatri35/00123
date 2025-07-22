
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone } from "lucide-react";
import LanguageSelector from "./LanguageSelector";

const RestaurantHeader = () => {
  const { t } = useLanguage();

  const handleCallClick = () => {
    window.location.href = "tel:+916261873072";
  };

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <div className="text-white text-lg">★</div>
        </div>
        <h1 className="text-lg font-medium text-gray-900 dark:text-white">{t('restaurantName')}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCallClick}
          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Phone size={14} />
          <span className="text-xs font-medium">Call</span>
        </button>
        <LanguageSelector />
      </div>
    </div>
  );
};

export default RestaurantHeader;
