-- Alterar o tipo da coluna payment_option para TEXT
ALTER TABLE payments ALTER COLUMN payment_option TYPE TEXT;

-- Remover a restrição de enum
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_option_check;