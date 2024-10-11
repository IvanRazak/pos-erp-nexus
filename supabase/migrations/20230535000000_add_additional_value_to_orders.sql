-- Add additional_value and additional_value_description columns to orders table
ALTER TABLE orders
ADD COLUMN additional_value DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN additional_value_description TEXT;