import React, { Suspense } from 'react';
import ShopNewWithSidebar from '@/components/ShopNewWithSidebar';
import MingleLoader from '@/components/MingleLoader/MingleLoader';
import GenderNewArrivalsClient from '@/components/GenderNewArrivals/GenderNewArrivalsClient';
import { getProducts } from '@/lib/server/shopData';
import { getMenuTitleByPath } from '@/lib/server/getMenuTitle';
import { normalizeGender } from '@/utils/genderHelpers';

export default async function ShopNewArrival({ searchParams }) {
    const { gender, category } = await searchParams;

    if (gender && !category) {
        const [products, headerTitle] = await Promise.all([
            getProducts(),
            getMenuTitleByPath('/new-arrival', 'New Arrivals'),
        ]);

        const normalizedTarget = normalizeGender(gender);

        const newArrivals = products.filter(
            p => p.status === 'New' && normalizeGender(p.category) === normalizedTarget
        );

        const typeMap = new Map();
        for (const product of newArrivals) {
            const type = product.productType || 'Other';
            if (!typeMap.has(type)) typeMap.set(type, []);
            typeMap.get(type).push(product);
        }

        const groups = Array.from(typeMap.entries()).map(([type, products]) => ({ type, products }));

        return (
            <GenderNewArrivalsClient
                gender={gender}
                groups={groups}
                headerTitle={headerTitle}
            />
        );
    }

    return (
        <div>
            <Suspense fallback={<MingleLoader fullScreen={false} />}>
                <ShopNewWithSidebar />
            </Suspense>
        </div>
    );
}
