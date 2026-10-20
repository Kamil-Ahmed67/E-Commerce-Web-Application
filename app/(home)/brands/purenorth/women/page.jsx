import { getMetaByPath } from '@/lib/server/getMetaByPath';
import GenderLandingPage from '@/components/GenderPage/GenderLandingPage';
import { getProducts } from '@/lib/server/shopData';
import { getAllBanners } from '@/lib/server/bannerData';
import { isWomenCategory } from '@/utils/genderHelpers';
import { sortByCategoryOrder } from '@/utils/categoryOrder';
import { getCategoryOrder } from '@/lib/server/categoryOrderData';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/purenorth/women');
    return {
        title: meta.title || 'PureNorth Women | Active Wear for Women — Mingle In Style',
        description: meta.description || 'Shop PureNorth active wear for women. Performance Tanks, Leggings, T-Shirts, Trousers and Shorts.',
    };
}

export const revalidate = 300;

export default async function PureNorthWomenPage() {
    const BRAND = 'PURE NORTH';
    const BRAND_KEY = 'PureNorth';
    const HERO_FALLBACK = '/images/pure north_under.jpeg';

    const [products, allBanners, brandOrder, mainOrder] = await Promise.all([
        getProducts(), getAllBanners(), getCategoryOrder(BRAND_KEY), getCategoryOrder(),
    ]);

    const bannerMap = {};
    allBanners.filter(b => b.isActive && b.bannerImage?.[0]).forEach(b => {
        const key = b.accessKey.toLowerCase();
        if (!bannerMap[key]) bannerMap[key] = { image: b.bannerImage[0], description: b.description || '' };
    });

    const heroBanner = bannerMap[`${BRAND_KEY.toLowerCase()} women banner`];
    const heroImage = heroBanner?.image || HERO_FALLBACK;
    const heroDescription = heroBanner?.description || '';

    const brandProducts = products.filter(p => p.brand === BRAND && isWomenCategory(p.category));
    const productTypes = sortByCategoryOrder(
        [...new Set(brandProducts.map(p => p.productType).filter(Boolean))],
        brandOrder.women, x => x, mainOrder.women
    );

    const categories = productTypes.map(type => {
        const categoryKey = `${BRAND_KEY} women ${type}`.toLowerCase();
        return {
            name: type,
            path: `/brands/purenorth/collection?category=${encodeURIComponent(type)}&gender=Women`,
            image: bannerMap[categoryKey]?.image
                || `/images/categories/women/${type.toLowerCase().replace(/\s+/g, '-')}.jpg`,
            count: brandProducts.filter(p => p.productType === type).length,
        };
    });

    return <GenderLandingPage gender="Women" categories={categories} heroImage={heroImage} heroDescription={heroDescription} />;
}
