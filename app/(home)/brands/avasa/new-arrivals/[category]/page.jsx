import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandNewArrivalsCategoryPage from '@/components/BrandPage/BrandNewArrivalsCategoryPage';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export async function generateMetadata({ params }) {
    const { category } = await params;
    const label = decodeURIComponent(category);
    const meta = await getMetaByPath(`/brands/avasa/new-arrivals/${category}`);
    return {
        title: meta.title || `Avasaa ${label} New Arrivals — Mingle In Style`,
        description: meta.description || `Shop Avasaa's new ${label} arrivals.`,
    };
}

export default async function AvasaaNewArrivalsCategoryPage({ params }) {
    const { category } = await params;
    return (
        <BrandNewArrivalsCategoryPage
            brandKey="AVASAA"
            brandDisplayName="Avasaa"
            accentColor={BRAND_CONFIGS.avasaa.accentColor}
            category={decodeURIComponent(category)}
            backHref="/brands/avasa/new-arrivals"
        />
    );
}
