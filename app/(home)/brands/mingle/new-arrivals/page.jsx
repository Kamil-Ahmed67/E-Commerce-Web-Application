import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandNewArrivalsPage from '@/components/BrandPage/BrandNewArrivalsPage';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/mingle/new-arrivals');
    return {
        title: meta.title || 'Mingle New Arrivals | Fresh Ethnic Wear — Mingle In Style',
        description: meta.description || 'Discover the latest new arrivals from Mingle. Fresh ethnic wear styles crafted for tradition and elegance.',
    };
}

export default function MingleNewArrivalsPage() {
    return (
        <BrandNewArrivalsPage
            brandKey="MINGLE"
            brandDisplayName="Mingle"
            accentColor={BRAND_CONFIGS.mingle.accentColor}
            brandSlug="mingle"
        />
    );
}
