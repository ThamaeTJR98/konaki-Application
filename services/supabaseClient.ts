
import { createClient } from '@supabase/supabase-js';

// Safe environment variable access
const getEnv = (key: string) => {
  try {
    // Check process.env (Node/Sandbox)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // ignore
  }
  
  try {
    // Check import.meta.env (Vite)
    if ((import.meta as any)?.env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    // ignore
  }
  
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const getSupabase = () => supabase;

// Helper to check if we are online and have a DB connection
export const isOnline = () => {
    return navigator.onLine && !!supabase;
}
