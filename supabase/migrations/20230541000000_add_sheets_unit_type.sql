-- Adiciona o novo tipo de unidade 'sheets' ao enum product_unit_type
ALTER TYPE product_unit_type ADD VALUE IF NOT EXISTS 'sheets';

-- Cria uma nova tabela para armazenar os níveis de preço para produtos do tipo 'sheets'
CREATE TABLE IF NOT EXISTS product_sheet_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adiciona um índice para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_product_sheet_prices_product_id ON product_sheet_prices(product_id);

-- Cria uma trigger para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_product_sheet_prices_modtime()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_sheet_prices_modtime
BEFORE UPDATE ON product_sheet_prices
FOR EACH ROW
EXECUTE FUNCTION update_product_sheet_prices_modtime();