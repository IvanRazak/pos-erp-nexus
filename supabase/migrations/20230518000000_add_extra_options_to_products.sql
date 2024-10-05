-- Add extra_options column to products table
ALTER TABLE products
ADD COLUMN extra_options UUID[] DEFAULT '{}';

-- Remove the incorrect foreign key constraint
-- We can't directly reference an array column to a single column

-- Instead, we'll create a trigger function to ensure data integrity
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM unnest(NEW.extra_options) AS eo(id)
    LEFT JOIN extra_options ON extra_options.id = eo.id
    WHERE extra_options.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid extra_option ID found in extra_options array';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that uses this function
CREATE TRIGGER ensure_valid_extra_options
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION check_extra_options();