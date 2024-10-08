-- Atualizar a estrutura da tabela selection_options
ALTER TABLE selection_options
DROP COLUMN IF EXISTS items;

ALTER TABLE selection_options
ADD COLUMN IF NOT EXISTS value DECIMAL(10, 2);

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