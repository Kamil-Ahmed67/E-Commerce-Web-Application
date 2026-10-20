import { getMetaByPath } from '@/lib/server/getMetaByPath';
import { Suspense } from 'react';
import BrandCollectionTemplate from '@/components/BrandPage/BrandCollectionTemplate';
import ShopWithSidebar from '@/components/ShopWithSidebar';
import { BRAND_CONFIGS } from '@/lib/brandConfig';
import { getBrandByName } from '@/lib/server/brandData';
import { getBannersByAccessKey } from '@/lib/server/bannerData';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/vidjar/collection');
    return {
        title: meta.title || 'Shop Vidjar | Classic Wear Collection — Mingle In Style',
        description: meta.description || 'Explore the Vidjar classic wear collection. Shop Women and Men styles that define timeless modern fashion.',
    };
}

export const revalidate = 300;

export default async function VidjarCollectionPage({ searchParams }) {
    const params = await searchParams;
    const category = params?.category;
    const gender = params?.gender;

    if (category || gender) {
        return (
            <Suspense fallback={<div className="text-center py-20">Loading products...</div>}>
                <ShopWithSidebar
                    defaultBrand="VIDJAR"
                    defaultCategory={category || null}
                    defaultGender={gender || null}
                    hideSidebar={true}
                />
            </Suspense>
        );
    }

    const [dbBrand, menBanners, womenBanners, newArrivalsBanners, collectionBanners] = await Promise.all([
        getBrandByName('VIDJAR').catch(() => null),
        getBannersByAccessKey('Vidjar Men Tile').catch(() => []),
        getBannersByAccessKey('Vidjar Women Tile').catch(() => []),
        getBannersByAccessKey('Vidjar New Arrivals Tile').catch(() => []),
        getBannersByAccessKey('Vidjar Collection Banner').catch(() => []),
    ]);
    const isBrandActive = dbBrand && (dbBrand.isActive === true || dbBrand.isActive === 1 || dbBrand.isActive === '1');
    const findActive = (list) => isBrandActive ? list.find(b => b.isActive && b.bannerImage?.[0]) : null;
    const menBanner = findActive(menBanners);
    const womenBanner = findActive(womenBanners);
    const newArrivalsBanner = findActive(newArrivalsBanners);
    const collectionBanner = findActive(collectionBanners);
    return (
        <BrandCollectionTemplate
            brand={BRAND_CONFIGS.vidjar}
            womenHref="/brands/vidjar/women"
            menHref="/brands/vidjar/men"
            newArrivalsHref="/brands/vidjar/new-arrivals"
            menImage={menBanner?.bannerImage?.[0] || "/images/about/MVJ07 (2).png"}
            womenImage={womenBanner?.bannerImage?.[0] || "/images/about/WMSKDI07 (2).png"}
            newArrivalsImage={newArrivalsBanner?.bannerImage?.[0] || "/images/about/WMSKDI07 (2).png"}
            menAlt={menBanner?.title || null}
            womenAlt={womenBanner?.title || null}
            newArrivalsAlt={newArrivalsBanner?.title || null}
            bannerImage={collectionBanner?.bannerImage?.[0] || null}
            bannerAlt={collectionBanner?.title || null}
            bannerDescription={collectionBanner?.description || null}
        />
    );
}
