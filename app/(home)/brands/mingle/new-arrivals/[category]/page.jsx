import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandNewArrivalsCategoryPage from '@/components/BrandPage/BrandNewArrivalsCategoryPage';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export async function generateMetadata({ params }) {
    const { category } = await params;
    const label = decodeURIComponent(category);
    const meta = await getMetaByPath(`/brands/mingle/new-arrivals/${category}`);
    return {
        title: meta.title || `Mingle ${label} New Arrivals — Mingle In Style`,
        description: meta.description || `Shop Mingle's new ${label} arrivals.`,
    };
}

export default async function MingleNewArrivalsCategoryPage({ params }) {
    const { category } = await params;
    return (
        <BrandNewArrivalsCategoryPage
            brandKey="MINGLE"
            brandDisplayName="Mingle"
            accentColor={BRAND_CONFIGS.mingle.accentColor}
            category={decodeURIComponent(category)}
            backHref="/brands/mingle/new-arrivals"
        />
    );
}
