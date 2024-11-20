-- Update customers table to ensure bloqueado is boolean with default value
ALTER TABLE customers 
ALTER COLUMN bloqueado SET DEFAULT false,
ALTER COLUMN bloqueado SET NOT NULL,
ALTER COLUMN bloqueado SET DATA TYPE boolean USING bloqueado::boolean;

-- Ensure customer_type_id is properly typed as UUID
ALTER TABLE customers
ALTER COLUMN customer_type_id SET DATA TYPE UUID USING customer_type_id::uuid;