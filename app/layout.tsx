import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Adams',
  description: 'Klawiatury, myszki i słuchawki w jednym miejscu.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}