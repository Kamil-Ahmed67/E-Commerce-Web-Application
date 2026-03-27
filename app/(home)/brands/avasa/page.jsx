import BrandPageTemplate from '@/components/BrandPage/BrandPageTemplate';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export const metadata = {
    title: 'Avasaa | Feel Comfortable — Mingle Fashion',
    description: 'Discover Avasaa — comfort wear designed around you. Soft, breathable, effortlessly wearable. Explore the Avasaa collection at Mingle Fashion.',
};

export default function AvasaaBrandPage() {
    return <BrandPageTemplate brand={BRAND_CONFIGS.avasaa} />;
}
