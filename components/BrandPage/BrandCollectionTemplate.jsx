'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function BrandCollectionTemplate({ brand, womenHref, menHref, unisexHref, newArrivalsHref, menImage, womenImage, unisexImage, newArrivalsImage, menAlt, womenAlt, unisexAlt, newArrivalsAlt, bannerImage, bannerAlt, bannerDescription }) {
    const GENDER_CARDS = [
        { gender: 'Women', image: womenImage, label: 'Women', alt: womenAlt },
        { gender: 'Men', image: menImage, label: 'Men', alt: menAlt },
        ...(unisexHref ? [{ gender: 'Unisex', image: unisexImage || womenImage, label: 'Unisex', alt: unisexAlt || `${brand.name} unisex` }] : []),
        { gender: 'NewArrivals', image: newArrivalsImage || womenImage, label: 'New Arrivals', alt: newArrivalsAlt || `${brand.name} new arrivals` },
    ];

    return (
        <div className="min-h-screen overflow-x-hidden bg-white pt-[var(--header-height)]">

            {/* ── HERO BANNER ───────────────────────────────────────── */}
            {/* Mobile: 56.25vw (16:9) | Desktop: full screen */}
            <section className="relative w-full h-[56.25vw] md:h-screen overflow-hidden">
                <Image
                    src={bannerImage || brand.heroImage}
                    alt={bannerAlt || `${brand.name} collection`}
                    fill
                    className="object-cover object-top"
                    priority
                />

                {bannerDescription && (
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <p className="bg-black/65 text-white text-center font-bold uppercase tracking-wide text-xl md:text-4xl lg:text-5xl px-6 py-4 md:px-10 md:py-6 max-w-4xl">
                            {bannerDescription}
                        </p>
                    </div>
                )}
            </section>

            {/* ── TRENDING CATEGORIES — Women & Men ────────────────── */}
            <section className="bg-white py-6 px-3 md:px-6 border-t border-gray-100">
                <div className="text-center mb-4 md:mb-6">
                    <p
                        className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-0.5"
                        style={{ color: brand.accentColor }}
                    >
                        {brand.name}
                    </p>
                    <h2 className="text-xs md:text-sm font-semibold uppercase tracking-widest text-gray-800">
                        Trending Categories
                    </h2>
                </div>

                <div className={`grid grid-cols-2 ${unisexHref ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-2 md:gap-3 max-w-5xl mx-auto`}>
                    {GENDER_CARDS.map((card, i) => {
                        const customHref = card.gender === 'Women' ? womenHref : card.gender === 'Men' ? menHref : card.gender === 'Unisex' ? unisexHref : newArrivalsHref;
                        const href = customHref || `/shop?brand=${brand.name}&gender=${card.gender}`;
                        const isNewArrivals = card.gender === 'NewArrivals';
                        return (
                            <Link
                                key={card.gender}
                                href={href}
                                prefetch={false}
                                className={isNewArrivals ? 'col-span-2 md:col-span-1' : ''}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                                    whileHover={{ scale: 1.02 }}
                                    className="relative overflow-hidden rounded-sm shadow-sm group cursor-pointer"
                                >
                                    {/* NEW badge for New Arrivals card */}
                                    {isNewArrivals && (
                                        <div
                                            className="absolute top-3 left-0 z-20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white"
                                            style={{ background: brand.accentColor }}
                                        >
                                            NEW
                                        </div>
                                    )}

                                    {/* 3:4 on mobile, 16:9 on desktop */}
                                    <div className={`relative w-full ${isNewArrivals ? 'aspect-video md:aspect-video' : 'aspect-3/4 md:aspect-video'}`}>
                                        <Image
                                            src={card.image}
                                            alt={card.alt}
                                            fill
                                            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${card.gender === 'Women' ? 'object-center' : 'object-top'}`}
                                            sizes="(max-width: 768px) 50vw, 600px"
                                            priority={i === 0}
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />
                                        <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                                            style={{ background: brand.accentColor }}
                                        />
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                                        <p className="text-white text-base md:text-xl font-bold uppercase tracking-wider">
                                            {card.label}
                                        </p>
                                        <p className="text-white/75 text-[9px] md:text-xs mt-0.5 uppercase tracking-widest">
                                            Shop {brand.name} {card.label} →
                                        </p>
                                    </div>

                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                                        style={{ background: brand.accentColor }}
                                    />
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
