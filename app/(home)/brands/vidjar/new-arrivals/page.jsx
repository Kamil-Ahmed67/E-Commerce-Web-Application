import { getMetaByPath } from '@/lib/server/getMetaByPath';
import BrandNewArrivalsPage from '@/components/BrandPage/BrandNewArrivalsPage';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export async function generateMetadata() {
    const meta = await getMetaByPath('/brands/vidjar/new-arrivals');
    return {
        title: meta.title || 'Vidjar New Arrivals | Fresh Classic Wear — Mingle In Style',
        description: meta.description || 'Discover the latest new arrivals from Vidjar. Fresh classic wear styles that define timeless modern fashion.',
    };
}

export default function VidjarNewArrivalsPage() {
    return (
        <BrandNewArrivalsPage
            brandKey="VIDJAR"
            brandDisplayName="Vidjar"
            accentColor={BRAND_CONFIGS.vidjar.accentColor}
            brandSlug="vidjar"
        />
    );
}
