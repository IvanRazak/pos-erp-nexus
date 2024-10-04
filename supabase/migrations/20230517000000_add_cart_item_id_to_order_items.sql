-- Add cart_item_id column to order_items table
ALTER TABLE order_items
ADD COLUMN cart_item_id TEXT;

-- Create an index on cart_item_id for better performance
CREATE INDEX idx_order_items_cart_item_id ON order_items(cart_item_id);