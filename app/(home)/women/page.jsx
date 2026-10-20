import GenderLandingPage from '@/components/GenderPage/GenderLandingPage';
import { getProducts } from '@/lib/server/shopData';
import { getAllBanners } from '@/lib/server/bannerData';
import { isWomenCategory } from '@/utils/genderHelpers';
import { sortByCategoryOrder, normalizeCategoryName } from '@/utils/categoryOrder';
import { getCategoryOrder } from '@/lib/server/categoryOrderData';

export const metadata = {
    title: "Women's Fashion — Mingle In Style",
    description: "Shop the latest women's clothing at Mingle In Style. Browse Suits, Tops, Kurtis, Jeans and more.",
};

export const revalidate = 300;

export default async function WomenPage() {
    const [products, allBanners, categoryOrder] = await Promise.all([
        getProducts(),
        getAllBanners(),
        getCategoryOrder(),
    ]);

    const bannerMap = {};
    allBanners.filter(b => b.isActive && b.bannerImage?.[0]).forEach(b => {
        const key = b.accessKey.toLowerCase();
        if (!bannerMap[key]) bannerMap[key] = { image: b.bannerImage[0], description: b.description || '' };
    });

    const heroBanner = bannerMap['women banner'];
    const heroImage = heroBanner?.image || '/images/about/WMSKDN03 (2).png';
    const heroDescription = heroBanner?.description || '';

    const womenProducts = products.filter(p => isWomenCategory(p.category));

    // Dedupe product types that only differ by case/punctuation (e.g. "T-Shirt" vs "T-shirt")
    // so they don't render as separate category cards.
    const typesByKey = new Map();
    womenProducts.forEach(p => {
        if (!p.productType) return;
        const key = normalizeCategoryName(p.productType);
        if (!typesByKey.has(key)) typesByKey.set(key, p.productType);
    });
    const productTypes = sortByCategoryOrder([...typesByKey.values()], categoryOrder.women);

    const categories = productTypes.map(type => {
        const key = normalizeCategoryName(type);
        const categoryKey = `women ${type}`.toLowerCase();
        return {
            name: type,
            path: `/women/${encodeURIComponent(type)}`,
            image: bannerMap[categoryKey]?.image
                || `/images/categories/women/${type.toLowerCase().replace(/\s+/g, '-')}.jpg`,
            count: womenProducts.filter(p => normalizeCategoryName(p.productType) === key).length,
        };
    });

    return (
        <GenderLandingPage
            gender="Women"
            categories={categories}
            heroImage={heroImage}
            heroDescription={heroDescription}
        />
    );
}
