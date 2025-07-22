-- Delete Categories Script
-- This script will delete specific food categories and their associated food items

-- First, delete all food items in these categories
DELETE FROM public.food_items 
WHERE category_id IN (
  SELECT id FROM public.categories 
  WHERE name IN ('Sandwich', 'Pizza', 'Noodles', 'Manchurian', 'Milk Shake', 'Coffee')
);

-- Then delete the categories themselves
DELETE FROM public.categories 
WHERE name IN ('Sandwich', 'Pizza', 'Noodles', 'Manchurian', 'Milk Shake', 'Coffee');

-- Verify deletion
SELECT name FROM public.categories ORDER BY name;