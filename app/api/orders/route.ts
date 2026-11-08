import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return NextResponse.json({ error: 'Zaloguj się, aby złożyć zamówienie.' }, { status: 401 });
  }

  let productId: unknown;
  let quantity: unknown;
  try {
    const body = await request.json();
    productId = body?.product_id ?? body?.productId;
    quantity = body?.quantity;
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane zamówienia.' }, { status: 400 });
  }

  if ((typeof productId !== 'string' && typeof productId !== 'number') || String(productId).trim().length === 0) {
    return NextResponse.json({ error: 'Podaj prawidłowy produkt.' }, { status: 400 });
  }
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ error: 'Ilość musi być liczbą całkowitą większą od zera.' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Brak konfiguracji Supabase na serwerze.' }, { status: 500 });
  }

  // Supabase weryfikuje token; identyfikator użytkownika nie pochodzi z żądania klienta.
  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Sesja jest nieprawidłowa. Zaloguj się ponownie.' }, { status: 401 });
  }

  const { error: insertError } = await supabase.from('orders').insert({
    user_id: user.id,
    product_id: productId,
    quantity,
  });

  if (insertError) {
    console.error('Nie udało się zapisać zamówienia:', insertError.message);
    return NextResponse.json({ error: 'Nie udało się zapisać zamówienia.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Zamówienie zapisane.' }, { status: 201 });
}