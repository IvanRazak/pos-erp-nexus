-- Add options column to products table
ALTER TABLE products
ADD COLUMN options JSONB;

-- Update the check_extra_options function to handle the new column
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