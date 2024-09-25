-- Add width and height columns to order_items table
ALTER TABLE order_items
ADD COLUMN width NUMERIC,
ADD COLUMN height NUMERIC;