'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/meta/pixel';

interface Props {
  contentId: string;
  name: string;
  price: number;
  category?: string;
}

export function ProductViewTracker({ contentId, name, price, category }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent('ViewContent', {
      content_ids: [contentId],
      content_name: name,
      content_type: 'product',
      content_category: category,
      value: price,
      currency: 'GBP',
    });
  }, [contentId, name, price, category]);

  return null;
}
