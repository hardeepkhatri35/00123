
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'english' | 'hindi' | 'punjabi' | 'telugu' | 'marathi';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  english: {
    restaurantName: 'Demo Restaurant',
    popular: 'Popular',
    curry: 'curry',
    ramen: 'ramen',
    teppanyaki: 'teppanyaki',
    prawnRaisuka: 'prawn raisuka...',
    firecrackerPr: 'firecracker pr...',
    hotChickenKat: 'hot chicken kat...',
    tofuFirecracker: 'tofu firecracker',
    spicyRamenBowl: 'spicy ramen bowl',
    beefRamenSpecial: 'beef ramen special',
    // Order form translations
    quantity: 'Quantity',
    orderType: 'Order Type',
    dineIn: 'Dine In',
    takeaway: 'Takeaway',
    delivery: 'Delivery',
    customerName: 'Customer Name',
    mobileNumber: 'Mobile Number',
    tableNumber: 'Table Number',
    deliveryAddress: 'Delivery Address',
    specialNotes: 'Special Notes',
    total: 'Total',
    cancel: 'Cancel',
    // Success messages
    orderSuccessful: 'Order Successful!',
    orderPlaced: 'Order',
    placedSuccessfully: 'has been placed successfully',
    // Error messages
    error: 'Error',
    enterCustomerName: 'Please enter customer name',
    enterMobileNumber: 'Please enter mobile number',
    enterDeliveryAddress: 'Please enter delivery address',
    invalidOrderTotal: 'Invalid order total',
    failedToPlaceOrder: 'Failed to place order',
    pleaseTryAgain: 'Please try again',
    placingOrder: 'Placing Order...',
    // Placeholders
    selectTableNumber: 'Select table number',
    table: 'Table',
    anySpecialInstructions: 'Any special instructions...',
    // WhatsApp bill
    orderBill: 'ORDER BILL',
    orderNumber: 'Order Number',
    phone: 'Phone',
    address: 'Address',
    items: 'ITEMS',
    unitPrice: 'Unit Price',
    subtotal: 'Subtotal',
    totalAmount: 'TOTAL AMOUNT',
    notes: 'Special Notes',
    orderTime: 'Order Time',
    thankYou: 'Thank you for your order!'
  },
  hindi: {
    restaurantName: 'डेमो रेस्टोरेंट',
    popular: 'लोकप्रिय',
    curry: 'करी',
    ramen: 'रामेन',
    teppanyaki: 'तेप्पान्याकी',
    prawnRaisuka: 'झींगा रायसुका...',
    firecrackerPr: 'फायरक्रैकर प्र...',
    hotChickenKat: 'हॉट चिकन कैट...',
    tofuFirecracker: 'तोफू फायरक्रैकर',
    spicyRamenBowl: 'स्पाइसी रामेन बाउल',
    beefRamenSpecial: 'बीफ रामेन स्पेशल',
    // Order form translations
    quantity: 'मात्रा',
    orderType: 'ऑर्डर प्रकार',
    dineIn: 'डाइन इन',
    takeaway: 'टेकअवे',
    delivery: 'डिलीवरी',
    customerName: 'ग्राहक का नाम',
    mobileNumber: 'मोबाइल नंबर',
    tableNumber: 'टेबल नंबर',
    deliveryAddress: 'डिलीवरी पता',
    specialNotes: 'विशेष नोट्स',
    total: 'कुल',
    cancel: 'रद्द करें',
    // Success messages
    orderSuccessful: 'ऑर्डर सफल!',
    orderPlaced: 'ऑर्डर',
    placedSuccessfully: 'सफलतापूर्वक रखा गया है',
    // Error messages
    error: 'त्रुटि',
    enterCustomerName: 'कृपया ग्राहक का नाम दर्ज करें',
    enterMobileNumber: 'कृपया मोबाइल नंबर दर्ज करें',
    enterDeliveryAddress: 'कृपया डिलीवरी पता दर्ज करें',
    invalidOrderTotal: 'अमान्य ऑर्डर राशि',
    failedToPlaceOrder: 'ऑर्डर देने में विफल',
    pleaseTryAgain: 'कृपया पुनः प्रयास करें',
    placingOrder: 'ऑर्डर दे रहे हैं...',
    // Placeholders
    selectTableNumber: 'टेबल नंबर चुनें',
    table: 'टेबल',
    anySpecialInstructions: 'कोई विशेष निर्देश...',
    // WhatsApp bill
    orderBill: 'ऑर्डर बिल',
    orderNumber: 'ऑर्डर नंबर',
    phone: 'फोन',
    address: 'पता',
    items: 'आइटम',
    unitPrice: 'यूनिट मूल्य',
    subtotal: 'उप योग',
    totalAmount: 'कुल राशि',
    notes: 'विशेष नोट्स',
    orderTime: 'ऑर्डर समय',
    thankYou: 'आपके ऑर्डर के लिए धन्यवाद!'
  },
  punjabi: {
    restaurantName: 'ਡੈਮੋ ਰੈਸਟੋਰੈਂਟ',
    popular: 'ਮਸ਼ਹੂਰ',
    curry: 'ਕਰੀ',
    ramen: 'ਰਾਮੇਨ',
    teppanyaki: 'ਤੇਪਪਨਯਾਕੀ',
    prawnRaisuka: 'ਝੀਂਗਾ ਰਾਇਸੁਕਾ...',
    firecrackerPr: 'ਫਾਇਰਕ੍ਰੈਕਰ ਪ੍ਰ...',
    hotChickenKat: 'ਗਰਮ ਚਿਕਨ ਕੈਟ...',
    tofuFirecracker: 'ਟੋਫੂ ਫਾਇਰਕ੍ਰੈਕਰ',
    spicyRamenBowl: 'ਮਸਾਲੇਦਾਰ ਰਾਮੇਨ ਬਾਊਲ',
    beefRamenSpecial: 'ਬੀਫ ਰਾਮੇਨ ਸਪੈਸ਼ਲ',
    // Order form translations
    quantity: 'ਮਾਤਰਾ',
    orderType: 'ਆਰਡਰ ਦੀ ਕਿਸਮ',
    dineIn: 'ਡਾਇਨ ਇਨ',
    takeaway: 'ਟੇਕਅਵੇ',
    delivery: 'ਡਿਲੀਵਰੀ',
    customerName: 'ਗਾਹਕ ਦਾ ਨਾਮ',
    mobileNumber: 'ਮੋਬਾਇਲ ਨੰਬਰ',
    tableNumber: 'ਟੇਬਲ ਨੰਬਰ',
    deliveryAddress: 'ਡਿਲੀਵਰੀ ਪਤਾ',
    specialNotes: 'ਖਾਸ ਨੋਟਸ',
    total: 'ਕੁੱਲ',
    cancel: 'ਰੱਦ ਕਰੋ',
    // Success messages
    orderSuccessful: 'ਆਰਡਰ ਸਫਲ!',
    orderPlaced: 'ਆਰਡਰ',
    placedSuccessfully: 'ਸਫਲਤਾਪੂਰਵਕ ਰੱਖਿਆ ਗਿਆ ਹੈ',
    // Error messages
    error: 'ਗਲਤੀ',
    enterCustomerName: 'ਕਿਰਪਾ ਕਰਕੇ ਗਾਹਕ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ',
    enterMobileNumber: 'ਕਿਰਪਾ ਕਰਕੇ ਮੋਬਾਇਲ ਨੰਬਰ ਦਰਜ ਕਰੋ',
    enterDeliveryAddress: 'ਕਿਰਪਾ ਕਰਕੇ ਡਿਲੀਵਰੀ ਪਤਾ ਦਰਜ ਕਰੋ',
    invalidOrderTotal: 'ਗਲਤ ਆਰਡਰ ਰਾਸ਼ੀ',
    failedToPlaceOrder: 'ਆਰਡਰ ਦੇਣ ਵਿੱਚ ਅਸਫਲ',
    pleaseTryAgain: 'ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    placingOrder: 'ਆਰਡਰ ਦੇ ਰਹੇ ਹਾਂ...',
    // Placeholders
    selectTableNumber: 'ਟੇਬਲ ਨੰਬਰ ਚੁਣੋ',
    table: 'ਟੇਬਲ',
    anySpecialInstructions: 'ਕੋਈ ਖਾਸ ਹਦਾਇਤਾਂ...',
    // WhatsApp bill
    orderBill: 'ਆਰਡਰ ਬਿੱਲ',
    orderNumber: 'ਆਰਡਰ ਨੰਬਰ',
    phone: 'ਫੋਨ',
    address: 'ਪਤਾ',
    items: 'ਆਈਟਮਾਂ',
    unitPrice: 'ਯੂਨਿਟ ਮੁੱਲ',
    subtotal: 'ਉਪ ਜੋੜ',
    totalAmount: 'ਕੁੱਲ ਰਾਸ਼ੀ',
    notes: 'ਖਾਸ ਨੋਟਸ',
    orderTime: 'ਆਰਡਰ ਟਾਈਮ',
    thankYou: 'ਤੁਹਾਡੇ ਆਰਡਰ ਲਈ ਧੰਨਵਾਦ!'
  },
  telugu: {
    restaurantName: 'డెమో రెస్టారెంట్',
    popular: 'జనాదరణ',
    curry: 'కర్రీ',
    ramen: 'రామెన్',
    teppanyaki: 'తెప్పన్యాకి',
    prawnRaisuka: 'రొయ్యల రైసుకా...',
    firecrackerPr: 'ఫైర్‌క్రాకర్ ప్ర...',
    hotChickenKat: 'హాట్ చికెన్ కాట్...',
    tofuFirecracker: 'టోఫు ఫైర్‌క్రాకర్',
    spicyRamenBowl: 'స్పైసీ రామెన్ బౌల్',
    beefRamenSpecial: 'బీఫ్ రామెన్ స్పెషల్',
    // Order form translations
    quantity: 'పరిమాణం',
    orderType: 'ఆర్డర్ రకం',
    dineIn: 'డైన్ ఇన్',
    takeaway: 'టేకవే',
    delivery: 'డెలివరీ',
    customerName: 'కస్టమర్ పేరు',
    mobileNumber: 'మొబైల్ నంబర్',
    tableNumber: 'టేబుల్ నంబర్',
    deliveryAddress: 'డెలివరీ చిరునామా',
    specialNotes: 'ప్రత్యేక గమనికలు',
    total: 'మొత్తం',
    cancel: 'రద్దు చేయండి',
    // Success messages
    orderSuccessful: 'ఆర్డర్ విజయవంతం!',
    orderPlaced: 'ఆర్డర్',
    placedSuccessfully: 'విజయవంతంగా ఉంచబడింది',
    // Error messages
    error: 'లోపం',
    enterCustomerName: 'దయచేసి కస్టమర్ పేరు నమోదు చేయండి',
    enterMobileNumber: 'దయచేసి మొబైల్ నంబరు నమోదు చేయండి',
    enterDeliveryAddress: 'దయచేసి డెలివరీ చిరునామా నమోదు చేయండి',
    invalidOrderTotal: 'చెల్లని ఆర్డర్ మొత్తం',
    failedToPlaceOrder: 'ఆర్డర్ చేయడంలో విఫలమైంది',
    pleaseTryAgain: 'దయచేసి మళ్లీ ప్రయత్నించండి',
    placingOrder: 'ఆర్డర్ చేస్తున్నాం...',
    // Placeholders
    selectTableNumber: 'టేబుల్ నంబర్ ఎంచుకోండి',
    table: 'టేబుల్',
    anySpecialInstructions: 'ఏవైనా ప్రత్యేక సూచనలు...',
    // WhatsApp bill
    orderBill: 'ఆర్డర్ బిల్లు',
    orderNumber: 'ఆర్డర్ నంబర్',
    phone: 'ఫోన్',
    address: 'చిరునామా',
    items: 'అంశాలు',
    unitPrice: 'యూనిట్ ధర',
    subtotal: 'ఉప మొత్తం',
    totalAmount: 'మొత్తం మొత్తం',
    notes: 'ప్రత్యేక గమనికలు',
    orderTime: 'ఆర్డర్ సమయం',
    thankYou: 'మీ ఆర్డర్ కోసం ధన్యవాదాలు!'
  },
  marathi: {
    restaurantName: 'डेमो रेस्टॉरंट',
    popular: 'लोकप्रिय',
    curry: 'करी',
    ramen: 'रामेन',
    teppanyaki: 'तेप्पान्याकी',
    prawnRaisuka: 'कोळंबी रैसुका...',
    firecrackerPr: 'फायरक्रॅकर प्र...',
    hotChickenKat: 'हॉट चिकन कॅट...',
    tofuFirecracker: 'तोफू फायरक्रॅकर',
    spicyRamenBowl: 'मसालेदार रामेन वाटी',
    beefRamenSpecial: 'बीफ रामेन स्पेशल',
    // Order form translations
    quantity: 'प्रमाण',
    orderType: 'ऑर्डर प्रकार',
    dineIn: 'डाइन इन',
    takeaway: 'टेकअवे',
    delivery: 'डिलिव्हरी',
    customerName: 'ग्राहकाचे नाव',
    mobileNumber: 'मोबाइल नंबर',
    tableNumber: 'टेबल नंबर',
    deliveryAddress: 'डिलिव्हरी पत्ता',
    specialNotes: 'विशेष नोट्स',
    total: 'एकूण',
    cancel: 'रद्द करा',
    // Success messages
    orderSuccessful: 'ऑर्डर यशस्वी!',
    orderPlaced: 'ऑर्डर',
    placedSuccessfully: 'यशस्वीरित्या ठेवला गेला आहे',
    // Error messages
    error: 'त्रुटी',
    enterCustomerName: 'कृपया ग्राहकाचे नाव प्रविष्ट करा',
    enterMobileNumber: 'कृपया मोबाइल नंबर प्रविष्ट करा',
    enterDeliveryAddress: 'कृपया डिलिव्हरी पत्ता प्रविष्ट करा',
    invalidOrderTotal: 'अवैध ऑर्डर रक्कम',
    failedToPlaceOrder: 'ऑर्डर देण्यात अयशस्वी',
    pleaseTryAgain: 'कृपया पुन्हा प्रयत्न करा',
    placingOrder: 'ऑर्डर देत आहे...',
    // Placeholders
    selectTableNumber: 'टेबल नंबर निवडा',
    table: 'टेबल',
    anySpecialInstructions: 'काही विशेष सूचना...',
    // WhatsApp bill
    orderBill: 'ऑर्डर बिल',
    orderNumber: 'ऑर्डर नंबर',
    phone: 'फोन',
    address: 'पत्ता',
    items: 'वस्तू',
    unitPrice: 'युनिट किंमत',
    subtotal: 'उप बेरीज',
    totalAmount: 'एकूण रक्कम',
    notes: 'विशेष नोट्स',
    orderTime: 'ऑर्डर वेळ',
    thankYou: 'तुमच्या ऑर्डरसाठी धन्यवाद!'
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('english');

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key as keyof typeof translations.english] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
