
import { useState } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';

const LanguageSelector = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'english' as Language, name: 'English', nativeName: 'English' },
    { code: 'hindi' as Language, name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'punjabi' as Language, name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'telugu' as Language, name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'marathi' as Language, name: 'Marathi', nativeName: 'मराठी' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-200 transition-colors"
      >
        <Languages size={16} />
        <span className="text-gray-700 text-sm font-medium">
          {currentLang?.nativeName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-40 z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                currentLanguage === language.code ? 'bg-gray-100 font-medium' : ''
              }`}
            >
              <div className="text-sm text-gray-900">{language.nativeName}</div>
              <div className="text-xs text-gray-500">{language.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
