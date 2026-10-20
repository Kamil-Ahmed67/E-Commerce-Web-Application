'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/trackEvent';

// Mountable inside a server component that renders a real product grid but
// can't call trackEvent itself (it needs `window`). Renders nothing.
export default function ViewItemListTracker({ products = [], listName }) {
    useEffect(() => {
        if (!products.length) return;
        trackEvent('view_item_list', {
            contentIds: products.map((p) => String(p.id)),
            contents: products.map((p) => ({
                id: p.id,
                title: p.title,
                price: p.sellingPrice ?? p.price ?? 0,
                quantity: 1,
                brand: p.brand,
                category: p.productType,
            })),
            numItems: products.length,
            listName,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products, listName]);

    return null;
}
