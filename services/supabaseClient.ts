
import { createClient } from '@supabase/supabase-js';

// Access environment variables. 
// Support both process.env (Sandbox) and import.meta.env (Vite/Vercel)
const supabaseUrl = process.env.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const getSupabase = () => supabase;

// Helper to check if we are online and have a DB connection
export const isOnline = () => {
    return navigator.onLine && !!supabase;
}
