-- Create extra_option_quantity_prices table
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

-- Create trigger to update the updated_at column
CREATE TRIGGER update_extra_option_quantity_prices_modtime
BEFORE UPDATE ON extra_option_quantity_prices
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add RLS policies
ALTER TABLE extra_option_quantity_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON extra_option_quantity_prices FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON extra_option_quantity_prices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON extra_option_quantity_prices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON extra_option_quantity_prices FOR DELETE USING (auth.role() = 'authenticated');