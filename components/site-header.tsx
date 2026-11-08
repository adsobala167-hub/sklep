'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase/client';

export default function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseClient();
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const { error } = await createSupabaseClient().auth.signOut();
    if (!error) {
      setUser(null);
      router.push('/products');
      router.refresh();
    }
  }

  return (
    <header className="site-header">
      <Link className="wordmark" href="/products">Adams<span>.</span></Link>
      <nav className="header-nav" aria-label="Nawigacja główna">
        <Link href="/products">Produkty</Link>
        <Link href={user ? '/orders' : '/auth'}>Moje zamówienia</Link>
        {user ? (
          <button className="account-button" onClick={() => void signOut()}>Wyloguj</button>
        ) : (
          <Link className="account-button" href="/auth">Zaloguj <span aria-hidden="true">↗</span></Link>
        )}
      </nav>
    </header>
  );
}