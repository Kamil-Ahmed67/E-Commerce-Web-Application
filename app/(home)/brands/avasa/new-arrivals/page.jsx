import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandNewArrivalsPage from '@/components/BrandPage/BrandNewArrivalsPage';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/avasa/new-arrivals');
    return {
        title: meta.title || 'Avasaa New Arrivals | Fresh Comfort Wear — Mingle In Style',
        description: meta.description || 'Discover the latest new arrivals from Avasaa. Fresh comfort wear styles added just for you.',
    };
}

export default function AvasaaNewArrivalsPage() {
    return (
        <BrandNewArrivalsPage
            brandKey="AVASAA"
            brandDisplayName="Avasaa"
            accentColor={BRAND_CONFIGS.avasaa.accentColor}
            brandSlug="avasa"
        />
    );
}
