-- Modify the options column in extra_options table to store price information
ALTER TABLE extra_options
ALTER COLUMN options TYPE JSONB USING options::jsonb;

-- Update the check_extra_options function to validate the new options structure
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