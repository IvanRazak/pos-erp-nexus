-- Add new columns to extra_options table
ALTER TABLE extra_options
ADD COLUMN type TEXT NOT NULL DEFAULT 'number',
ADD COLUMN options JSONB,
ADD COLUMN editable_in_cart BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN required BOOLEAN NOT NULL DEFAULT false;

-- Update the check_extra_options function to handle the new columns
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'select' AND (NEW.options IS NULL OR jsonb_array_length(NEW.options) = 0) THEN
    RAISE EXCEPTION 'Select type extra options must have at least one option';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that uses this function
DROP TRIGGER IF EXISTS ensure_valid_extra_options ON extra_options;
CREATE TRIGGER ensure_valid_extra_options
BEFORE INSERT OR UPDATE ON extra_options
FOR EACH ROW
EXECUTE FUNCTION check_extra_options();