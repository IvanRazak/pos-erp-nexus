-- Update the payment_option enum to include 'pix'
ALTER TYPE payment_option ADD VALUE IF NOT EXISTS 'pix';