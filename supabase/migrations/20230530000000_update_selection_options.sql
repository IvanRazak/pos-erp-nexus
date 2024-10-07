-- Remover a coluna selection_option_id da tabela extra_options
ALTER TABLE extra_options DROP COLUMN IF EXISTS selection_option_id;

-- Adicionar uma coluna para armazenar os itens diretamente na tabela selection_options
ALTER TABLE selection_options ADD COLUMN items JSONB DEFAULT '[]'::jsonb;

-- Remover a tabela selection_option_items, já que não será mais necessária
DROP TABLE IF EXISTS selection_option_items;

-- Atualizar a função de verificação para extra_options
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'select' AND NEW.price IS NOT NULL THEN
    RAISE EXCEPTION 'Select type extra options must not have a price';
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