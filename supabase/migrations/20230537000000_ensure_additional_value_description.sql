-- Verifica se a coluna additional_value_description já existe na tabela orders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'additional_value_description') THEN
        ALTER TABLE orders ADD COLUMN additional_value_description TEXT;
    END IF;
END $$;