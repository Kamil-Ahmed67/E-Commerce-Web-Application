'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

const TILES = [
  { key: 'mingle', image: '/images/mingle_home.jpeg' },
  { key: 'vidjar', image: '/images/vidjar_home.jpeg' },
  { key: 'purenorth', image: '/images/Pure north_home.jpeg' },
  { key: 'avasaa', image: '/images/Avasaa_home.jpeg' },
].map(({ key, image }) => {
  const brand = BRAND_CONFIGS[key];
  const [first, second] = brand.story.paragraphs;
  const snippet = first.length < 100 && second ? `${first} ${second}` : first;
  return { brand, image: encodeURI(image), snippet };
});

export default function DiscoverBrands() {
  const [active, setActive] = useState(null); // tap-to-toggle for touch devices

  return (
    <section className="py-10 px-4 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-[#2EC4B6] mb-3">Style for a brighter you</p>
          <h2 className="text-2xl md:text-3xl font-light text-gray-900">Discover Our Brands</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TILES.map(({ brand, image, snippet }) => {
            const open = active === brand.slug;
            return (
              <div
                key={brand.slug}
                onClick={() => setActive(open ? null : brand.slug)}
                className="group relative overflow-hidden rounded-2xl bg-[#161819] aspect-[4/3] md:aspect-[16/9] cursor-pointer"
              >
                <Image
                  src={image}
                  alt={brand.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className={`object-cover transition-all duration-700 group-hover:opacity-30 group-hover:scale-105 ${open ? 'opacity-30 scale-105' : ''}`}
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors duration-500" />

                {/* Name: centred at rest, moves to top on hover */}
                <h3
                  className={`absolute left-0 right-0 text-center font-light uppercase tracking-[0.25em] text-white transition-all duration-500 ease-out top-1/2 -translate-y-1/2 text-3xl md:text-4xl group-hover:top-6 group-hover:translate-y-0 group-hover:text-2xl md:group-hover:text-3xl ${open ? '!top-6 !translate-y-0 !text-2xl' : ''}`}
                >
                  {brand.name}
                </h3>

                {/* Story + button: revealed on hover */}
                <div
                  className={`absolute inset-x-0 top-20 bottom-6 px-6 md:px-12 flex flex-col items-center justify-between text-center text-white opacity-0 translate-y-3 transition-all duration-500 delay-100 group-hover:opacity-100 group-hover:translate-y-0 ${open ? '!opacity-100 !translate-y-0' : ''}`}
                >
                  <div>
                    <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-[#2EC4B6] mb-2">
                      {brand.category}
                    </p>
                    <p className="text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-4 text-white/90">
                      {snippet}
                    </p>
                  </div>
                  <Link
                    href={`/brands/${brand.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    prefetch={false}
                  >
                    <motion.button
                      whileHover={{ scale: 1.04, x: 4 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-animated-gradient px-8 py-3 rounded-full inline-flex items-center gap-3 font-bold text-sm uppercase tracking-widest transition-all shadow-md"
                    >
                      Read Our Story <span className="text-xl">→</span>
                    </motion.button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
