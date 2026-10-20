import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default supabase;
