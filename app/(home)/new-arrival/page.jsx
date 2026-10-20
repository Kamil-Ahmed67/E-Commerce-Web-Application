import NewArrivalPage from '@/components/NewArrival/NewArrivalPage';
import { getBannersByAccessKey } from '@/lib/server/bannerData';

export const metadata = {
    title: 'New Arrivals — Mingle In Style',
    description: 'Discover the latest arrivals at Mingle In Style. Shop new styles for Women, Men, and all our top brands.',
};

export default async function NewArrivalRoute() {
    const [
        heroBanners,
        womenBanners,
        menBanners,
        mingleBanners,
        vidjarBanners,
        pureNorthBanners,
        avasaaBanners,
    ] = await Promise.allSettled([
        getBannersByAccessKey('New Arrivals Banner'),
        getBannersByAccessKey('New Arrivals Women'),
        getBannersByAccessKey('New Arrivals Men'),
        getBannersByAccessKey('New Arrivals Mingle'),
        getBannersByAccessKey('New Arrivals Vidjar'),
        getBannersByAccessKey('New Arrivals Pure North'),
        getBannersByAccessKey('New Arrivals Avasaa'),
    ]);

    const first = (result) =>
        result.status === 'fulfilled' && result.value?.length > 0
            ? result.value[0].bannerImage?.[0] || null
            : null;

    const bannerImages = {
        hero:      first(heroBanners),
        women:     first(womenBanners),
        men:       first(menBanners),
        mingle:    first(mingleBanners),
        vidjar:    first(vidjarBanners),
        pureNorth: first(pureNorthBanners),
        avasaa:    first(avasaaBanners),
    };

    return <NewArrivalPage bannerImages={bannerImages} />;
}
