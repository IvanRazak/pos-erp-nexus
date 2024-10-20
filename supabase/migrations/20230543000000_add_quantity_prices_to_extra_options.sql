-- Add quantityPrices column to extra_options table
ALTER TABLE extra_options
ADD COLUMN quantity_prices JSONB DEFAULT '[]'::jsonb;

-- Update the check_extra_options function to handle the new column
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type IN ('number', 'checkbox') AND (
    NEW.quantity_prices IS NULL OR 
    jsonb_array_length(NEW.quantity_prices) = 0 OR
    NOT (
      SELECT bool_and(
        jsonb_typeof(price->'quantity') = 'number' AND
        jsonb_typeof(price->'price') = 'number'
      )
      FROM jsonb_array_elements(NEW.quantity_prices) AS price
    )
  ) THEN
    RAISE EXCEPTION 'Number and Checkbox type extra options must have at least one quantity price with valid quantity and price';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is updated
DROP TRIGGER IF EXISTS ensure_valid_extra_options ON extra_options;
CREATE TRIGGER ensure_valid_extra_options
BEFORE INSERT OR UPDATE ON extra_options
FOR EACH ROW
EXECUTE FUNCTION check_extra_options();