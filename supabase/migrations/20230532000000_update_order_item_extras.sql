-- Adicionar colunas para armazenar o valor inserido e o valor total
ALTER TABLE order_item_extras
ADD COLUMN inserted_value DECIMAL(10, 2),
ADD COLUMN total_value DECIMAL(10, 2);

-- Atualizar a função de verificação
CREATE OR REPLACE FUNCTION check_order_item_extras()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.extra_option_id IS NULL THEN
    RAISE EXCEPTION 'extra_option_id cannot be null';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger
DROP TRIGGER IF EXISTS ensure_valid_order_item_extras ON order_item_extras;
CREATE TRIGGER ensure_valid_order_item_extras
BEFORE INSERT OR UPDATE ON order_item_extras
FOR EACH ROW
EXECUTE FUNCTION check_order_item_extras();