-- Check if the column exists before adding it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 
                  FROM information_schema.columns 
                  WHERE table_name = 'orders' 
                  AND column_name = 'cancelled') THEN
        ALTER TABLE orders ADD COLUMN cancelled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_orders_cancelled ON orders(cancelled);

-- Update existing orders to have cancelled = false
UPDATE orders SET cancelled = FALSE WHERE cancelled IS NULL;

-- Add a constraint to ensure cancelled is not null
ALTER TABLE orders 
ALTER COLUMN cancelled SET NOT NULL,
ALTER COLUMN cancelled SET DEFAULT FALSE;