-- Verifica se as colunas já existem e as adiciona se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'additional_value') THEN
        ALTER TABLE orders ADD COLUMN additional_value DECIMAL(10, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'additional_value_description') THEN
        ALTER TABLE orders ADD COLUMN additional_value_description TEXT;
    END IF;
END $$;