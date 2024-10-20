-- Criar tabela para armazenar preços por quantidade das Opções Extras
CREATE TABLE extra_option_quantity_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extra_option_id UUID REFERENCES extra_options(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar índice para melhorar a performance das consultas
CREATE INDEX idx_extra_option_quantity_prices_extra_option_id ON extra_option_quantity_prices(extra_option_id);

-- Criar trigger para atualizar o campo updated_at
CREATE TRIGGER update_extra_option_quantity_prices_modtime
BEFORE UPDATE ON extra_option_quantity_prices
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Habilitar RLS na nova tabela
ALTER TABLE extra_option_quantity_prices ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura para todos os usuários
CREATE POLICY "Enable read access for all users" ON extra_option_quantity_prices FOR SELECT USING (true);