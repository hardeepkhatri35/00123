import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, VolumeX } from "lucide-react";
import { alarmSound } from "@/utils/alarmUtils";

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string | null;
  order_type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  payment_status?: string | null;
  table_number: number | null;
  delivery_address: string | null;
  notes: string | null;
  total_amount: number;
  created_at: string;
  order_items: {
    dish_name: string;
    quantity: number;
    dish_price: number;
    item_total: number;
  }[];
}

interface OrderManagementProps {
  orders?: Order[];
}

const OrderManagement = ({ orders: propOrders }: OrderManagementProps) => {
  // Always default to an array
  const [orders, setOrders] = useState<Order[]>(Array.isArray(propOrders) ? propOrders : []);
  const [loading, setLoading] = useState(true);
  const [alarmingOrders, setAlarmingOrders] = useState<Set<string>>(new Set());
  const previousOrdersRef = useRef<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Always fetch orders initially
    fetchOrders();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Real-time order change:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      alarmSound.stop();
    };
  }, []);

  // Update orders when propOrders change
  useEffect(() => {
    if (propOrders && propOrders.length >= 0) {
      setOrders(propOrders);
      setLoading(false);
    }
  }, [propOrders]);

  // Check for new pending orders and trigger alarm
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    
    const currentPendingOrders = orders
      .filter(order => order.status === 'PENDING')
      .map(order => order.id);

    const newPendingOrders = currentPendingOrders.filter(
      orderId => !previousOrdersRef.current.includes(orderId)
    );

    if (newPendingOrders.length > 0 && previousOrdersRef.current.length > 0) {
      // New pending order detected - start alarm
      newPendingOrders.forEach(orderId => {
        setAlarmingOrders(prev => new Set([...prev, orderId]));
      });
      
      if (!alarmSound.isCurrentlyPlaying()) {
        alarmSound.start();
        toast({
          title: "New Order Received!",
          description: `${newPendingOrders.length} new order(s) need attention`,
          variant: "default",
        });
      }
    }

    previousOrdersRef.current = currentPendingOrders;
  }, [orders, toast]);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          if (itemsError) {
            console.error('Error fetching order items:', itemsError);
            return { 
              ...order, 
              order_items: [],
              payment_status: order.payment_status || 'PENDING'
            };
          }

          return { 
            ...order, 
            order_items: itemsData || [],
            payment_status: order.payment_status || 'PENDING'
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Stop alarm for this order when it's accepted or cancelled
      if (newStatus === 'CONFIRMED' || newStatus === 'CANCELLED') {
        setAlarmingOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          
          // If no more alarming orders, stop the alarm
          if (newSet.size === 0) {
            alarmSound.stop();
          }
          
          return newSet;
        });
      }

      toast({
        title: "Success",
        description: `Order ${newStatus.toLowerCase()} successfully`,
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const stopAlarmManually = () => {
    alarmSound.stop();
    setAlarmingOrders(new Set());
    toast({
      title: "Alarm Stopped",
      description: "Alarm has been manually stopped",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'READY':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case 'DINE_IN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'TAKEAWAY':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'DELIVERY':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Defensive: always use an array for mapping
  const safeOrders = Array.isArray(propOrders) ? propOrders : Array.isArray(orders) ? orders : [];
  if (!Array.isArray(safeOrders)) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">No orders found.</div>;
  }

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-900 dark:text-white">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-900 dark:text-white">Order Management</CardTitle>
          {alarmSound.isCurrentlyPlaying() && (
            <Button
              onClick={stopAlarmManually}
              variant="outline"
              size="sm"
              className="bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:border-red-700"
            >
              <VolumeX size={16} className="mr-1" />
              Stop Alarm
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {safeOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No orders found.
            </div>
          ) : (
            safeOrders.map((order) => (
              <div
                key={order.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 ${
                  alarmingOrders.has(order.id) ? 'border-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      Order #{order.order_number}
                      {alarmingOrders.has(order.id) && (
                        <span className="ml-2 text-red-600 dark:text-red-400 font-bold animate-bounce">🔔 NEW!</span>
                      )}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">{order.customer_name}</p>
                    {order.customer_phone && (
                      <p className="text-gray-600 dark:text-gray-300">{order.customer_phone}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-col items-end">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Badge className={getOrderTypeColor(order.order_type)}>
                      {order.order_type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.payment_status || 'PENDING')}>
                      {order.payment_status || 'PENDING'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Total:</strong> ₹{order.total_amount.toFixed(2)}
                    </p>
                    {order.table_number && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Table:</strong> {order.table_number}
                      </p>
                    )}
                    {order.delivery_address && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Address:</strong> {order.delivery_address}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Order Time:</strong> {new Date(order.created_at).toLocaleString()}
                    </p>
                    {order.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Notes:</strong> {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Order Items:</h4>
                  <div className="space-y-1">
                    {(order.order_items ?? []).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-600 p-2 rounded">
                        <span className="text-gray-900 dark:text-white">{item.dish_name} x {item.quantity}</span>
                        <span className="text-gray-900 dark:text-white font-medium">₹{item.item_total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {order.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <XCircle size={16} className="mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderManagement;
