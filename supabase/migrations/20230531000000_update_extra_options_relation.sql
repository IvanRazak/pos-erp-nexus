-- Adicionar coluna selection_options para extra_options
ALTER TABLE extra_options
ADD COLUMN selection_options UUID[] DEFAULT '{}';

-- Atualizar a função de verificação para extra_options
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'select' AND (NEW.selection_options IS NULL OR array_length(NEW.selection_options, 1) = 0) THEN
    RAISE EXCEPTION 'Select type extra options must have at least one selection option';
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