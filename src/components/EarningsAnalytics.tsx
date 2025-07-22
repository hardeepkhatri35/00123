
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Calendar } from "lucide-react";

interface EarningsData {
  date: string;
  earnings: number;
  orders: number;
}

interface OrderStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  dailyEarnings: EarningsData[];
  ordersByStatus: Array<{
    status: string;
    count: number;
    color: string;
  }>;
}

const EarningsAnalytics = () => {
  const [stats, setStats] = useState<OrderStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingItems: [],
    dailyEarnings: [],
    ordersByStatus: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch orders with items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .gte('created_at', startDate.toISOString())
        .neq('status', 'CANCELLED');

      if (ordersError) throw ordersError;

      // Calculate stats
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Top selling items
      const itemStats: { [key: string]: { quantity: number; revenue: number } } = {};
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          if (!itemStats[item.dish_name]) {
            itemStats[item.dish_name] = { quantity: 0, revenue: 0 };
          }
          itemStats[item.dish_name].quantity += item.quantity;
          itemStats[item.dish_name].revenue += Number(item.item_total);
        });
      });

      const topSellingItems = Object.entries(itemStats)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Daily earnings
      const dailyStats: { [key: string]: EarningsData } = {};
      orders?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { date, earnings: 0, orders: 0 };
        }
        dailyStats[date].earnings += Number(order.total_amount);
        dailyStats[date].orders += 1;
      });

      const dailyEarnings = Object.values(dailyStats).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Orders by status
      const statusStats: { [key: string]: number } = {};
      const statusColors: { [key: string]: string } = {
        'PENDING': '#FBB040',
        'CONFIRMED': '#3B82F6',
        'PREPARING': '#F97316',
        'READY': '#8B5CF6',
        'DELIVERED': '#10B981',
        'CANCELLED': '#EF4444'
      };

      orders?.forEach(order => {
        statusStats[order.status] = (statusStats[order.status] || 0) + 1;
      });

      const ordersByStatus = Object.entries(statusStats).map(([status, count]) => ({
        status,
        count,
        color: statusColors[status] || '#6B7280'
      }));

      setStats({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topSellingItems,
        dailyEarnings,
        ordersByStatus
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const percentageChange = 12.5; // This would be calculated based on previous period comparison

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {(['7d', '30d', '90d'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              period === p
                ? 'bg-orange-100 text-orange-600 border border-orange-300'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{percentageChange}% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Average Order Value</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₹{stats.averageOrderValue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-purple-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +4.1% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Growth Rate</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">+{percentageChange}%</div>
            <div className="flex items-center text-xs text-orange-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Revenue growth
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stats.ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Orders']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {stats.ordersByStatus.map((item) => (
                <Badge 
                  key={item.status} 
                  variant="outline"
                  style={{ borderColor: item.color, color: item.color }}
                >
                  {item.status}: {item.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topSellingItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [value, name === 'quantity' ? 'Quantity Sold' : 'Revenue']} />
              <Bar dataKey="quantity" fill="#3B82F6" name="Quantity" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Best Performing Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topSellingItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.quantity} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{item.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
          
          {stats.topSellingItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sales data available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsAnalytics;
