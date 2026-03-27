import BrandPageTemplate from '@/components/BrandPage/BrandPageTemplate';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export const metadata = {
    title: 'Vidjar | Wear the Dare — Mingle Fashion',
    description: 'Discover Vidjar — bold, premium fashion for those who refuse to blend in. Explore the full Vidjar collection at Mingle Fashion.',
};

export default function VidjarBrandPage() {
    return <BrandPageTemplate brand={BRAND_CONFIGS.vidjar} />;
}
