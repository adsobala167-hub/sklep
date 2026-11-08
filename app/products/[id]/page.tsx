'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import OrderButton from '@/components/order-button';
import ProductImage from '@/components/product-image';
import { createSupabaseClient } from '@/lib/supabase/client';

type Product = {
  id: string | number;
  name: string;
  description?: string | null;
  price: string | number;
  image_url?: string | null;
};

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadProduct() {
      const { data, error: queryError } = await createSupabaseClient()
        .from('products')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();
      if (!active) return;
      if (queryError) setError('Nie udało się pobrać produktu.');
      else setProduct(data as Product | null);
      setLoading(false);
    }
    void loadProduct();
    return () => { active = false; };
  }, [params.id]);

  return (
    <main className="store-page">
      <SiteHeader />
      <div className="detail-breadcrumb"><Link href="/products">← Wszystkie produkty</Link></div>
      {loading ? (
        <div className="empty-state">Ładujemy produkt…</div>
      ) : error ? (
        <p className="store-feedback error" role="alert">{error}</p>
      ) : !product ? (
        <div className="empty-state">Nie znaleźliśmy tego produktu.</div>
      ) : (
        <section className="product-detail">
          <div className="detail-image">
            <ProductImage imageUrl={product.image_url} alt={product.name} sizes="(max-width: 700px) 100vw, 55vw" />
          </div>
          <div className="detail-info">
            <h1>{product.name}</h1>
            <p className="detail-price">{Number(product.price).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</p>
            {product.description && <p className="detail-description">{product.description}</p>}
            <OrderButton productId={product.id} />
          </div>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}