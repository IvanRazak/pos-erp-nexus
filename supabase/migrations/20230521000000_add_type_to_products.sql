-- Add type column to products table
ALTER TABLE products
ADD COLUMN type TEXT;

-- Update existing products to have a default type
UPDATE products
SET type = 'standard'
WHERE type IS NULL;

-- Make type column NOT NULL
ALTER TABLE products
ALTER COLUMN type SET NOT NULL;