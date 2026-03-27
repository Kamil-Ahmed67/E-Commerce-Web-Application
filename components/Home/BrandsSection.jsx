'use client';

import Image from 'next/image';

const CATEGORIES = [
  // { id: 1, name: 'Leftover', image: '/images/logo/LeftOver.png', brand: 'Leftover' },
  { id: 2, name: 'Vidjar', image: '/images/logo/vidjar.PNG', brand: 'Vidjar' },
  { id: 3, name: 'Avasa', image: '/images/logo/avasa-01.png', brand: 'Avasa' },
  { id: 4, name: 'PureNorth', image: '/images/logo/pure_north.png', brand: 'PureNorth' },
];

export default function BrandsSection() {
  const handleBrandClick = (brand) => {
    // Dispatch custom event for FeaturedProductsSection to listen to
    window.dispatchEvent(new CustomEvent('brandSelect', {
      detail: { brand }
    }));

    // Scroll to featured products section
    setTimeout(() => {
      document.getElementById('featured-products')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 50);
  };

  return (
    <section
      className="relative py-16 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/banner/rock-wall.jpg')" }}
    >
      <div className="absolute inset-0 bg-linear-to-t from-transparent to-white pointer-events-none z-1" />
      <div className="relative z-2">
        <h2 className="text-2xl lg:text-3xl uppercase font-semibold text-gray-700 text-center mb-12">
          Our Brands
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleBrandClick(category.brand)}
              className="group relative block cursor-pointer overflow-hidden rounded-none transition duration-300 h-full"
            >
              <div className="w-full h-44 flex items-center justify-center p-4">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={380}
                  height={180}
                  className="object-contain w-full h-full hover:scale-105 transition ease-in-out duration-400"
                  priority
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}