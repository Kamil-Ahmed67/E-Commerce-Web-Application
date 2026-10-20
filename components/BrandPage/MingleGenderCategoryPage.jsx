'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BRAND_CONFIGS } from '@/lib/brandConfig';

const brand = BRAND_CONFIGS.mingle;

const GRADIENTS = [
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
    'linear-gradient(135deg, #1b2838 0%, #1f4037 50%, #99f2c8 100%)',
    'linear-gradient(135deg, #2d3436 0%, #2c3e50 50%, #3d6b61 100%)',
    'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    'linear-gradient(135deg, #232526 0%, #1a3a3a 50%, #2c5364 100%)',
];

function CategoryCard({ category, index, isLastOdd }) {
    const isUpcoming = category.upcoming;
    const gradient = GRADIENTS[index % GRADIENTS.length];

    const inner = (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={!isUpcoming ? { scale: 1.02 } : {}}
            className={`relative overflow-hidden rounded-sm shadow-md group ${isUpcoming ? 'cursor-default' : 'cursor-pointer'}`}
        >
            <div
                className="relative w-full aspect-3/4 md:aspect-square flex flex-col items-center justify-center px-3"
                style={{ background: gradient }}
            >
                {/* Decorative rings */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border border-white/10" />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full border border-white/10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-white/5" />
                </div>

                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: brand.accentColor }} />

                {isUpcoming ? (
                    <>
                        <div
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 mb-3 text-[9px] md:text-xs font-bold uppercase tracking-widest"
                            style={{ background: `${brand.accentColor}30`, color: brand.accentColorLight, border: `1px solid ${brand.accentColor}50` }}
                        >
                            <span className="w-1 h-1 rounded-full inline-block animate-pulse" style={{ background: brand.accentColorLight }} />
                            Coming Soon
                        </div>
                        <p className="text-white text-base md:text-xl font-black uppercase tracking-widest text-center drop-shadow-lg leading-tight">
                            {category.name}
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                            {category.items.map((item) => (
                                <span
                                    key={item}
                                    className="text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-full text-white/60"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-white text-base md:text-xl font-black uppercase tracking-widest text-center drop-shadow-lg leading-tight">
                            {category.name}
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                            {category.items.map((item) => (
                                <span
                                    key={item}
                                    className="text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-full text-white/85 font-medium"
                                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                        <p
                            className="mt-2 text-[9px] md:text-xs uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ color: brand.accentColorLight }}
                        >
                            Shop Now →
                        </p>
                    </>
                )}

                {/* Bottom accent bar on hover */}
                {!isUpcoming && (
                    <div
                        className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                        style={{ background: brand.accentColor }}
                    />
                )}

                {/* Hover tint */}
                {!isUpcoming && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
                )}
            </div>
        </motion.div>
    );

    if (isUpcoming) {
        return (
            <div className={isLastOdd ? 'col-span-2' : ''}>
                {inner}
            </div>
        );
    }

    return (
        <Link href={category.href} prefetch={false} className={isLastOdd ? 'col-span-2' : ''}>
            {inner}
        </Link>
    );
}

export default function MingleGenderCategoryPage({ gender, categories, heroImage }) {
    const isOddTotal = categories.length % 2 !== 0;

    return (
        <div className="min-h-screen overflow-x-hidden bg-white">

            {/* ── HERO BANNER ── */}
            <section className="relative w-full h-[56.25vw] md:h-screen overflow-hidden">
                <Image
                    src={heroImage}
                    alt={`Mingle ${gender}`}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/65" />

                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45 }}
                        className="hidden sm:block mb-4 md:mb-6"
                    >
                        <Link
                            href="/brands/mingle/collection"
                            className="inline-flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-widest font-semibold text-white/60 hover:text-white/90 transition-colors"
                        >
                            ← Mingle Collection
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="relative mb-2 md:mb-5"
                        style={{ width: 'min(120px, 32vw)', height: 'min(48px, 13vw)' }}
                    >
                        <Image
                            src={brand.logo}
                            alt="Mingle logo"
                            fill
                            className="object-contain drop-shadow-2xl"
                            priority
                        />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-3xl md:text-7xl font-black tracking-tight text-white mb-1 md:mb-3"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
                    >
                        {gender}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-white/70 text-[9px] md:text-sm uppercase tracking-widest"
                    >
                        {brand.tagline}
                    </motion.p>
                </div>
            </section>

            {/* Back link — mobile */}
            <div className="sm:hidden px-3 pt-3 pb-1">
                <Link
                    href="/brands/mingle/collection"
                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: brand.accentColor }}
                >
                    ← Mingle Collection
                </Link>
            </div>

            {/* ── CATEGORY GRID ── */}
            <section className="bg-white py-5 px-3 md:px-6 border-t border-gray-100">
                <div className="text-center mb-4 md:mb-6">
                    <p
                        className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-0.5"
                        style={{ color: brand.accentColor }}
                    >
                        Mingle {gender}
                    </p>
                    <h2 className="text-xs md:text-sm font-semibold uppercase tracking-widest text-gray-800">
                        Shop by Category
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-3xl mx-auto">
                    {categories.map((cat, i) => {
                        const isLast = i === categories.length - 1;
                        const isLastOdd = isLast && isOddTotal;
                        return (
                            <CategoryCard
                                key={cat.name}
                                category={cat}
                                index={i}
                                isLastOdd={isLastOdd}
                            />
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
