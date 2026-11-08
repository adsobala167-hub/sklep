'use client';

import { useState } from 'react';
import Image from 'next/image';

type ProductImageProps = {
  imageUrl?: string | null;
  alt: string;
  sizes: string;
};

export default function ProductImage({ imageUrl, alt, sizes }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  // Akceptujemy wyłącznie pliki bezpośrednio z public/products.
  const isLocalImage = imageUrl && /^\/products\/[\w.-]+$/.test(imageUrl);

  if (!isLocalImage || failed) {
    return <span className="image-placeholder" aria-hidden="true">Brak zdjęcia</span>;
  }

  return (
    <Image
      className="product-image"
      src={imageUrl}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      onError={() => setFailed(true)}
    />
  );
}