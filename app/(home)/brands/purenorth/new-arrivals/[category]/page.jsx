import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandNewArrivalsCategoryPage from '@/components/BrandPage/BrandNewArrivalsCategoryPage';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export async function generateMetadata({ params }) {
    const { category } = await params;
    const label = decodeURIComponent(category);
    const meta = await getMetaByPath(`/brands/purenorth/new-arrivals/${category}`);
    return {
        title: meta.title || `PureNorth ${label} New Arrivals — Mingle In Style`,
        description: meta.description || `Shop PureNorth's new ${label} arrivals.`,
    };
}

export default async function PureNorthNewArrivalsCategoryPage({ params }) {
    const { category } = await params;
    return (
        <BrandNewArrivalsCategoryPage
            brandKey="PURE NORTH"
            brandDisplayName="PureNorth"
            accentColor={BRAND_CONFIGS.purenorth.accentColor}
            category={decodeURIComponent(category)}
            backHref="/brands/purenorth/new-arrivals"
        />
    );
}
