-- Add created_by column to orders table
ALTER TABLE orders
ADD COLUMN created_by TEXT;