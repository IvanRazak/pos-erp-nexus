-- Add columns to ensure we can track all necessary values
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
ADD COLUMN IF NOT EXISTS total_with_discount DECIMAL(10, 2) GENERATED ALWAYS AS ((quantity * unit_price) - COALESCE(discount, 0)) STORED;