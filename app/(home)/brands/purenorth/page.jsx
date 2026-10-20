import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandPageTemplate from '@/components/BrandPage/BrandPageTemplate';
import { BRAND_CONFIGS } from '@/lib/brandConfig';
import { getBanners, getBannersByAccessKey } from '@/lib/server/bannerData';
import { getBrandProducts } from '@/lib/server/brandProducts';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/purenorth');
    return {
        title: meta.title || 'PureNorth | Crafted by Nature — Mingle In Style',
        description: meta.description || 'Discover PureNorth — rugged, sustainable fashion inspired by the natural world. Explore the full PureNorth collection at Mingle In Style.',
    };
}

export default async function PureNorthBrandPage() {
    const [banners, storyBanners, products] = await Promise.all([
        getBanners('PureNorth'),
        getBannersByAccessKey('PureNorth Story'),
        getBrandProducts(BRAND_CONFIGS.purenorth.dbBrand),
    ]);
    const storyImageUrl = storyBanners.find(b => b.isActive)?.bannerImage?.[0] || null;
    return <BrandPageTemplate brand={BRAND_CONFIGS.purenorth} banners={banners} storyImageUrl={storyImageUrl} products={products} />;
}
