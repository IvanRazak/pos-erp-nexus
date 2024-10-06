-- Check if the type column already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products' AND column_name='type') THEN
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
    END IF;
END $$;