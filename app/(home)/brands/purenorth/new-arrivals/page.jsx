import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandNewArrivalsPage from '@/components/BrandPage/BrandNewArrivalsPage';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/purenorth/new-arrivals');
    return {
        title: meta.title || 'PureNorth New Arrivals | Fresh Active Wear — Mingle In Style',
        description: meta.description || 'Discover the latest new arrivals from PureNorth. Fresh active wear performance styles engineered to move.',
    };
}

export default function PureNorthNewArrivalsPage() {
    return (
        <BrandNewArrivalsPage
            brandKey="PURE NORTH"
            brandDisplayName="PureNorth"
            accentColor={BRAND_CONFIGS.purenorth.accentColor}
            brandSlug="purenorth"
        />
    );
}
