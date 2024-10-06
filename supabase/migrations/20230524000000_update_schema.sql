-- Add cascading delete to order_item_extras table
ALTER TABLE order_item_extras
DROP CONSTRAINT order_item_extras_extra_option_id_fkey,
ADD CONSTRAINT order_item_extras_extra_option_id_fkey
    FOREIGN KEY (extra_option_id)
    REFERENCES extra_options(id)
    ON DELETE CASCADE;

-- Add options column to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'options') THEN
        ALTER TABLE products ADD COLUMN options JSONB;
    END IF;
END $$;

-- Update the check_extra_options function to handle the new options column
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'custom' AND (NEW.options IS NULL OR jsonb_array_length(NEW.options) = 0) THEN
    RAISE EXCEPTION 'Custom type products must have at least one option';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS ensure_valid_extra_options ON products;
CREATE TRIGGER ensure_valid_extra_options
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION check_extra_options();