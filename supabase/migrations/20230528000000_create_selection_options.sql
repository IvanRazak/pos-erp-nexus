-- Create selection_options table
CREATE TABLE selection_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create selection_option_items table
CREATE TABLE selection_option_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    selection_option_id UUID REFERENCES selection_options(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add selection_option_id to extra_options table
ALTER TABLE extra_options
ADD COLUMN selection_option_id UUID REFERENCES selection_options(id);

-- Remove the options column from extra_options table
ALTER TABLE extra_options
DROP COLUMN options;

-- Update the check_extra_options function
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'select' AND NEW.selection_option_id IS NULL THEN
    RAISE EXCEPTION 'Select type extra options must have a selection_option_id';
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

-- Add triggers for updating timestamps
CREATE TRIGGER update_selection_options_modtime
BEFORE UPDATE ON selection_options
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_selection_option_items_modtime
BEFORE UPDATE ON selection_option_items
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE selection_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE selection_option_items ENABLE ROW LEVEL SECURITY;

-- Create policies for read access
CREATE POLICY "Enable read access for all users" ON selection_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON selection_option_items FOR SELECT USING (true);