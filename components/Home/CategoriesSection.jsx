'use client';

import Image from 'next/image';
import { motion } from "framer-motion";

const BRAND_CONFIG = {
  mingle:    { fallback: "/images/mingle_home.jpeg",        logo: "/images/logo/4.png", link: "/brands/mingle/collection",    objectPosition: "center" },
  vidjar:    { fallback: "/images/vidjar_home.jpeg",        logo: "/images/logo/2.png", link: "/brands/vidjar/collection",    objectPosition: "top" },
  purenorth: { fallback: "/images/Pure north_home.jpeg",    logo: "/images/logo/1.png", link: "/brands/purenorth/collection", objectPosition: "center" },
  avasaa:    { fallback: "/images/Avasaa_home.jpeg",        logo: "/images/logo/3.png", link: "/brands/avasa/collection",     objectPosition: "top" },
};

const DISPLAY_ORDER = ['mingle', 'vidjar', 'purenorth', 'avasaa'];

export default function CategoriesSection({ brands = [], brandHomeBanners = {} }) {
  // Build card list — merge "{Brand} Home" banner image into config, preserve display order
  const cards = DISPLAY_ORDER.map((key) => {
    const config = BRAND_CONFIG[key];
    const dbBrand = brands.find((b) => b.name?.toLowerCase().replace(/\s/g, '') === key);

    // Show banner image only if the brand is active (isActive is true or 1)
    const isBrandActive = dbBrand && (dbBrand.isActive === true || dbBrand.isActive === 1 || dbBrand.isActive === '1');
    const brandName = dbBrand?.name || (key === 'purenorth' ? 'PureNorth' : key.charAt(0).toUpperCase() + key.slice(1));
    const homeBanner = isBrandActive ? brandHomeBanners[`${brandName} home`.toLowerCase()] : null;

    return {
      key,
      title: dbBrand?.name || key.charAt(0).toUpperCase() + key.slice(1),
      image: homeBanner?.image || config.fallback,
      imgAlt: homeBanner?.title || dbBrand?.name || key,
      logo: config.logo,
      link: config.link,
      objectPosition: config.objectPosition,
    };
  });

  return (
    <section className='bg-white py-6 px-4 border-t border-gray-100'>
      <h2 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-3 text-center">
        Our Brands
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((item) => (
          <motion.a
            href={item.link}
            key={item.key}
            whileHover={{ scale: 1.03, zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.18)' }}
            transition={{ duration: 0.25 }}
            className="group block"
          >
            <div className="relative w-full aspect-square md:aspect-video overflow-hidden rounded-sm">
              <Image
                src={item.image}
                alt={item.imgAlt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ objectPosition: item.objectPosition }}
                sizes="(max-width: 768px) 50vw, 25vw"
                priority
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
            </div>

            <div className="flex items-center justify-center py-2.5 px-2">
              <div className="relative w-20 h-8 sm:w-24 sm:h-10 md:w-28 md:h-11">
                <Image
                  src={item.logo}
                  alt={`${item.title} logo`}
                  fill
                  className="object-contain"
                  sizes="112px"
                  quality={90}
                />
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
