
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EarningsAnalytics from "./EarningsAnalytics";
import OrderManagement from "./OrderManagement";

const AdminPanel = () => {
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
            <OrderManagement />
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
