-- Add payment_option column to orders table
ALTER TABLE orders
ADD COLUMN payment_option TEXT;

-- Update existing orders to have a default payment option
UPDATE orders
SET payment_option = 'cash'
WHERE payment_option IS NULL;

-- Make payment_option column NOT NULL
ALTER TABLE orders
ALTER COLUMN payment_option SET NOT NULL;