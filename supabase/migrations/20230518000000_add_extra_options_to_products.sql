-- Add extra_options column to products table
ALTER TABLE products
ADD COLUMN extra_options UUID[] DEFAULT '{}';

-- Add a foreign key constraint to ensure all UUIDs in extra_options exist in extra_options table
ALTER TABLE products
ADD CONSTRAINT fk_products_extra_options
FOREIGN KEY (extra_options)
REFERENCES extra_options(id);