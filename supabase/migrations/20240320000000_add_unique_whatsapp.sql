-- Add unique constraint to whatsapp column
ALTER TABLE customers
ADD CONSTRAINT unique_whatsapp UNIQUE (whatsapp);

-- Create index for better performance
CREATE INDEX idx_customers_whatsapp ON customers(whatsapp);