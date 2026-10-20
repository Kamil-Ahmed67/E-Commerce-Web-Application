import { notFound } from 'next/navigation';
import ShopDetailsClient from '@/components/ShopDetails/ShopDetailsClient';
import { getProductBySlug } from '@/lib/server/getProductBySlug';
import { getItemSpecs } from '@/lib/server/itemSpecs';

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return { title: 'Product — Mingle In Style', description: '' };
    return {
      title: product.pmTitle || product.title || 'Product — Mingle In Style',
      description: product.pmDescription || '',
    };
  } catch {
    return { title: 'Product — Mingle In Style', description: '' };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const specs = await getItemSpecs(product.id);

  return <ShopDetailsClient initialProduct={product} initialSpecs={specs} />;
}
