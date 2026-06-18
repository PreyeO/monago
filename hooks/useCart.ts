'use client';

import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { pick90Image } from '@/lib/utils';

export function useCart() {
  const store = useCartStore();

  function addProduct(product: Product) {
    if (!product.selling_price) return;
    store.addItem({
      productId: product.id,
      amway_code: product.amway_code,
      name: product.name ?? product.amway_code,
      brand: product.brand ?? '',
      image_url: pick90Image(product.image_urls),
      selling_price: product.selling_price,
    });
  }

  return {
    ...store,
    addProduct,
  };
}
