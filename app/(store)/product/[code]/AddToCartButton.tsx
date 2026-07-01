'use client';

import { ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui';
import { trackEvent } from '@/lib/meta/pixel';

export function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const { addProduct } = useCart();

  function handleAdd() {
    addProduct(product);
    setAdded(true);
    trackEvent('AddToCart', {
      content_ids: [product.amway_code],
      content_name: product.name ?? product.amway_code,
      content_type: 'product',
      value: product.selling_price ?? 0,
      currency: 'GBP',
    });
    setTimeout(() => setAdded(false), 2000);
  }

  const inStock = product.stock_status === 'inStock';

  return (
    <Button
      size="lg"
      className="w-full sm:w-auto"
      onClick={handleAdd}
      disabled={!inStock}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added to cart
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </>
      )}
    </Button>
  );
}
