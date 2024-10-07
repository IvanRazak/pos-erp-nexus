-- Ensure options column is JSONB and convert existing data to array
ALTER TABLE extra_options
ALTER COLUMN options TYPE JSONB USING 
  CASE 
    WHEN options IS NULL THEN '[]'::JSONB
    WHEN jsonb_typeof(options::jsonb) != 'array' THEN jsonb_build_array(options::jsonb)
    ELSE options::jsonb
  END;

-- Add a constraint to ensure options is always an array
ALTER TABLE extra_options
ADD CONSTRAINT options_is_array CHECK (jsonb_typeof(options) = 'array');

-- Update the check_extra_options function
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'select' AND (
    NEW.options IS NULL OR 
    jsonb_array_length(NEW.options) = 0 OR
    NOT (
      SELECT bool_and(
        jsonb_typeof(option->'name') = 'string' AND
        jsonb_typeof(option->'price') = 'number'
      )
      FROM jsonb_array_elements(NEW.options) AS option
    )
  ) THEN
    RAISE EXCEPTION 'Select type extra options must have at least one option with name and price';
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