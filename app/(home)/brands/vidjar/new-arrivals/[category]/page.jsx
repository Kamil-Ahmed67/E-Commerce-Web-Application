import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandNewArrivalsCategoryPage from '@/components/BrandPage/BrandNewArrivalsCategoryPage';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export async function generateMetadata({ params }) {
    const { category } = await params;
    const label = decodeURIComponent(category);
    const meta = await getMetaByPath(`/brands/vidjar/new-arrivals/${category}`);
    return {
        title: meta.title || `Vidjar ${label} New Arrivals — Mingle In Style`,
        description: meta.description || `Shop Vidjar's new ${label} arrivals.`,
    };
}

export default async function VidjarNewArrivalsCategoryPage({ params }) {
    const { category } = await params;
    return (
        <BrandNewArrivalsCategoryPage
            brandKey="VIDJAR"
            brandDisplayName="Vidjar"
            accentColor={BRAND_CONFIGS.vidjar.accentColor}
            category={decodeURIComponent(category)}
            backHref="/brands/vidjar/new-arrivals"
        />
    );
}
