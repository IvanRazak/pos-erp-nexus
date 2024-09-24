-- Create customer_types table
CREATE TABLE customer_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger to update the updated_at column
CREATE TRIGGER update_customer_types_modtime
    BEFORE UPDATE ON customer_types
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security (RLS) on the table
ALTER TABLE customer_types ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Enable read access for all users" ON customer_types FOR SELECT USING (true);

-- Insert some initial data
INSERT INTO customer_types (name) VALUES ('Pessoa Física'), ('Pessoa Jurídica');