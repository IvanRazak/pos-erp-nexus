-- Primeiro, vamos fazer backup das tabelas existentes
CREATE TABLE extra_options_backup AS SELECT * FROM extra_options;
CREATE TABLE order_item_extras_backup AS SELECT * FROM order_item_extras;

-- Agora, vamos dropar as tabelas existentes e suas dependências
DROP TABLE IF EXISTS order_item_extras;
DROP TABLE IF EXISTS extra_options;

-- Recriar a tabela extra_options com a estrutura correta
CREATE TABLE extra_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'number',
    price DECIMAL(10, 2),
    editable_in_cart BOOLEAN NOT NULL DEFAULT false,
    required BOOLEAN NOT NULL DEFAULT false,
    selection_option_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recriar a tabela order_item_extras
CREATE TABLE order_item_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    extra_option_id UUID REFERENCES extra_options(id) ON DELETE CASCADE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Restaurar os dados das tabelas de backup
INSERT INTO extra_options (id, name, type, price, editable_in_cart, required, selection_option_id, created_at, updated_at)
SELECT id, name, type, price, editable_in_cart, required, selection_option_id, created_at, updated_at
FROM extra_options_backup;

INSERT INTO order_item_extras (id, order_item_id, extra_option_id, created_at, updated_at)
SELECT id, order_item_id, extra_option_id, created_at, updated_at
FROM order_item_extras_backup;

-- Remover as tabelas de backup
DROP TABLE extra_options_backup;
DROP TABLE order_item_extras_backup;

-- Atualizar a função de verificação para extra_options
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'select' AND NEW.selection_option_id IS NULL THEN
    RAISE EXCEPTION 'Select type extra options must have a selection_option_id';
  END IF;
  IF NEW.type != 'select' AND NEW.price IS NULL THEN
    RAISE EXCEPTION 'Non-select type extra options must have a price';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger para extra_options
DROP TRIGGER IF EXISTS ensure_valid_extra_options ON extra_options;
CREATE TRIGGER ensure_valid_extra_options
BEFORE INSERT OR UPDATE ON extra_options
FOR EACH ROW
EXECUTE FUNCTION check_extra_options();

-- Adicionar políticas de segurança
ALTER TABLE extra_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON extra_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON order_item_extras FOR SELECT USING (true);

-- Adicionar índices para melhorar o desempenho
CREATE INDEX idx_extra_options_selection_option_id ON extra_options(selection_option_id);
CREATE INDEX idx_order_item_extras_order_item_id ON order_item_extras(order_item_id);
CREATE INDEX idx_order_item_extras_extra_option_id ON order_item_extras(extra_option_id);