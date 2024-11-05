-- Garante que a tabela orders tenha as colunas necessárias para rastreamento de pagamentos
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_balance DECIMAL(10, 2) DEFAULT 0;

-- Atualiza o trigger para manter o saldo restante sincronizado
CREATE OR REPLACE FUNCTION update_order_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza o saldo restante baseado no valor total e valor pago
  NEW.remaining_balance = NEW.total_amount - NEW.paid_amount;
  
  -- Atualiza o status do pedido baseado no saldo restante
  IF NEW.remaining_balance <= 0 THEN
    NEW.status = 'paid';
  ELSE
    NEW.status = 'partial_payment';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria ou substitui o trigger
DROP TRIGGER IF EXISTS update_order_payment_status_trigger ON orders;
CREATE TRIGGER update_order_payment_status_trigger
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_order_payment_status();