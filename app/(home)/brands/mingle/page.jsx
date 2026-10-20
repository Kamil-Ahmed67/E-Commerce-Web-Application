import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandPageTemplate from '@/components/BrandPage/BrandPageTemplate';
import { BRAND_CONFIGS } from '@/lib/brandConfig';
import { getBanners, getBannersByAccessKey } from '@/lib/server/bannerData';
import { getBrandProducts } from '@/lib/server/brandProducts';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/mingle');
    return {
        title: meta.title || 'Mingle | Where Style Meets Soul — Mingle In Style',
        description: meta.description || 'Discover the Mingle brand — vibrant, inclusive fashion where style meets soul. Explore the full Mingle collection.',
    };
}
export default async function MingleBrandPage() {
    const [banners, storyBanners, products] = await Promise.all([
        getBanners('Mingle'),
        getBannersByAccessKey('Mingle Story'),
        getBrandProducts(BRAND_CONFIGS.mingle.dbBrand),
    ]);
    const storyImageUrl = storyBanners.find(b => b.isActive)?.bannerImage?.[0] || null;
    return <BrandPageTemplate brand={BRAND_CONFIGS.mingle} banners={banners} storyImageUrl={storyImageUrl} products={products} />;
}