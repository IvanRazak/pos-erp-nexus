-- Add blocked column to users table
ALTER TABLE users
ADD COLUMN blocked BOOLEAN DEFAULT false NOT NULL;

-- Update RLS policies to include blocked status check
CREATE POLICY "Blocked users cannot access any data"
ON users
FOR ALL
USING (NOT blocked);