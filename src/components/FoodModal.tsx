import { useState, useRef } from "react";
import { X, Plus, Minus, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  
  const dishImageRef = useRef<HTMLImageElement>(null);
  const payButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  if (!isOpen) return null;

  // Fix price parsing - remove currency symbols and parse as number
  const cleanPrice = dish.price.replace(/[₹£$]/g, '');
  const price = parseFloat(cleanPrice) || 0;
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

  const handleUPIPayment = () => {
    const amount = total.toFixed(2);
    const upiUrl = `upi://pay?pa=ashishkhatri0230-1@okaxis&pn=Ashish+Khatri&am=${amount}&cu=INR`;
    
    // Check if device supports UPI
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile devices, try to open UPI app
      try {
        window.location.href = upiUrl;
        
        // Show success message with UPI ID as backup
        setTimeout(() => {
          toast({
            title: t('upiOpened') || "UPI App Opening",
            description: `${t('payAmount') || 'Pay'} ₹${amount} ${t('to') || 'to'} ashishkhatri0230-1@okaxis`,
            duration: 8000,
          });
        }, 500);
      } catch (error) {
        // Fallback for mobile
        handleUPIFallback("ashishkhatri0230-1@okaxis", amount);
      }
    } else {
      // For desktop, show UPI ID and copy to clipboard
      handleUPIFallback("ashishkhatri0230-1@okaxis", amount);
    }
  };

  const handleUPIFallback = (upiId: string, amount: string) => {
    // Copy UPI ID to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId).then(() => {
        toast({
          title: t('upiCopied') || "UPI ID Copied",
          description: `${t('payAmount') || 'Pay'} ₹${amount} ${t('to') || 'to'} ${upiId}`,
          duration: 8000,
        });
      }).catch(() => {
        // Fallback if clipboard fails
        toast({
          title: t('upiPayment') || "UPI Payment",
          description: `${t('payAmount') || 'Pay'} ₹${amount} ${t('to') || 'to'} ${upiId}`,
          duration: 10000,
        });
      });
    } else {
      // Fallback if clipboard API not available
      toast({
        title: t('upiPayment') || "UPI Payment",
        description: `${t('payAmount') || 'Pay'} ₹${amount} ${t('to') || 'to'} ${upiId}`,
        duration: 10000,
      });
    }
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

💳 *${t('paymentInstructions') || 'Payment via UPI'}:* ashishkhatri0230-1@okaxis
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
      // Create order with proper data types
      const orderData = {
        customer_name: customerName.trim(),
        customer_phone: (orderType === 'TAKEAWAY' || orderType === 'DELIVERY') ? mobileNumber.trim() : null,
        order_type: orderType,
        table_number: (orderType === 'DINE_IN' || orderType === 'TAKEAWAY') && tableNumber ? parseInt(tableNumber) : null,
        delivery_address: orderType === 'DELIVERY' ? deliveryAddress.trim() : null,
        notes: notes.trim() || null,
        total_amount: parseFloat(total.toFixed(2)),
        status: 'PENDING' as const,
        payment_status: 'PENDING' as const
      };

      console.log('Creating order with data:', orderData);

      const { data: createdOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Order created successfully:', createdOrder);

      // Create order item
      const orderItemData = {
        order_id: createdOrder.id,
        dish_name: dish.name,
        dish_price: parseFloat(price.toFixed(2)),
        quantity: quantity,
        item_total: parseFloat(total.toFixed(2))
      };

      console.log('Creating order item with data:', orderItemData);

      const { error: itemError } = await supabase
        .from('order_items')
        .insert(orderItemData);

      if (itemError) {
        console.error('Order item creation error:', itemError);
        throw itemError;
      }

      // Show success message
      toast({
        title: "🎉 " + (t('orderSuccessful') || "Order Successful!"),
        description: `${t('orderPlaced') || 'Order'} #${createdOrder.order_number} ${t('placedSuccessfully') || 'has been placed successfully'}`,
        duration: 5000,
      });

      // Send WhatsApp bill if mobile number is provided
      if (mobileNumber) {
        setTimeout(() => {
          sendWhatsAppBill(createdOrder.order_number.toString());
        }, 1000);
      }

      // Open UPI payment after successful order creation
      handleUPIPayment();

      // Reset form
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
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{dish.price}</p>

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

            {(orderType === 'DINE_IN' || orderType === 'TAKEAWAY') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tableNumber') || 'Table Number'}</label>
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
              {isLoading ? (t('placingOrder') || "Placing Order...") : `${t('payViaUPI') || 'Pay via UPI'} ₹${total.toFixed(2)}`}
            </Button>
          </div>

          {/* Updated UPI Number Display */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 justify-center">
              <Smartphone size={18} className="text-blue-600 dark:text-blue-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('upiPayment') || 'UPI Payment'}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">ashishkhatri0230-1@okaxis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodModal;
