import { getMetaByPath } from '@/lib/server/getMetaByPath';
import GenderLandingPage from '@/components/GenderPage/GenderLandingPage';
import { getProducts } from '@/lib/server/shopData';
import { getAllBanners } from '@/lib/server/bannerData';
import { isMenCategory } from '@/utils/genderHelpers';
import { sortByCategoryOrder } from '@/utils/categoryOrder';
import { getCategoryOrder } from '@/lib/server/categoryOrderData';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/purenorth/men');
    return {
        title: meta.title || 'PureNorth Men | Active Wear for Men — Mingle In Style',
        description: meta.description || 'Shop PureNorth active wear for men. Performance T-Shirts, Polo Shirts, Trousers and Shorts.',
    };
}

export const revalidate = 300;

export default async function PureNorthMenPage() {
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

    const heroBanner = bannerMap[`${BRAND_KEY.toLowerCase()} men banner`];
    const heroImage = heroBanner?.image || HERO_FALLBACK;
    const heroDescription = heroBanner?.description || '';

    const brandProducts = products.filter(p => p.brand === BRAND && isMenCategory(p.category));
    const productTypes = sortByCategoryOrder(
        [...new Set(brandProducts.map(p => p.productType).filter(Boolean))],
        brandOrder.men, x => x, mainOrder.men
    );

    const categories = productTypes.map(type => {
        const categoryKey = `${BRAND_KEY} men ${type}`.toLowerCase();
        return {
            name: type,
            path: `/brands/purenorth/collection?category=${encodeURIComponent(type)}&gender=Men`,
            image: bannerMap[categoryKey]?.image
                || `/images/categories/men/${type.toLowerCase().replace(/\s+/g, '-')}.jpg`,
            count: brandProducts.filter(p => p.productType === type).length,
        };
    });

    return <GenderLandingPage gender="Men" categories={categories} heroImage={heroImage} heroDescription={heroDescription} />;
}
