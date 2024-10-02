import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_API_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_PROJECT_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_API_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);