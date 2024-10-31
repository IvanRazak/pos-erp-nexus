ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Adiciona coluna para rastrear se o pedido está cancelado
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancelled BOOLEAN DEFAULT FALSE;