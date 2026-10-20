import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandPageTemplate from '@/components/BrandPage/BrandPageTemplate';
import { BRAND_CONFIGS } from '@/lib/brandConfig';
import { getBanners, getBannersByAccessKey } from '@/lib/server/bannerData';
import { getBrandProducts } from '@/lib/server/brandProducts';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/vidjar');
    return {
        title: meta.title || 'Vidjar | Wear the Dare — Mingle In Style',
        description: meta.description || 'Discover Vidjar — bold, premium fashion for those who refuse to blend in. Explore the full Vidjar collection at Mingle In Style.',
    };
}

export default async function VidjarBrandPage() {
    const [banners, storyBanners, products] = await Promise.all([
        getBanners('Vidjar'),
        getBannersByAccessKey('Vidjar Story'),
        getBrandProducts(BRAND_CONFIGS.vidjar.dbBrand),
    ]);
    const storyImageUrl = storyBanners.find(b => b.isActive)?.bannerImage?.[0] || null;
    return <BrandPageTemplate brand={BRAND_CONFIGS.vidjar} banners={banners} storyImageUrl={storyImageUrl} products={products} />;
}