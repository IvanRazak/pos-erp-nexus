-- Add new column for storing the status when payment is completed in Financeiro
ALTER TABLE order_status_settings
ADD COLUMN IF NOT EXISTS full_payment_status_financeiro TEXT NOT NULL DEFAULT 'paid';