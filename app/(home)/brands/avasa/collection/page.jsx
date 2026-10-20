import { getMetaByPath } from '@/lib/server/getMetaByPath';
import { Suspense } from 'react';
import BrandCollectionTemplate from '@/components/BrandPage/BrandCollectionTemplate';
import ShopWithSidebar from '@/components/ShopWithSidebar';
import { BRAND_CONFIGS } from '@/lib/brandConfig';
import { getBrandByName } from '@/lib/server/brandData';
import { getBannersByAccessKey } from '@/lib/server/bannerData';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/avasa/collection');
    return {
        title: meta.title || 'Shop Avasaa | Comfort Wear Collection — Mingle In Style',
        description: meta.description || 'Explore the Avasaa comfort wear collection. Shop Women and Men styles crafted for softness and everyday elegance.',
    };
}

export const revalidate = 300;

export default async function AvasaaCollectionPage({ searchParams }) {
    const params = await searchParams;
    const category = params?.category;
    const gender = params?.gender;

    if (category || gender) {
        return (
            <Suspense fallback={<div className="text-center py-20">Loading products...</div>}>
                <ShopWithSidebar
                    defaultBrand="AVASAA"
                    defaultCategory={category || null}
                    defaultGender={gender || null}
                    hideSidebar={true}
                />
            </Suspense>
        );
    }

    const [dbBrand, menBanners, womenBanners, newArrivalsBanners, collectionBanners] = await Promise.all([
        getBrandByName('Avasaa').catch(() => null),
        getBannersByAccessKey('Avasaa Men Tile').catch(() => []),
        getBannersByAccessKey('Avasaa Women Tile').catch(() => []),
        getBannersByAccessKey('Avasaa New Arrivals Tile').catch(() => []),
        getBannersByAccessKey('Avasaa Collection Banner').catch(() => []),
    ]);
    const isBrandActive = dbBrand && (dbBrand.isActive === true || dbBrand.isActive === 1 || dbBrand.isActive === '1');
    const findActive = (list) => isBrandActive ? list.find(b => b.isActive && b.bannerImage?.[0]) : null;
    const menBanner = findActive(menBanners);
    const womenBanner = findActive(womenBanners);
    const newArrivalsBanner = findActive(newArrivalsBanners);
    const collectionBanner = findActive(collectionBanners);
    return (
        <BrandCollectionTemplate
            brand={BRAND_CONFIGS.avasaa}
            womenHref="/brands/avasa/women"
            menHref="/brands/avasa/men"
            newArrivalsHref="/brands/avasa/new-arrivals"
            menImage={menBanner?.bannerImage?.[0] || "/images/about/MVP J09 (5).png"}
            womenImage={womenBanner?.bannerImage?.[0] || "/images/about/WMSKDI23 (3).png"}
            newArrivalsImage={newArrivalsBanner?.bannerImage?.[0] || "/images/about/WMSKDI23 (3).png"}
            menAlt={menBanner?.title || null}
            womenAlt={womenBanner?.title || null}
            newArrivalsAlt={newArrivalsBanner?.title || null}
            bannerImage={collectionBanner?.bannerImage?.[0] || null}
            bannerAlt={collectionBanner?.title || null}
            bannerDescription={collectionBanner?.description || null}
        />
    );
}
