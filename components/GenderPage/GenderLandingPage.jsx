'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const ACCENT = '#32BBAB';


function CategoryCard({ category, index }) {
    const [imgError, setImgError] = useState(false);
    const showFallback = imgError || !category.image;

    return (
        <Link href={category.path} prefetch={false}>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-sm shadow-md group cursor-pointer"
            >
                {showFallback ? (
                    /* ── Placeholder card (no image yet) ── */
                    <div className="relative w-full aspect-3/4 bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center px-3 group-hover:border-[#32BBAB] transition-colors duration-300">
                        {/* Camera icon */}
                        <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-300 mb-3 group-hover:text-[#32BBAB] transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>

                        {/* Category name */}
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider text-center leading-tight">
                            {category.name}
                        </p>

                        {/* Product count */}
                        {category.count != null && (
                            <p className="mt-1.5 text-xs text-gray-400 font-medium">
                                {category.count} {category.count === 1 ? 'item' : 'items'}
                            </p>
                        )}

                        {/* Shop Now */}
                        <p className="mt-3 text-[10px] md:text-xs uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: ACCENT }}>
                            Shop Now →
                        </p>
                    </div>
                ) : (
                    /* ── Normal image card ── */
                    <div className="relative w-full aspect-3/4">
                        <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 300px"
                            onError={() => setImgError(true)}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-300"
                            style={{ background: ACCENT }}
                        />

                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                            <p className="text-white text-sm md:text-lg font-black uppercase tracking-wider drop-shadow mb-1">
                                {category.name}
                            </p>
                            <p
                                className="text-[9px] md:text-xs uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ color: '#7ee8e0' }}
                            >
                                Shop Now →
                            </p>
                            <div
                                className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                                style={{ background: ACCENT }}
                            />
                        </div>
                    </div>
                )}
            </motion.div>
        </Link>
    );
}

export default function GenderLandingPage({ gender, categories, heroImage, heroDescription }) {
    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f3f4f6] pt-[var(--header-height)]">

            {/* Hero */}
            <section className="relative w-full h-[56.25vw] md:h-screen overflow-hidden">
                <Image
                    src={heroImage}
                    alt={gender}
                    fill
                    className=" object-cover object-top"
                    priority
                />
                {heroDescription && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="bg-black/50 text-white text-2xl sm:text-2xl md:text-6xl max-w-xl mt-1 md:mt-2 px-6 py-4 rounded-md"
                        >
                            {heroDescription}
                        </motion.p>
                    </div>
                )}
            </section>

            {/* Category grid */}
            <section className="bg-[#f3f4f6] py-8 md:py-12 px-3 sm:px-8 xl:px-4">
                <div className="text-center mb-6 md:mb-8">
                    <p
                        className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-1"
                        style={{ color: ACCENT }}
                    >
                        {gender === 'Unisex' ? 'Unisex Collection' : `${gender}'s Collection`}
                    </p>
                    <h2 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800">
                        Shop by Category
                    </h2>
                </div>

                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Categories Available</h3>
                        <p className="text-sm text-gray-400 max-w-xs">
                            This collection is coming soon. Check back later or explore our other categories.
                        </p>
                        <a
                            href="/shop"
                            className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: ACCENT }}
                        >
                            Browse All Products
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categories.map((cat, i) => (
                            <CategoryCard key={cat.name} category={cat} index={i} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
