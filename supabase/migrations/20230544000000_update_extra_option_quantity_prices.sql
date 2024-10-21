-- Adicionar uma coluna para armazenar o nível do preço
ALTER TABLE extra_option_quantity_prices
ADD COLUMN price_level INT NOT NULL DEFAULT 1;

-- Adicionar um índice para melhorar a performance das consultas
CREATE INDEX idx_extra_option_quantity_prices_level ON extra_option_quantity_prices(extra_option_id, price_level);

-- Atualizar a função de verificação
CREATE OR REPLACE FUNCTION check_extra_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type NOT IN ('number', 'checkbox', 'select') THEN
    RAISE EXCEPTION 'Invalid extra option type';
  END IF;
  IF NEW.type = 'select' AND NEW.selection_option_id IS NULL THEN
    RAISE EXCEPTION 'Select type extra options must have a selection_option_id';
  END IF;
  IF NEW.type IN ('number', 'checkbox') AND NEW.use_quantity_pricing = FALSE AND NEW.price IS NULL THEN
    RAISE EXCEPTION 'Non-quantity-based pricing for number and checkbox types must have a price';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger
DROP TRIGGER IF EXISTS ensure_valid_extra_options ON extra_options;
CREATE TRIGGER ensure_valid_extra_options
BEFORE INSERT OR UPDATE ON extra_options
FOR EACH ROW
EXECUTE FUNCTION check_extra_options();