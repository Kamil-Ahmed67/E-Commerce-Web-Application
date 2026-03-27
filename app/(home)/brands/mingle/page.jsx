import BrandPageTemplate from '@/components/BrandPage/BrandPageTemplate';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export const metadata = {
    title: 'Mingle | Where Style Meets Soul — Mingle Fashion',
    description: 'Discover the Mingle brand — vibrant, inclusive fashion where style meets soul. Explore the full Mingle collection.',
};

export default function MingleBrandPage() {
    return <BrandPageTemplate brand={BRAND_CONFIGS.mingle} />;
}
