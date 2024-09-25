-- Update the order_status enum to include 'paid'
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'paid';