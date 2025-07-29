import { useState, useRef } from "react";
import { X, Plus, Minus, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

interface FoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: {
    id: string;
    nameKey: string;
    name: string;
    price: string;
    image: string;
    description?: string;
    category?: string; // Added for AMATURE BEGINNING category
    prices?: { [key: string]: number }; // Added for AMATURE BEGINNING prices
  };
}

const FoodModal = ({ isOpen, onClose, dish }: FoodModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE_IN');
  const [isLoading, setIsLoading] = useState(false);
  const [flyingImage, setFlyingImage] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('S');
  
  const dishImageRef = useRef<HTMLImageElement>(null);
  const payButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  if (!isOpen) return null;

  // Dynamic price logic for AMATURE BEGINNING
  let price = 0;
  if (dish && dish.prices) {
    price = dish.prices[selectedSize] || 0;
  } else {
    const cleanPrice = dish.price.replace(/[₹£$]/g, '');
    price = parseFloat(cleanPrice) || 0;
  }
  const total = price * quantity;

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
      // Trigger enhanced flying animation
      if (change > 0) {
        triggerFlyingAnimation();
      }
    }
  };

  const triggerFlyingAnimation = () => {
    setFlyingImage(true);
    setTimeout(() => setFlyingImage(false), 1500);
  };

  const sendWhatsAppBill = (orderNumber: string) => {
    const billMessage = `
🧾 *${t('orderBill') || 'ORDER BILL'}*
━━━━━━━━━━━━━━━━━━━━
📋 *${t('orderNumber') || 'Order Number'}:* #${orderNumber}
👤 *${t('customerName') || 'Customer'}:* ${customerName}
📞 *${t('phone') || 'Phone'}:* ${mobileNumber}
🍽️ *${t('orderType') || 'Order Type'}:* ${orderType.replace('_', ' ')}
${tableNumber ? `🪑 *${t('tableNumber') || 'Table'}:* ${tableNumber}` : ''}
${deliveryAddress ? `🏠 *${t('address') || 'Address'}:* ${deliveryAddress}` : ''}

━━━━━━━━━━━━━━━━━━━━
🍕 *${t('items') || 'ITEMS'}*
━━━━━━━━━━━━━━━━━━━━
${dish.name} × ${quantity}
${t('unitPrice') || 'Unit Price'}: ₹${price.toFixed(2)}
${t('subtotal') || 'Subtotal'}: ₹${total.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━
💰 *${t('totalAmount') || 'TOTAL AMOUNT'}: ₹${total.toFixed(2)}*
━━━━━━━━━━━━━━━━━━━━

${notes ? `📝 *${t('notes') || 'Special Notes'}:* ${notes}` : ''}

⏰ *${t('orderTime') || 'Order Time'}:* ${new Date().toLocaleString()}

🙏 *${t('thankYou') || 'Thank you for your order!'}*
    `;

    const whatsappUrl = `https://wa.me/${mobileNumber}?text=${encodeURIComponent(billMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmitOrder = async () => {
    console.log('Starting order submission...', {
      customerName,
      orderType,
      total,
      price,
      quantity
    });

    if (!customerName.trim()) {
      toast({
        title: t('error') || "Error",
        description: t('enterCustomerName') || "Please enter customer name",
        variant: "destructive",
      });
      return;
    }

    if ((orderType === 'TAKEAWAY' || orderType === 'DELIVERY') && !mobileNumber.trim()) {
      toast({
        title: t('error') || "Error",
        description: t('enterMobileNumber') || "Please enter mobile number",
        variant: "destructive",
      });
      return;
    }

    if (orderType === 'DINE_IN' && !tableNumber) {
      toast({
        title: t('error') || "Error",
        description: t('selectTableNumber') || "Please select table number",
        variant: "destructive",
      });
      return;
    }

    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
      toast({
        title: t('error') || "Error",
        description: t('enterDeliveryAddress') || "Please enter delivery address",
        variant: "destructive",
      });
      return;
    }

    if (total <= 0) {
      toast({
        title: t('error') || "Error",
        description: t('invalidOrderTotal') || "Invalid order total",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create order in Firestore
      const orderData = {
        customer_name: customerName.trim(),
        customer_phone: (orderType === 'TAKEAWAY' || orderType === 'DELIVERY') ? mobileNumber.trim() : null,
        order_type: orderType,
        table_number: orderType === 'DINE_IN' && tableNumber ? parseInt(tableNumber) : null,
        delivery_address: orderType === 'DELIVERY' ? deliveryAddress.trim() : null,
        notes: notes.trim() || null,
        total_amount: parseFloat(total.toFixed(2)),
        status: 'PENDING',
        created_at: serverTimestamp(),
      };
      // Add order
      const orderRef = await addDoc(collection(db, "orders"), orderData);
      // Add order item (as subcollection)
      const orderItemData = {
        dish_name: dish.name,
        dish_price: parseFloat(price.toFixed(2)),
        quantity: quantity,
        item_total: parseFloat(total.toFixed(2)),
        size: selectedSize || 'M'
      };
      await addDoc(collection(db, "orders", orderRef.id, "order_items"), orderItemData);
      toast({
        title: "🎉 " + (t('orderSuccessful') || "Order Successful!"),
        description: `Order placed successfully!`,
        duration: 5000,
      });
      // WhatsApp bill, reset form, etc. वही रखें
      setQuantity(1);
      setCustomerName("");
      setMobileNumber("");
      setTableNumber("");
      setDeliveryAddress("");
      setNotes("");
      setOrderType('DINE_IN');
      onClose();
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: t('error') || "Error",
        description: `${t('failedToPlaceOrder') || 'Failed to place order'}: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tableOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="relative flex justify-center py-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
          <div className="relative">
            <img 
              ref={dishImageRef}
              src={dish.image} 
              alt={dish.name}
              className="w-32 h-32 object-cover rounded-full shadow-2xl ring-4 ring-white dark:ring-gray-600"
              style={{
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
              }}
            />
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <X size={16} className="text-gray-600" />
          </button>
          
          {/* Enhanced Flying image animation */}
          {flyingImage && (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
              <img 
                src={dish.image}
                alt=""
                className="w-16 h-16 object-cover rounded-full absolute top-20 left-1/2 transform -translate-x-1/2 shadow-lg"
                style={{
                  animation: 'flyToPayButton 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                }}
              />
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{dish.name}</h2>
          {/* Size Selector for AMATURE BEGINNING */}
          {dish && dish.category === "AMATURE BEGINNING" && dish.prices && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size</label>
              <div className="grid grid-cols-3 gap-2">
                {['S', 'M', 'L'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size as 'S' | 'M' | 'L')}
                    className={`p-2 text-xs rounded-lg border transition-all ${
                      selectedSize === size
                        ? 'bg-orange-400 text-white border-orange-400'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {size === 'S' ? 'Small' : size === 'M' ? 'Medium' : 'Large'} (₹{Number(dish.prices[size])})
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">₹{price}</p>

          {/* Quantity Selector with Enhanced Hover Effects */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{t('quantity') || 'Quantity'}</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center hover:from-red-500 hover:to-red-600 hover:scale-110 hover:shadow-lg transition-all duration-200 transform active:scale-95"
              >
                <Minus size={18} className="text-white" />
              </button>
              <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[2rem] text-center">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center hover:from-green-500 hover:to-green-600 hover:scale-110 hover:shadow-lg transition-all duration-200 transform active:scale-95"
              >
                <Plus size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Order Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('orderType') || 'Order Type'}</label>
            <div className="grid grid-cols-3 gap-2">
              {['DINE_IN', 'TAKEAWAY', 'DELIVERY'].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type as typeof orderType)}
                  className={`p-2 text-xs rounded-lg border transition-all ${
                    orderType === type
                      ? 'bg-orange-400 text-white border-orange-400'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {type === 'DINE_IN' ? (t('dineIn') || 'Dine In') : type === 'TAKEAWAY' ? (t('takeaway') || 'Takeaway') : (t('delivery') || 'Delivery')}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('customerName') || 'Customer Name'} *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={t('enterCustomerName') || "Enter customer name"}
              />
            </div>

            {(orderType === 'TAKEAWAY' || orderType === 'DELIVERY') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('mobileNumber') || 'Mobile Number'} *</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={t('enterMobileNumber') || "Enter mobile number"}
                />
              </div>
            )}

            {orderType === 'DINE_IN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tableNumber') || 'Table Number'} *</label>
                <Select value={tableNumber} onValueChange={setTableNumber}>
                  <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder={t('selectTableNumber') || "Select table number"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tableOptions.map((table) => (
                      <SelectItem key={table} value={table}>
                        {t('table') || 'Table'} {table}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {orderType === 'DELIVERY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('deliveryAddress') || 'Delivery Address'} *</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={t('enterDeliveryAddress') || "Enter delivery address"}
                  rows={2}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('specialNotes') || 'Special Notes'}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={t('anySpecialInstructions') || "Any special instructions..."}
                rows={2}
              />
            </div>
          </div>

          {/* Simple Total Display (no animation) */}
          <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="font-semibold text-gray-900 dark:text-white">{t('total') || 'Total'}:</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">₹{total.toFixed(2)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 hover:scale-105 transition-transform"
              disabled={isLoading}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button 
              ref={payButtonRef}
              onClick={handleSubmitOrder}
              className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 hover:scale-105 transition-all flex items-center gap-2"
              disabled={isLoading}
            >
              <Smartphone size={16} />
              {isLoading ? (t('placingOrder') || "Placing Order...") : `${t('orderNow') || 'Order Now'} ₹${total.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodModal;
