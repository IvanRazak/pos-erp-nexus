-- Adicionar colunas para suportar pagamento parcial na tabela orders
ALTER TABLE orders
ADD COLUMN paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN remaining_balance DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Atualizar o tipo da coluna status para incluir o status de pagamento parcial
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'partial_payment';

-- Criar um trigger para atualizar o saldo restante automaticamente
CREATE OR REPLACE FUNCTION update_remaining_balance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.remaining_balance = NEW.total_amount - NEW.paid_amount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_remaining_balance
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_remaining_balance();