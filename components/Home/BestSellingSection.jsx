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
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="h-8 bg-gray-200 animate-pulse w-64 mb-12"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
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
    <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="flex justify-between items-center mb-12">
        <span></span>
        <h2 className="text-3xl uppercase text-center text-gray-700 font-semibold">Best Selling Products</h2>
        <Link href="/shop" className="text-[#32BBAB] hover:text-[#5b9790] font-medium flex items-center">
          View All
          <ChevronRightIcon />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
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