
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EarningsAnalytics from "./EarningsAnalytics";
import OrderManagement from "./OrderManagement";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const { toast } = useToast();

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }

    // Fetch order items for each order
    const ordersWithItems = [];
    
    for (const order of (data || [])) {
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        ordersWithItems.push({ 
          ...order, 
          order_items: []
        });
        continue;
      }

      // Process order items to include image URLs by matching dish names
      const processedItems = [];
      for (const item of (itemsData || [])) {
        // Try to find matching food item by name (case-insensitive)
        const { data: foodItem } = await supabase
          .from('food_items')
          .select('image_url')
          .ilike('name', item.dish_name)
          .single();

        const result = {
          ...item,
          image_url: foodItem?.image_url || null
        };
        
        processedItems.push(result);
      }

      const result = { 
        ...order, 
        order_items: processedItems
      };
      
      ordersWithItems.push(result);
    }

    console.log('AdminPanel: Orders with items fetched:', ordersWithItems.length);
    setOrders(ordersWithItems);
  }

  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Subscribe to new order inserts
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🆕 New order received in real-time:', payload.new);
          
          // Play notification sound
          try {
            const audio = new Audio('/notification.mp3.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => console.log('Audio play failed:', err));
          } catch (error) {
            console.log('Audio not available:', error);
          }
          
          // Show toast notification
          toast({
            title: "🆕 New Order Received!",
            description: `Order #${payload.new.order_number} from ${payload.new.customer_name}`,
            duration: 5000,
          });
          
          // Immediately add new order to state
          setOrders(prevOrders => [payload.new, ...prevOrders]);
          
          // Also fetch to ensure we have complete data
          setTimeout(() => fetchOrders(), 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('📝 Order updated in real-time:', payload.new);
          // Update order in state
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === payload.new.id ? payload.new : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your restaurant orders and view analytics</p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrderManagement orders={orders} />
          </TabsContent>

          <TabsContent value="analytics">
            <EarningsAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
