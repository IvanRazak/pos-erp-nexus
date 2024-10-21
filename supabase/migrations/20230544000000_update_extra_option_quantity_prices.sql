-- Ensure the extra_option_quantity_prices table exists and has the correct structure
CREATE TABLE IF NOT EXISTS extra_option_quantity_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extra_option_id UUID REFERENCES extra_options(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_extra_option_quantity_prices_extra_option_id 
ON extra_option_quantity_prices(extra_option_id);

-- Ensure the trigger for updating the updated_at column exists
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_extra_option_quantity_prices_modtime ON extra_option_quantity_prices;
CREATE TRIGGER update_extra_option_quantity_prices_modtime
BEFORE UPDATE ON extra_option_quantity_prices
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security (RLS) on the table
ALTER TABLE extra_option_quantity_prices ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow read access for all users
CREATE POLICY "Enable read access for all users" 
ON extra_option_quantity_prices FOR SELECT 
USING (true);

-- Create a policy to allow insert, update, and delete for authenticated users
CREATE POLICY "Enable full access for authenticated users" 
ON extra_option_quantity_prices FOR ALL 
USING (auth.role() = 'authenticated');