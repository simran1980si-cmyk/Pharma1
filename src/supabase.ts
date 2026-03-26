import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ekclmhtsjubzpahjpfed.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !supabaseAnonKey) {
  console.error('Supabase configuration is incomplete. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the AI Studio Secrets panel.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy-key'
);
