-- Add fixed_value column to extra_options table
ALTER TABLE extra_options
ADD COLUMN fixed_value BOOLEAN NOT NULL DEFAULT false;

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