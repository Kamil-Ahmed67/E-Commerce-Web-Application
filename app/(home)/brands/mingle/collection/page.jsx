import { getMetaByPath } from '@/lib/server/getMetaByPath';
import { Suspense } from 'react';
import BrandCollectionTemplate from '@/components/BrandPage/BrandCollectionTemplate';
import ShopWithSidebar from '@/components/ShopWithSidebar';
import { BRAND_CONFIGS } from '@/lib/brandConfig';
import { getBrandByName } from '@/lib/server/brandData';
import { getBannersByAccessKey } from '@/lib/server/bannerData';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/mingle/collection');
    return {
        title: meta.title || 'Shop Mingle | Ethnic Wear Collection — Mingle In Style',
        description: meta.description || 'Explore the Mingle ethnic wear collection. Shop Women and Men styles that celebrate tradition with modern elegance.',
    };
}

export const revalidate = 300;

export default async function MingleCollectionPage({ searchParams }) {
    const params = await searchParams;
    const category = params?.category;
    const gender = params?.gender;

    if (category || gender) {
        return (
            <Suspense fallback={<div className="text-center py-20">Loading products...</div>}>
                <ShopWithSidebar
                    defaultBrand="MINGLE"
                    defaultCategory={category || null}
                    defaultGender={gender || null}
                    hideSidebar={true}
                />
            </Suspense>
        );
    }

    const [dbBrand, menBanners, womenBanners, newArrivalsBanners, collectionBanners] = await Promise.all([
        getBrandByName('Mingle').catch(() => null),
        getBannersByAccessKey('Mingle Men Tile').catch(() => []),
        getBannersByAccessKey('Mingle Women Tile').catch(() => []),
        getBannersByAccessKey('Mingle New Arrivals Tile').catch(() => []),
        getBannersByAccessKey('Mingle Collection Banner').catch(() => []),
    ]);
    const isBrandActive = dbBrand && (dbBrand.isActive === true || dbBrand.isActive === 1 || dbBrand.isActive === '1');
    const findActive = (list) => isBrandActive ? list.find(b => b.isActive && b.bannerImage?.[0]) : null;
    const menBanner = findActive(menBanners);
    const womenBanner = findActive(womenBanners);
    const newArrivalsBanner = findActive(newArrivalsBanners);
    const collectionBanner = findActive(collectionBanners);
    return (
        <BrandCollectionTemplate
            brand={BRAND_CONFIGS.mingle}
            womenHref="/brands/mingle/women"
            menHref="/brands/mingle/men"
            newArrivalsHref="/brands/mingle/new-arrivals"
            menImage={menBanner?.bannerImage?.[0] || "/images/about/MMPJ03A (2).png"}
            womenImage={womenBanner?.bannerImage?.[0] || "/images/about/WMSKDI23 (1).png"}
            newArrivalsImage={newArrivalsBanner?.bannerImage?.[0] || "/images/about/WMSKDI23 (1).png"}
            menAlt={menBanner?.title || null}
            womenAlt={womenBanner?.title || null}
            newArrivalsAlt={newArrivalsBanner?.title || null}
            bannerImage={collectionBanner?.bannerImage?.[0] || null}
            bannerAlt={collectionBanner?.title || null}
            bannerDescription={collectionBanner?.description || null}
        />
    );
}
