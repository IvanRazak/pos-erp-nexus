-- Create table for extra option quantity prices
CREATE TABLE extra_option_quantity_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extra_option_id UUID REFERENCES extra_options(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for better performance
CREATE INDEX idx_extra_option_quantity_prices_extra_option_id ON extra_option_quantity_prices(extra_option_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_extra_option_quantity_prices_modtime
BEFORE UPDATE ON extra_option_quantity_prices
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable RLS
ALTER TABLE extra_option_quantity_prices ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Enable read access for all users" ON extra_option_quantity_prices FOR SELECT USING (true);