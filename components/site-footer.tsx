import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="wordmark" href="/products">Adams<span>.</span></Link>
      <span>Sprzęt dla graczy.</span>
      <Link href="/products">Produkty ↑</Link>
    </footer>
  );
}