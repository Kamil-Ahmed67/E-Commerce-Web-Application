'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ProductCard = dynamic(() => import('../ProductCard/ProductCard'), {
  loading: () => <div className="h-64 bg-gray-100 rounded-md" />,
  ssr: false,
});

export default function FeaturedProductsSection({ products, allProducts }) {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [featuredProductsCount, setFeaturedProductsCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Use a ref instead of state for tracking hydration
  const isHydrated = useRef(false);

  useEffect(() => {
    // Mark as hydrated after component mounts
    isHydrated.current = true;
    
    // Listen for brand selection from BrandsSection
    const handleBrandSelect = (event) => {
      const { brand } = event.detail;
      setSelectedBrand(brand);
      setFilteredProducts(brand ? allProducts.filter(p => p.brand === brand) : allProducts);
      setFeaturedProductsCount(5);
    };

    window.addEventListener('brandSelect', handleBrandSelect);
    
    return () => {
      window.removeEventListener('brandSelect', handleBrandSelect);
    };
  }, [allProducts]);

  const loadMoreProducts = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setFeaturedProductsCount(prev => prev + 5);
      setIsLoadingMore(false);
    }, 300);
  };

  const displayedProducts = filteredProducts.slice(0, featuredProductsCount);
  const hasMore = featuredProductsCount < filteredProducts.length;

  return (
    <section id="featured-products" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="flex justify-between items-center mb-12">
        <div></div>
        <h2 className="text-2xl lg:text-3xl manrope uppercase text-gray-800 font-semibold">
          {selectedBrand ? `${selectedBrand.replace(/([A-Z])/g, ' $1').trim()} Products` : 'Featured Products'}
        </h2>
        <Link href="/shop" className="text-[#32BBAB] hover:text-[#5b9790] font-medium flex items-center">
          View All
          <ChevronRightIcon />
        </Link>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 min-h-100">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center min-h-75 bg-gray-50 rounded-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-400 mb-1">No products found</h3>
            <p className="text-gray-500 max-w-md text-center">
              {selectedBrand
                ? `We couldn't find any products from ${selectedBrand.replace(/([A-Z])/g, ' $1').trim()}`
                : "No products are currently available"}
            </p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={loadMoreProducts}
            disabled={isLoadingMore}
            className={`relative inline-flex items-center justify-center font-semibold text-sm uppercase tracking-wide px-6 py-2 min-w-35 border transition-colors duration-300
              ${isLoadingMore
                ? 'cursor-not-allowed bg-gray-200 text-gray-500 border-gray-300'
                : 'border-gray-800 text-gray-800 hover:border-teal-600 hover:text-teal-600'}
            `}
            suppressHydrationWarning={true}
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-teal-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </div>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </section>
  );
}

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);