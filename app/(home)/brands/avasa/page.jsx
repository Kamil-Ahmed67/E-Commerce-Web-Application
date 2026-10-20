import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandPageTemplate from '@/components/BrandPage/BrandPageTemplate';
import { BRAND_CONFIGS } from '@/lib/brandConfig';
import { getBanners, getBannersByAccessKey } from '@/lib/server/bannerData';
import { getBrandProducts } from '@/lib/server/brandProducts';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/avasa');
    return {
        title: meta.title || 'Avasaa | Feel Comfortable — Mingle In Style',
        description: meta.description || 'Discover Avasaa — comfort wear designed around you. Soft, breathable, effortlessly wearable. Explore the Avasaa collection at Mingle In Style.',
    };
}
export default async function AvasaaBrandPage() {
    const [banners, storyBanners, products] = await Promise.all([
        getBanners('Avasaa'),
        getBannersByAccessKey('Avasaa Story'),
        getBrandProducts(BRAND_CONFIGS.avasaa.dbBrand),
    ]);
    const storyImageUrl = storyBanners.find(b => b.isActive)?.bannerImage?.[0] || null;
    return <BrandPageTemplate brand={BRAND_CONFIGS.avasaa} banners={banners} storyImageUrl={storyImageUrl} products={products} />;
}