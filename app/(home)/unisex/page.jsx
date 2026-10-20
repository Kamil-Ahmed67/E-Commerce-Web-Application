import { getMetaByPath } from '@/lib/server/getMetaByPath';
import { getProducts } from '@/lib/server/shopData';
import { getMenuTitleByPath } from '@/lib/server/getMenuTitle';
import { isUnisexCategory } from '@/utils/genderHelpers';
import { BRAND_CONFIGS } from '@/lib/brandConfig';
import UnisexPageClient from '@/components/UnisexPage/UnisexPageClient';

export async function generateMetadata() {
    const meta = await getMetaByPath('/unisex');
    return {
        title: meta.title || 'Unisex | Mingle In Style',
        description: meta.description || 'Shop unisex styles across all our brands — Mingle, Vidjar, Pure North and Avasaa.',
    };
}

export const revalidate = 300;

const BRAND_ROWS = [
    { dbBrand: 'MINGLE', slug: 'mingle', key: 'mingle' },
    { dbBrand: 'VIDJAR', slug: 'vidjar', key: 'vidjar' },
    { dbBrand: 'PURE NORTH', slug: 'purenorth', key: 'purenorth' },
    { dbBrand: 'AVASAA', slug: 'avasa', key: 'avasaa' },
];

export default async function UnisexPage() {
    const [products, headerTitle] = await Promise.all([
        getProducts(),
        getMenuTitleByPath('/unisex', 'Unisex'),
    ]);

    const unisexProducts = products.filter(p => isUnisexCategory(p.category));

    const groups = BRAND_ROWS.map(({ dbBrand, slug, key }) => {
        const brandConfig = BRAND_CONFIGS[key];
        return {
            brandKey: key,
            brandDisplayName: brandConfig?.name || dbBrand,
            accentColor: brandConfig?.accentColor || '#32BBAB',
            slug,
            products: unisexProducts.filter(p => p.brand === dbBrand),
        };
    }).filter(g => g.products.length > 0);

    return <UnisexPageClient groups={groups} headerTitle={headerTitle} />;
}
