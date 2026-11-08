# Adams

Prosty sklep internetowy zbudowany w Next.js App Router, TypeScript i Supabase.

## Uruchomienie

1. Zainstaluj Node.js 18.18 lub nowszy.
2. Skopiuj `.env.example` do `.env.local` i wpisz adres projektu oraz klucz anon Supabase.
3. Uruchom `npm install`, a następnie `npm run dev`.
4. Otwórz `http://localhost:3000`.

## Supabase

W projekcie zakładamy, że `products` zawiera kolumny `id`, `name`, `description` i `price`. Opcjonalna kolumna `image_url` wyświetla zdjęcie produktu.

Endpoint zamówień zapisuje do `orders` kolumny `user_id`, `product_id` oraz `quantity`. Klient musi mieć uprawnienia RLS do odczytu produktów i własnych zamówień. Polityki `SELECT` i `INSERT` dla `orders` powinny ograniczać dostęp do `auth.uid() = user_id`; endpoint weryfikuje użytkownika przez Supabase Auth i przekazuje jego token do zapisu. Klucz `service_role` nie jest używany.

Rejestracja może wymagać potwierdzenia adresu email, zależnie od ustawień Supabase Auth.