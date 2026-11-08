import { createClient } from '@supabase/supabase-js';

// Klient przeglądarkowy korzysta wyłącznie z publicznego klucza anon.
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Uzupełnij NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createClient(url, anonKey);
}