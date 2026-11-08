'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase/client';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import OrderButton from '@/components/order-button';
import ProductImage from '@/components/product-image';

type Product = {
  id: string | number;
  name: string;
  description?: string | null;
  price: string | number;
  image_url?: string | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseClient();

    async function loadProducts() {
      const { data, error: queryError } = await supabase.from('products').select('*').order('id');
      if (!active) return;
      if (queryError) setError('Nie udało się pobrać produktów. Sprawdź połączenie z bazą.');
      else setProducts((data ?? []) as Product[]);
      setLoading(false);
    }

    void loadProducts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="store-page">
      <SiteHeader />

      <section className="store-intro">
        <div>
          <h1>Sprzęt dla graczy.</h1>
        </div>
        <p className="intro-note">Klawiatury, myszki i słuchawki w jednym miejscu.</p>
      </section>

      <section className="products-section" id="produkty">
        <div className="section-heading">
          <h2>Wybierz swój arsenał</h2>
          <span>{loading ? 'Ładowanie…' : `${products.length} produktów`}</span>
        </div>

        {error && <p className="store-feedback error" role="alert">{error}</p>}

        {loading ? (
          <div className="empty-state">Ładujemy produkty…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">Na razie nie ma tu produktów.</div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-item" key={product.id}>
                <Link className="product-visual" href={`/products/${product.id}`} aria-label={`Zobacz produkt ${product.name}`}>
                  <ProductImage imageUrl={product.image_url} alt={product.name} sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 33vw" />
                </Link>
                <div className="product-meta">
                  <div>
                    <h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3>
                    {product.description && <p>{product.description}</p>}
                  </div>
                  <span className="product-price">{Number(product.price).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</span>
                </div>
                <OrderButton productId={product.id} label="Zamów" />
              </article>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}