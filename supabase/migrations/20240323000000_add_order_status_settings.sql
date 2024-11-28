-- Create order_status_settings table
CREATE TABLE IF NOT EXISTS order_status_settings (
    id INTEGER PRIMARY KEY,
    full_payment_status TEXT NOT NULL DEFAULT 'in_production',
    partial_payment_status TEXT NOT NULL DEFAULT 'partial_payment',
    zero_payment_status TEXT NOT NULL DEFAULT 'pending',
    allow_zero_payment BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO order_status_settings (id, full_payment_status, partial_payment_status, zero_payment_status, allow_zero_payment)
VALUES (1, 'in_production', 'partial_payment', 'pending', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE order_status_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON order_status_settings
    FOR SELECT USING (true);

CREATE POLICY "Enable update for authenticated users" ON order_status_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at
CREATE TRIGGER update_order_status_settings_modtime
    BEFORE UPDATE ON order_status_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();