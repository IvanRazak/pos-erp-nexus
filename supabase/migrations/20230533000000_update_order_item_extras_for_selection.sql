-- Adicionar coluna para armazenar o ID da opção de seleção escolhida
ALTER TABLE order_item_extras
ADD COLUMN selected_option_id UUID;

-- Adicionar uma foreign key para a tabela selection_options
ALTER TABLE order_item_extras
ADD CONSTRAINT fk_selected_option
FOREIGN KEY (selected_option_id) 
REFERENCES selection_options(id);

-- Atualizar a função de verificação
CREATE OR REPLACE FUNCTION check_order_item_extras()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.extra_option_id IS NULL THEN
    RAISE EXCEPTION 'extra_option_id cannot be null';
  END IF;
  
  -- Verificar se a opção extra é do tipo 'select' e se um selected_option_id foi fornecido
  IF (SELECT type FROM extra_options WHERE id = NEW.extra_option_id) = 'select' AND NEW.selected_option_id IS NULL THEN
    RAISE EXCEPTION 'selected_option_id must be provided for select type extra options';
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