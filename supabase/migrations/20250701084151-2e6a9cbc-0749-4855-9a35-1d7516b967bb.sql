
-- Add payment_status column to orders table
ALTER TABLE orders 
ADD COLUMN payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED'));

-- Update existing records to have PENDING status
UPDATE orders SET payment_status = 'PENDING' WHERE payment_status IS NULL;
