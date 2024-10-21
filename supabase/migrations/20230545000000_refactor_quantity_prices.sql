-- Criar uma nova tabela para os preços por quantidade
CREATE TABLE extra_option_quantity_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extra_option_id UUID REFERENCES extra_options(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar índice para melhorar a performance
CREATE INDEX idx_extra_option_quantity_pricing_extra_option_id 
ON extra_option_quantity_pricing(extra_option_id);

-- Migrar dados existentes
INSERT INTO extra_option_quantity_pricing (extra_option_id, quantity, price)
SELECT extra_option_id, quantity, price
FROM extra_option_quantity_prices;

-- Remover a tabela antiga
DROP TABLE extra_option_quantity_prices;

-- Atualizar a coluna use_quantity_pricing na tabela extra_options
ALTER TABLE extra_options
ADD COLUMN use_quantity_pricing BOOLEAN DEFAULT FALSE;

-- Atualizar use_quantity_pricing para true onde existem preços por quantidade
UPDATE extra_options
SET use_quantity_pricing = TRUE
WHERE id IN (SELECT DISTINCT extra_option_id FROM extra_option_quantity_pricing);

-- Criar uma função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar um trigger para atualizar o timestamp
CREATE TRIGGER update_extra_option_quantity_pricing_modtime
BEFORE UPDATE ON extra_option_quantity_pricing
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Adicionar políticas de segurança
ALTER TABLE extra_option_quantity_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON extra_option_quantity_pricing FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON extra_option_quantity_pricing FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only"
ON extra_option_quantity_pricing FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only"
ON extra_option_quantity_pricing FOR DELETE
USING (auth.role() = 'authenticated');