import { createClient } from '@supabase/supabase-js';

import { Database } from '../../database.types';

function requiredEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_PUBLISHABLE_KEY') {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

const supabaseUrl = requiredEnv('VITE_SUPABASE_URL');
const supabasePublishableKey = requiredEnv('VITE_SUPABASE_PUBLISHABLE_KEY');

const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export default supabase;
