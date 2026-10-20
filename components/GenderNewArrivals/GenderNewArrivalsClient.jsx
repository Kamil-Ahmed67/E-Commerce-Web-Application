'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard/ProductCard';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import { trackEvent } from '@/lib/trackEvent';

const ACCENT = '#32BBAB';

export function ScrollRow({ products }) {
    const rowRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = useCallback(() => {
        const el = rowRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        const el = rowRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [checkScroll, products]);

    const scroll = (dir) => {
        const el = rowRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 480, behavior: 'smooth' });
    };

    return (
        <div className="relative">
            {canScrollLeft && (
                <button
                    onClick={() => scroll(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -mt-4 w-[42px] h-[42px] rounded-full bg-gray-200 border border-gray-300 shadow-[0_2px_6px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all duration-200 hover:bg-gray-300 hover:shadow-[0_3px_10px_rgba(0,0,0,0.14)] hover:scale-[1.06]"
                    aria-label="Scroll left"
                >
                    <svg className="w-[40%] h-[40%]" fill="none" stroke="#111827" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {canScrollRight && (
                <button
                    onClick={() => scroll(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mt-4 w-[42px] h-[42px] rounded-full bg-gray-200 border border-gray-300 shadow-[0_2px_6px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all duration-200 hover:bg-gray-300 hover:shadow-[0_3px_10px_rgba(0,0,0,0.14)] hover:scale-[1.06]"
                    aria-label="Scroll right"
                >
                    <svg className="w-[40%] h-[40%]" fill="none" stroke="#111827" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            <div
                ref={rowRef}
                className="overflow-x-auto pb-3 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                <div className="flex gap-3 md:gap-4 w-max">
                    {products.map(product => (
                        <div key={product.id} className="w-[103px] md:w-[137px] shrink-0">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function GenderNewArrivalsClient({ gender, groups, headerTitle = 'New Arrivals' }) {
    const hasProducts = groups.some(g => g.products.length > 0);

    useEffect(() => {
        const allProducts = groups.flatMap((g) => g.products);
        if (!allProducts.length) return;
        trackEvent('view_item_list', {
            contents: allProducts.map((p) => ({
                id: p.id,
                title: p.title,
                price: p.sellingPrice ?? p.price ?? 0,
                quantity: 1,
                brand: p.brand,
                category: p.productType,
            })),
            numItems: allProducts.length,
            listName: `${gender} ${headerTitle}`,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groups, gender, headerTitle]);

    return (
        <div className="min-h-screen bg-white pt-[var(--header-height)]">
            <div className="px-4 md:px-8 pt-4">
                <Breadcrumb items={[
                    { label: 'Home', href: '/' },
                    { label: gender, href: `/${gender.toLowerCase()}` },
                    { label: headerTitle, href: null },
                ]} />
            </div>

            {/* Header */}
            <div className="text-center py-8 px-4 border-b border-gray-100">
                <p
                    className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-1"
                    style={{ color: ACCENT }}
                >
                    {gender}
                </p>
                <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-gray-900">
                    {headerTitle}
                </h1>
                <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">
                    Fresh styles, just in
                </p>
            </div>

            {/* Content */}
            <div className="py-8 px-4 md:px-8">
                {!hasProducts ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-gray-400 text-sm uppercase tracking-widest">No new arrivals yet</p>
                        <p className="text-gray-300 text-xs mt-2 tracking-wider">Check back soon for fresh styles</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {groups.map(({ type, products }) => (
                            <motion.section
                                key={type}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span
                                        className="w-1 h-5 rounded-full inline-block shrink-0"
                                        style={{ background: ACCENT }}
                                    />
                                    <h2 className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-gray-800">
                                        {type}
                                    </h2>
                                    <span className="text-xs text-gray-400 tracking-widest">
                                        ({products.length})
                                    </span>
                                    <Link
                                        href={`/shop-new?gender=${encodeURIComponent(gender)}&category=${encodeURIComponent(type)}`}
                                        className="ml-auto text-xs font-semibold uppercase tracking-widest hover:underline"
                                        style={{ color: ACCENT }}
                                    >
                                        View All →
                                    </Link>
                                </div>

                                <ScrollRow products={products} />

                                <div className="mt-6 h-px bg-gray-100" />
                            </motion.section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
