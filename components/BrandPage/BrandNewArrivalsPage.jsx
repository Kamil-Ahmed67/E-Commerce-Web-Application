import BrandNewArrivalsClient from './BrandNewArrivalsClient';
import { getProducts } from '@/lib/server/shopData';
import { getMenuTitleByPath } from '@/lib/server/getMenuTitle';

export default async function BrandNewArrivalsPage({ brandKey, brandDisplayName, accentColor, brandSlug }) {
    const [products, headerTitle] = await Promise.all([
        getProducts(),
        getMenuTitleByPath('/new-arrival', 'New Arrivals'),
    ]);

    const newArrivals = products.filter(
        p => p.brand === brandKey && p.status === 'New'
    );

    // Group by productType, preserving first-seen order
    const typeMap = new Map();
    for (const product of newArrivals) {
        const type = product.productType || 'Other';
        if (!typeMap.has(type)) typeMap.set(type, []);
        typeMap.get(type).push(product);
    }

    const groups = Array.from(typeMap.entries()).map(([type, products]) => ({ type, products }));

    return (
        <BrandNewArrivalsClient
            brandDisplayName={brandDisplayName}
            accentColor={accentColor}
            groups={groups}
            headerTitle={headerTitle}
            brandSlug={brandSlug}
        />
    );
}
