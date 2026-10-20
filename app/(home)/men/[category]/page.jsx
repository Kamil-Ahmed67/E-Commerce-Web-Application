import ShopWithSidebar from '@/components/ShopWithSidebar';
import { Suspense } from 'react';

export async function generateMetadata({ params }) {
  const { category } = await params;
  const label = decodeURIComponent(category);
  return {
    title: `Men's ${label} — Mingle In Style`,
    description: `Shop men's ${label} at Mingle In Style.`,
  };
}

export default async function MenCategoryPage({ params }) {
  const { category } = await params;
  const label = decodeURIComponent(category);

  return (
    <div>
      <Suspense fallback={<div className="text-center text-gray-600 py-20">Loading...</div>}>
        <ShopWithSidebar defaultGender="Men" defaultCategory={label} />
      </Suspense>
    </div>
  );
}
