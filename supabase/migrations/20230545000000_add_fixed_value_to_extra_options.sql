-- Add fixed_value column to extra_options table
ALTER TABLE extra_options
ADD COLUMN fixed_value BOOLEAN NOT NULL DEFAULT false;