import { redirect } from 'next/navigation';
import { getSlugForProductId } from '@/lib/server/getProductBySlug';

// 301 permanent redirect: /shop-details/3719 → /product/mens-denim-pant
export default async function ShopDetailsRedirect({ params }) {
  const { id } = await params;
  const slug = await getSlugForProductId(id);

  if (slug) {
    redirect(`/product/${slug}`);
  } else {
    redirect('/shop');
  }
}
