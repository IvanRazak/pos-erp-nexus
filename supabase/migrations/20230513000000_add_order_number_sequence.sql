-- Criar a sequência para os números de pedido
CREATE SEQUENCE order_number_seq START 1000;

-- Adicionar a coluna order_number à tabela orders
ALTER TABLE orders ADD COLUMN order_number INTEGER UNIQUE;

-- Função para obter o próximo número de pedido
CREATE OR REPLACE FUNCTION get_next_order_number()
RETURNS INTEGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT nextval('order_number_seq') INTO next_number;
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir automaticamente o order_number ao inserir um novo pedido
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := get_next_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();
