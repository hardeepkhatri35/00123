import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Link, Image } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FoodItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string | null;
  is_available: boolean;
  category_id: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const FoodItemManager = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image_url: "",
    description: "",
    category_id: "",
    is_available: true
  });
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFoodItems();
    fetchCategories();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching food items:', error);
        throw error;
      }
      
      console.log('Fetched food items:', data);
      setFoodItems(data || []);
    } catch (error) {
      console.error('Error fetching food items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch food items",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `food-items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting food item:', formData);
      
      const itemData = {
        name: formData.name,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        description: formData.description || null,
        category_id: formData.category_id || null,
        is_available: formData.is_available
      };

      if (editingItem) {
        const { data, error } = await supabase
          .from('food_items')
          .update({
            ...itemData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        console.log('Updated food item:', data);

        toast({
          title: "Success",
          description: "Food item updated successfully",
        });
      } else {
        const { data, error } = await supabase
          .from('food_items')
          .insert([itemData])
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        console.log('Created food item:', data);

        toast({
          title: "Success",
          description: "Food item added successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchFoodItems();
    } catch (error) {
      console.error('Error saving food item:', error);
      toast({
        title: "Error",
        description: "Failed to save food item. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      image_url: item.image_url,
      description: item.description || "",
      category_id: item.category_id || "",
      is_available: item.is_available
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this food item?")) return;

    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Food item deleted successfully",
      });
      fetchFoodItems();
    } catch (error) {
      console.error('Error deleting food item:', error);
      toast({
        title: "Error",
        description: "Failed to delete food item",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('food_items')
        .update({ 
          is_available: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Item ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
      });
      fetchFoodItems();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: "Error",
        description: "Failed to update item availability",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      image_url: "",
      description: "",
      category_id: "",
      is_available: true
    });
    setEditingItem(null);
    setImageInputType('url');
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "No Category";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Food Item Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus size={16} className="mr-2" />
                Add Food Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Food Item" : "Add New Food Item"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label>Image</Label>
                  <Tabs value={imageInputType} onValueChange={(value) => setImageInputType(value as 'url' | 'upload')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url" className="flex items-center gap-2">
                        <Link size={16} />
                        URL
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload size={16} />
                        Upload
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="mt-2">
                      <Input
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        required={imageInputType === 'url'}
                      />
                    </TabsContent>
                    <TabsContent value="upload" className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={loading}
                      />
                    </TabsContent>
                  </Tabs>
                  {formData.image_url && (
                    <div className="mt-2">
                      <div className="w-16 h-16 mx-auto rounded-full overflow-hidden">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter item description"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                  <Label htmlFor="available">Available</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Saving..." : editingItem ? "Update" : "Add"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white"
            >
              <div className="relative">
                <div className="w-24 h-24 mx-auto mt-3 rounded-full overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant={item.is_available ? "default" : "secondary"}>
                    {item.is_available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 mb-1 text-center">{item.name}</h3>
                <p className="text-orange-600 font-bold mb-1 text-center">₹{item.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mb-2 text-center">{getCategoryName(item.category_id)}</p>
                {item.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 text-center">{item.description}</p>
                )}
                <div className="flex gap-1 flex-wrap justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                    className="hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Edit size={12} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAvailability(item.id, item.is_available)}
                    className={item.is_available ? "hover:bg-yellow-50 hover:border-yellow-300" : "hover:bg-green-50 hover:border-green-300"}
                  >
                    {item.is_available ? <EyeOff size={12} /> : <Eye size={12} />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                    className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {foodItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No food items found. Add your first item to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FoodItemManager;
