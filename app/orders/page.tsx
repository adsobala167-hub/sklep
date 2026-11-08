'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ProductImage from '@/components/product-image';
import { createSupabaseClient } from '@/lib/supabase/client';

type Order = {
  id: string | number;
  product_id: string | number;
  quantity?: number | null;
  created_at?: string | null;
  order_date?: string | null;
};

type Product = { id: string | number; name: string; image_url?: string | null };

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      const supabase = createSupabaseClient();
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      setUser(currentUser);
      if (authError) setError('Nie udało się sprawdzić sesji.');
      if (!currentUser) {
        router.replace('/auth');
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id);
      if (!active) return;
      if (queryError) {
        setError('Nie udało się pobrać zamówień. Sprawdź uprawnienia RLS tabeli orders.');
        setLoading(false);
        return;
      }

      const userOrders = (data ?? []) as Order[];
      userOrders.sort((a, b) => Date.parse(b.created_at ?? b.order_date ?? '') - Date.parse(a.created_at ?? a.order_date ?? ''));
      setOrders(userOrders);
      const productIds = [...new Set(userOrders.map((order) => order.product_id))];
      if (productIds.length) {
        const { data: productRows } = await supabase.from('products').select('id, name, image_url').in('id', productIds);
        if (active) setProducts(Object.fromEntries(((productRows ?? []) as Product[]).map((product) => [String(product.id), product])));
      }
      if (active) setLoading(false);
    }
    void loadOrders();
    return () => { active = false; };
  }, [router]);

  return (
    <main className="store-page">
      <SiteHeader />
      <section className="orders-section">
        <div className="section-heading"><h1>Moje zamówienia</h1></div>
        {error && <p className="store-feedback error" role="alert">{error}</p>}
        {loading ? (
          <div className="empty-state">Ładujemy zamówienia…</div>
        ) : !user ? (
          <div className="empty-state">Zaloguj się, aby zobaczyć swoje zamówienia.<br /><Link className="orders-login" href="/auth">Przejdź do logowania →</Link></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">Nie masz jeszcze zamówień. <Link className="orders-login" href="/products">Zobacz produkty →</Link></div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const product = products[String(order.product_id)];
              const date = order.created_at ?? order.order_date;
              return (
                <article className="order-row" key={order.id}>
                  <Link className="order-image" href={`/products/${order.product_id}`}>
                    <ProductImage imageUrl={product?.image_url} alt={product?.name ?? 'Produkt'} sizes="96px" />
                  </Link>
                  <div className="order-product">
                    <h2>{product?.name ?? 'Produkt niedostępny'}</h2>
                    <p>Ilość: {order.quantity ?? 1}</p>
                  </div>
                  <time className="order-date" dateTime={date ?? undefined}>
                    {date ? new Date(date).toLocaleDateString('pl-PL') : 'Data niedostępna'}
                  </time>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}