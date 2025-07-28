import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, VolumeX, User, Phone, MapPin, Calendar, FileText, Package, Eye } from "lucide-react";
import { alarmSound } from "@/utils/alarmUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string | null;
  order_type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

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
    size?: string;
    image_url?: string;
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
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

  // Debug effect to log orders state changes
  useEffect(() => {
    console.log('Orders state updated:', orders);
    if (orders && orders.length > 0) {
      console.log('First order structure:', orders[0]);
      console.log('First order keys:', Object.keys(orders[0]));
      console.log('First order items:', orders[0].order_items);
      console.log('First order items type:', typeof orders[0].order_items);
      console.log('First order items length:', orders[0].order_items?.length);
    }
  }, [orders]);

  const fetchOrders = async () => {
    // This function is now handled by AdminPanel component
    console.log('fetchOrders called from OrderManagement - should be handled by AdminPanel');
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED') => {
    try {
      if (newStatus === 'CANCELLED') {
        // Delete cancelled orders completely
        const { error: deleteError } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (deleteError) throw deleteError;

        toast({
          title: "Order Cancelled",
          description: "Order has been cancelled and removed",
        });
      } else {
        // Update order status for other statuses
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Order ${newStatus.toLowerCase()} successfully`,
        });
      }

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

      // Data will be updated by AdminPanel real-time subscription
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



  // Defensive: always use an array for mapping
  const safeOrders = Array.isArray(propOrders) ? propOrders : Array.isArray(orders) ? orders : [];
  
  // Debug: Log the actual data being used
  console.log('safeOrders length:', safeOrders.length);
  if (safeOrders.length > 0) {
    console.log('safeOrders[0] structure:', safeOrders[0]);
    console.log('safeOrders[0] order_items:', safeOrders[0].order_items);
  }
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
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Package size={20} />
            Order Management
            {safeOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {safeOrders.length} {safeOrders.length === 1 ? 'Order' : 'Orders'}
              </Badge>
            )}
          </CardTitle>
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
      <CardContent className="p-0">
        {safeOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm">Orders will appear here when customers place them</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Order #</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Customer</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Food Name</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Size</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Type</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Total</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Time</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeOrders.map((order) => (
                  <TableRow 
                key={order.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      alarmingOrders.has(order.id) ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' : ''
                    }`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white">#{order.order_number}</span>
                      {alarmingOrders.has(order.id) && (
                          <span className="text-red-600 dark:text-red-400 font-bold animate-bounce">🔔</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-900 dark:text-white font-medium">
                          <User size={14} />
                          {order.customer_name}
                        </div>
                    {order.customer_phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <Phone size={12} />
                            {order.customer_phone}
                          </div>
                        )}
                        {order.table_number && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <MapPin size={12} />
                            Table {order.table_number}
                          </div>
                        )}
                        {order.delivery_address && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                            <MapPin size={12} />
                            {order.delivery_address}
                          </div>
                    )}
                  </div>
                                        </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {(() => {
                          const items = order.order_items && Array.isArray(order.order_items) ? order.order_items : [];
                          console.log(`Order ${order.order_number} items:`, items);
                          return items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full border overflow-hidden bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                {item.image_url ? (
                                  <img 
                                    src={item.image_url} 
                                    alt={item.dish_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.currentTarget as HTMLImageElement;
                                      target.style.display = 'none';
                                      const fallback = target.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 ${item.image_url ? 'hidden' : 'flex'}`}>
                                  🍽️
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.dish_name}
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {(() => {
                          const items = order.order_items && Array.isArray(order.order_items) ? order.order_items : [];
                          return items.map((item, index) => (
                            <div key={index} className="flex items-center justify-center">
                              <Badge variant="outline" className="text-xs">
                                {item.size || 'M'}
                              </Badge>
                            </div>
                          ));
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getOrderTypeColor(order.order_type)}>
                          {order.order_type.replace('_', ' ')}
                        </Badge>
                        {order.notes && (
                          <div className="mt-1 p-1 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                            <div className="flex items-center gap-1 text-yellow-800 dark:text-yellow-200">
                              <FileText size={8} />
                              <span className="font-medium">Note:</span>
                            </div>
                            <p className="text-yellow-700 dark:text-yellow-300 mt-1 truncate">
                              {order.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-white">
                      ₹{order.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                    </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar size={12} />
                        {new Date(order.created_at).toLocaleString()}
                  </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <Dialog open={showOrderDetails && selectedOrder?.id === order.id} onOpenChange={setShowOrderDetails}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderDetails(true);
                              }}
                            >
                              <Eye size={14} />
                            </Button>
                          </DialogTrigger>
                                                     <DialogContent className="max-w-2xl">
                             <DialogHeader>
                               <DialogTitle className="flex items-center gap-2">
                                 <Package size={20} />
                                 Order #{selectedOrder?.order_number} Details
                               </DialogTitle>
                             </DialogHeader>
                                                         <div className="space-y-6">
                               {/* Customer Information */}
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                   <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                     <User size={16} />
                                     Customer Information
                                   </h3>
                                   <div className="space-y-1 text-sm">
                                     <p><strong>Name:</strong> {selectedOrder?.customer_name}</p>
                                     {selectedOrder?.customer_phone && (
                                       <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                                     )}
                                     {selectedOrder?.table_number && (
                                       <p><strong>Table:</strong> {selectedOrder.table_number}</p>
                                     )}
                                     {selectedOrder?.delivery_address && (
                                       <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
                    )}
                  </div>
                                 </div>
                                 <div className="space-y-2">
                                   <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                     <Calendar size={16} />
                                     Order Information
                                   </h3>
                                   <div className="space-y-1 text-sm">
                                     <p><strong>Type:</strong> 
                                       <Badge className={`ml-2 ${getOrderTypeColor(selectedOrder?.order_type || 'DINE_IN')}`}>
                                         {selectedOrder?.order_type.replace('_', ' ') || 'DINE IN'}
                                       </Badge>
                                     </p>
                                     <p><strong>Status:</strong> 
                                       <Badge className={`ml-2 ${getStatusColor(selectedOrder?.status || 'PENDING')}`}>
                                         {selectedOrder?.status || 'PENDING'}
                                       </Badge>
                                     </p>
                                     <p><strong>Total:</strong> ₹{selectedOrder?.total_amount.toFixed(2) || '0.00'}</p>
                                     <p><strong>Time:</strong> {selectedOrder?.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 'N/A'}</p>
                                   </div>
                  </div>
                </div>

                              {/* Order Items */}
                              <div className="space-y-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <FileText size={16} />
                                  Order Items
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(selectedOrder?.order_items ?? []).map((item, index) => (
                                        <TableRow key={index}>
                                          <TableCell>
                                            <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full border overflow-hidden bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                                {item.image_url ? (
                                                  <img 
                                                    src={item.image_url} 
                                                    alt={item.dish_name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                      const target = e.currentTarget as HTMLImageElement;
                                                      target.style.display = 'none';
                                                      const fallback = target.nextElementSibling as HTMLElement;
                                                      if (fallback) fallback.classList.remove('hidden');
                                                    }}
                                                  />
                                                ) : null}
                                                <div className={`w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 ${item.image_url ? 'hidden' : 'flex'}`}>
                                                  🍽️
                                                </div>
                                              </div>
                                              <span className="font-medium">{item.dish_name}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                              {item.size || 'M'}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>₹{item.dish_price.toFixed(2)}</TableCell>
                                          <TableCell className="font-semibold">₹{item.item_total.toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                </div>

                                                             {/* Notes */}
                               {selectedOrder?.notes && (
                                 <div className="space-y-2">
                                   <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                     <FileText size={16} />
                                     Special Notes
                                   </h3>
                                   <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                     {selectedOrder.notes}
                                   </p>
                                 </div>
                               )}

                               {/* Action Buttons */}
                               {selectedOrder?.status === 'PENDING' && (
                                 <div className="flex gap-2 pt-4 border-t">
                                   <Button
                                     onClick={() => {
                                       updateOrderStatus(selectedOrder.id, 'CONFIRMED');
                                       setShowOrderDetails(false);
                                     }}
                                     className="bg-green-500 hover:bg-green-600 text-white"
                                   >
                                     <CheckCircle size={16} className="mr-2" />
                                     Accept Order
                                   </Button>
                                   <Button
                                     variant="destructive"
                                     onClick={() => {
                                       updateOrderStatus(selectedOrder.id, 'CANCELLED');
                                       setShowOrderDetails(false);
                                     }}
                                   >
                                     <XCircle size={16} className="mr-2" />
                                     Reject Order
                                   </Button>
                                 </div>
                               )}
                            </div>
                          </DialogContent>
                        </Dialog>

                  {order.status === 'PENDING' && (
                          <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                              <CheckCircle size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                      >
                              <XCircle size={14} />
                      </Button>
                          </div>
                  )}
                </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
          )}
      </CardContent>
    </Card>
  );
};

export default OrderManagement;
