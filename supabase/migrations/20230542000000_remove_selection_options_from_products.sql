-- Remove any reference to selection_options from products table
ALTER TABLE products DROP COLUMN IF EXISTS selection_options;

-- Ensure extra_options column exists and is of type UUID[]
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'extra_options') THEN
    ALTER TABLE products ADD COLUMN extra_options UUID[] DEFAULT '{}';
  END IF;
END $$;

-- Update the check_extra_options function to remove references to selection_options
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  -- Add any necessary checks here, for example:
  -- IF NEW.type = 'custom' AND (NEW.options IS NULL OR jsonb_array_length(NEW.options) = 0) THEN
  --   RAISE EXCEPTION 'Custom type products must have at least one option';
  -- END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS ensure_valid_extra_options ON products;
CREATE TRIGGER ensure_valid_extra_options
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION check_extra_options();