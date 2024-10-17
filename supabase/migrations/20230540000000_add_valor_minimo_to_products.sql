-- Add valor_minimo column to products table
ALTER TABLE products
ADD COLUMN valor_minimo DECIMAL(10, 2);

-- Update the check_extra_options function to handle the new column
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unit_type = 'square_meter' AND NEW.valor_minimo IS NULL THEN
    RAISE EXCEPTION 'Square meter products must have a minimum value';
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