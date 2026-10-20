import ShopWithSidebar from '@/components/ShopWithSidebar';
import { Suspense } from 'react';

export async function generateMetadata({ params }) {
  const { category } = await params;
  const label = decodeURIComponent(category);
  return {
    title: `${label} — Mingle In Style`,
    description: `Shop all ${label} products at Mingle In Style.`,
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const label = decodeURIComponent(category);

  return (
    <div>
      <Suspense fallback={<div className="text-center text-gray-600 py-20">Loading...</div>}>
        <ShopWithSidebar defaultCategory={label} />
      </Suspense>
    </div>
  );
}
