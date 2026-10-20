'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useFeatures } from '@/hooks/useFeatures'; // Import the hook

const BestSellingProductCard = dynamic(() => import('../BestSellingCard/BestSellingCard'), {
  loading: () => <div className="h-64 bg-gray-100 rounded-md" />,
  ssr: false,
});

export default function BestSellingSection({ products }) {
  // Use the features hook
  const { features, loading } = useFeatures();
  
  // Check if best selling section is enabled
  const isBestSellingEnabled = features?.enable_best_selling_section !== false; // Default to true if not set

  // Show loading skeleton while checking features
  if (loading) {
    return (
      <section className="py-6 px-4 bg-white border-t border-gray-100">
        <div className="h-8 bg-gray-200 animate-pulse w-64 mb-12"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-md"></div>
          ))}
        </div>
      </section>
    );
  }

  // If feature is disabled, don't render anything
  if (!isBestSellingEnabled) {
    return null;
  }

  // If no products, don't render the section
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 px-4 bg-white border-t border-gray-100">
      <h2 className="text-2xl md:text-3xl font-light text-gray-900 text-center mb-8">
        Best Selling
      </h2>
      <div className="flex justify-center border-b border-gray-200 mb-5">
        <span className="px-5 py-2 text-xs font-semibold uppercase tracking-widest border-b-2 border-[#32BBAB] text-[#32BBAB] -mb-px">All</span>
        <Link href="/shop" className="px-5 py-2 text-xs font-semibold uppercase tracking-widest border-b-2 border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors -mb-px">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {products.map((product) => (
          <BestSellingProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);