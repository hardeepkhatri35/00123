-- Add prices column to food_items table for size-based pricing
ALTER TABLE food_items 
ADD COLUMN prices JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN food_items.prices IS 'JSON object storing size-based prices e.g. {"S": 150, "M": 280, "L": 460}';
