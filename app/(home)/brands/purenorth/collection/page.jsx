import { getMetaByPath } from '@/lib/server/getMetaByPath';
import { Suspense } from 'react';
import BrandCollectionTemplate from '@/components/BrandPage/BrandCollectionTemplate';
import ShopWithSidebar from '@/components/ShopWithSidebar';
import { BRAND_CONFIGS } from '@/lib/brandConfig';
import { getBrandByName } from '@/lib/server/brandData';
import { getBannersByAccessKey } from '@/lib/server/bannerData';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/purenorth/collection');
    return {
        title: meta.title || 'Shop PureNorth | Active Wear Collection — Mingle In Style',
        description: meta.description || 'Explore the PureNorth active wear collection. Shop Women and Men performance styles engineered to move further.',
    };
}

export const revalidate = 300;

export default async function PureNorthCollectionPage({ searchParams }) {
    const params = await searchParams;
    const category = params?.category;
    const gender = params?.gender;

    if (category || gender) {
        return (
            <Suspense fallback={<div className="text-center py-20">Loading products...</div>}>
                <ShopWithSidebar
                    defaultBrand="PURE NORTH"
                    defaultCategory={category || null}
                    defaultGender={gender || null}
                    hideSidebar={true}
                />
            </Suspense>
        );
    }

    const [dbBrand, menBanners, womenBanners, unisexBanners, newArrivalsBanners, collectionBanners] = await Promise.all([
        getBrandByName('PureNorth').catch(() => null),
        getBannersByAccessKey('PureNorth Men Tile').catch(() => []),
        getBannersByAccessKey('PureNorth Women Tile').catch(() => []),
        getBannersByAccessKey('PureNorth Unisex Tile').catch(() => []),
        getBannersByAccessKey('PureNorth New Arrivals Tile').catch(() => []),
        getBannersByAccessKey('PureNorth Collection Banner').catch(() => []),
    ]);
    const isBrandActive = dbBrand && (dbBrand.isActive === true || dbBrand.isActive === 1 || dbBrand.isActive === '1');
    const findActive = (list) => isBrandActive ? list.find(b => b.isActive && b.bannerImage?.[0]) : null;
    const menBanner = findActive(menBanners);
    const womenBanner = findActive(womenBanners);
    const unisexBanner = findActive(unisexBanners);
    const newArrivalsBanner = findActive(newArrivalsBanners);
    const collectionBanner = findActive(collectionBanners);
    return (
        <BrandCollectionTemplate
            brand={BRAND_CONFIGS.purenorth}
            womenHref="/brands/purenorth/women"
            menHref="/brands/purenorth/men"
            unisexHref="/brands/purenorth/unisex"
            newArrivalsHref="/brands/purenorth/new-arrivals"
            menImage={menBanner?.bannerImage?.[0] || "/images/about/MVP J09 (13).png"}
            womenImage={womenBanner?.bannerImage?.[0] || "/images/about/WMSKDI08 (1).png"}
            unisexImage={unisexBanner?.bannerImage?.[0] || "/images/about/WMSKDI08 (1).png"}
            newArrivalsImage={newArrivalsBanner?.bannerImage?.[0] || "/images/about/WMSKDI08 (1).png"}
            menAlt={menBanner?.title || null}
            womenAlt={womenBanner?.title || null}
            unisexAlt={unisexBanner?.title || null}
            newArrivalsAlt={newArrivalsBanner?.title || null}
            bannerImage={collectionBanner?.bannerImage?.[0] || null}
            bannerAlt={collectionBanner?.title || null}
            bannerDescription={collectionBanner?.description || null}
        />
    );
}
