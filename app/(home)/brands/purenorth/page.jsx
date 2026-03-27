import BrandPageTemplate from '@/components/BrandPage/BrandPageTemplate';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

export const metadata = {
    title: 'PureNorth | Crafted by Nature — Mingle Fashion',
    description: 'Discover PureNorth — rugged, sustainable fashion inspired by the natural world. Explore the full PureNorth collection at Mingle Fashion.',
};

export default function PureNorthBrandPage() {
    return <BrandPageTemplate brand={BRAND_CONFIGS.purenorth} />;
}
