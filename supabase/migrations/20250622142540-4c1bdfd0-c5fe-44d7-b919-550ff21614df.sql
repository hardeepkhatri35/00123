
-- Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_items table
CREATE TABLE public.food_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on categories" ON public.categories FOR DELETE USING (true);

CREATE POLICY "Allow public read access on food_items" ON public.food_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on food_items" ON public.food_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on food_items" ON public.food_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on food_items" ON public.food_items FOR DELETE USING (true);

-- Insert some default categories
INSERT INTO public.categories (name, icon) VALUES 
('Main Course', 'utensils'),
('Appetizers', 'cookie'),
('Beverages', 'coffee'),
('Desserts', 'cake');

-- Insert some default food items
INSERT INTO public.food_items (name, price, image_url, description) VALUES 
('Prawn Raisuka', 12.00, 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop', 'Delicious prawn with special sauce'),
('Firecracker Prawn', 11.00, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop', 'Spicy prawn with firecracker seasoning'),
('Hot Chicken Katsu', 9.75, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop', 'Crispy chicken katsu with spicy sauce'),
('Tofu Firecracker', 9.75, 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop', 'Vegetarian firecracker tofu'),
('Spicy Ramen Bowl', 10.50, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', 'Traditional spicy ramen'),
('Beef Ramen Special', 12.25, 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=300&fit=crop', 'Premium beef ramen with special toppings');
