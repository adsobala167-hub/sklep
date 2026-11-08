'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase/client';

export default function OrderButton({ productId, label = 'Zamów' }: { productId: string | number; label?: string }) {
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createSupabaseClient();
    void supabase.auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function order() {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const supabase = createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Zaloguj się ponownie, aby złożyć zamówienie.');

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Nie udało się złożyć zamówienia.');
      setMessage('Zamówienie zapisane. Dziękujemy!');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Nie udało się złożyć zamówienia.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <button className="button button-order" disabled>Sprawdzanie…</button>;
  if (!signedIn) return <Link className="button button-order" href="/auth">Zaloguj, aby kupić <span aria-hidden="true">↗</span></Link>;

  return (
    <div>
      <button className="button button-order" onClick={() => void order()} disabled={busy}>
        {busy ? 'Dodawanie…' : label} <span aria-hidden="true">↗</span>
      </button>
      {message && <p className="order-message success" role="status">{message}</p>}
      {error && <p className="order-message error" role="alert">{error}</p>}
    </div>
  );
}