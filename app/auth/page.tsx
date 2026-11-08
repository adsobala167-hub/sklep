'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (mode === 'register' && password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków.');
      return;
    }

    setBusy(true);

    try {
      const supabase = createSupabaseClient();
      const result = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (result.error) throw result.error;

      if (mode === 'register' && !result.data.session) {
        if (result.data.user?.identities?.length === 0) {
          setError('Konto z tym adresem email już istnieje. Zaloguj się lub użyj innego adresu.');
          return;
        }
        setMessage('Konto utworzone. Sprawdź pocztę, aby potwierdzić adres email.');
      } else {
        router.push('/products');
        router.refresh();
      }
    } catch (caught) {
      const errorText = caught instanceof Error ? caught.message : '';
      const normalizedError = errorText.toLowerCase();
      if (normalizedError.includes('password') && (normalizedError.includes('short') || normalizedError.includes('least'))) {
        setError('Hasło musi mieć co najmniej 6 znaków.');
      } else if (normalizedError.includes('already registered') || normalizedError.includes('already been registered')) {
        setError('Konto z tym adresem email już istnieje. Zaloguj się lub użyj innego adresu.');
      } else if (mode === 'login' && normalizedError.includes('invalid login')) {
        setError('Nieprawidłowy adres email lub hasło.');
      } else {
        setError(errorText || 'Nie udało się wykonać operacji.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <SiteHeader />
      <section className="auth-layout">
        <div className="auth-intro">
          <h1>Sprzęt dla graczy.</h1>
          <p>Klawiatury, myszki i słuchawki w jednym miejscu.</p>
        </div>

        <div className="auth-form-wrap">
          <div className="mode-switch" role="tablist" aria-label="Wybierz sposób logowania">
            <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Logowanie</button>
            <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); setMessage(''); }}>Rejestracja</button>
          </div>

          <h2>{mode === 'login' ? 'Witaj ponownie' : 'Utwórz konto'}</h2>
          <p className="form-subtitle">{mode === 'login' ? 'Zaloguj się swoim adresem email.' : 'Wystarczy email i bezpieczne hasło.'}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Adres email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            <label htmlFor="password">Hasło</label>
            <input id="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required value={password} onChange={(event) => setPassword(event.target.value)} />
            {error && <p className="form-message error" role="alert">{error}</p>}
            {message && <p className="form-message success" role="status">{message}</p>}
            <button className="button button-dark auth-submit" type="submit" disabled={busy}>
              {busy ? 'Chwileczkę…' : mode === 'login' ? 'Zaloguj' : 'Zarejestruj'}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          <Link className="back-link" href="/products">← Wróć do produktów</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}