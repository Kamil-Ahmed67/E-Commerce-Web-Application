import GenderLandingPage from '@/components/GenderPage/GenderLandingPage';
import { getProducts } from '@/lib/server/shopData';
import { getAllBanners } from '@/lib/server/bannerData';
import { isMenCategory } from '@/utils/genderHelpers';
import { sortByCategoryOrder, normalizeCategoryName } from '@/utils/categoryOrder';
import { getCategoryOrder } from '@/lib/server/categoryOrderData';

export const metadata = {
    title: "Men's Fashion — Mingle In Style",
    description: "Shop the latest men's clothing at Mingle In Style. Browse Panjabi, Shirts, Polo, Trousers and more.",
};

export const revalidate = 300;

export default async function MenPage() {
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

    const heroBanner = bannerMap['men banner'];
    const heroImage = heroBanner?.image || '/images/about/MVP J09 (26).png';
    const heroDescription = heroBanner?.description || '';

    const menProducts = products.filter(p => isMenCategory(p.category));

    // Dedupe product types that only differ by case/punctuation (e.g. "T-Shirt" vs "T-shirt")
    // so they don't render as separate category cards.
    const typesByKey = new Map();
    menProducts.forEach(p => {
        if (!p.productType) return;
        const key = normalizeCategoryName(p.productType);
        if (!typesByKey.has(key)) typesByKey.set(key, p.productType);
    });
    const productTypes = sortByCategoryOrder([...typesByKey.values()], categoryOrder.men);

    const categories = productTypes.map(type => {
        const key = normalizeCategoryName(type);
        const categoryKey = `men ${type}`.toLowerCase();
        return {
            name: type,
            path: `/men/${encodeURIComponent(type)}`,
            image: bannerMap[categoryKey]?.image
                || `/images/categories/men/${type.toLowerCase().replace(/\s+/g, '-')}.jpg`,
            count: menProducts.filter(p => normalizeCategoryName(p.productType) === key).length,
        };
    });

    return (
        <GenderLandingPage
            gender="Men"
            categories={categories}
            heroImage={heroImage}
            heroDescription={heroDescription}
        />
    );
}
