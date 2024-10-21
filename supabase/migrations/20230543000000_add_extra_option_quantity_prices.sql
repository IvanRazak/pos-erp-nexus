-- Create a new table for extra option quantity prices
CREATE TABLE extra_option_quantity_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extra_option_id UUID REFERENCES extra_options(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add an index for better performance
CREATE INDEX idx_extra_option_quantity_prices_extra_option_id ON extra_option_quantity_prices(extra_option_id);

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_extra_option_quantity_prices_modtime
BEFORE UPDATE ON extra_option_quantity_prices
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Update the extra_options table to include a flag for quantity-based pricing
ALTER TABLE extra_options
ADD COLUMN use_quantity_pricing BOOLEAN DEFAULT FALSE;

-- Update the check_extra_options function
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type NOT IN ('number', 'checkbox', 'select') THEN
    RAISE EXCEPTION 'Invalid extra option type';
  END IF;
  IF NEW.type = 'select' AND NEW.selection_option_id IS NULL THEN
    RAISE EXCEPTION 'Select type extra options must have a selection_option_id';
  END IF;
  IF NEW.type IN ('number', 'checkbox') AND NEW.use_quantity_pricing = FALSE AND NEW.price IS NULL THEN
    RAISE EXCEPTION 'Non-quantity-based pricing for number and checkbox types must have a price';
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