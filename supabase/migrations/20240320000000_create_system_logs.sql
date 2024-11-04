-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE log_level AS ENUM ('info', 'warning', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE log_action AS ENUM ('create', 'update', 'delete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create system_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_logs (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  action log_action NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  description TEXT NOT NULL,
  level log_level DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indices if they don't exist
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_system_logs_user ON system_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
END $$;