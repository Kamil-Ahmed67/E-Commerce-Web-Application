import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandNewArrivalsClient from '@/components/BrandPage/BrandNewArrivalsClient';
import { getProducts } from '@/lib/server/shopData';
import { isUnisexCategory } from '@/utils/genderHelpers';
import { sortByCategoryOrder } from '@/utils/categoryOrder';
import { getCategoryOrder } from '@/lib/server/categoryOrderData';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/purenorth/unisex');
    return {
        title: meta.title || 'PureNorth Unisex | Active Wear — Mingle In Style',
        description: meta.description || 'Shop PureNorth unisex active wear.',
    };
}

export const revalidate = 300;

export default async function PureNorthUnisexPage() {
    const BRAND = 'PURE NORTH';
    const BRAND_KEY = 'PureNorth';
    const brand = BRAND_CONFIGS.purenorth;

    const [products, brandOrder, mainOrder] = await Promise.all([
        getProducts(), getCategoryOrder(BRAND_KEY), getCategoryOrder(),
    ]);

    const unisexProducts = products.filter(p => p.brand === BRAND && isUnisexCategory(p.category));
    const productTypes = sortByCategoryOrder(
        [...new Set(unisexProducts.map(p => p.productType).filter(Boolean))],
        brandOrder.unisex, x => x, mainOrder.unisex
    );

    const groups = productTypes.map(type => ({
        type,
        products: unisexProducts.filter(p => p.productType === type),
    }));

    return (
        <BrandNewArrivalsClient
            brandDisplayName={brand.name}
            accentColor={brand.accentColor}
            groups={groups}
            headerTitle="Unisex"
            headerSubtitle="Styles made for everyone"
            emptyMessage="No unisex products yet"
            brandSlug={brand.slug}
            viewAllBasePath="/brands/purenorth/collection"
            viewAllGender="Unisex"
        />
    );
}
