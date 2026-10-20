'use client';

import Image from 'next/image';

export default function BrandsSection({ brands = [] }) {
  const visibleBrands = brands.filter((b) => b.homeImg);

  if (visibleBrands.length === 0) return null;

  const handleBrandClick = (brand) => {
    window.dispatchEvent(new CustomEvent('brandSelect', { detail: { brand } }));
    setTimeout(() => {
      document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          {visibleBrands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => handleBrandClick(brand.name)}
              className="group relative block cursor-pointer overflow-hidden rounded-none transition duration-300 h-full"
            >
              <div className="w-full h-44 flex items-center justify-center p-4">
                <Image
                  src={brand.homeImg}
                  alt={brand.hImgAltText || brand.name}
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
