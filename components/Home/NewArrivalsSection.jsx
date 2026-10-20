'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { normalizeGender } from '@/utils/genderHelpers';

const ProductCard = dynamic(() => import('../ProductCard/ProductCard'), {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-sm" />,
    ssr: false,
});

const TABS = [
    { key: 'women', label: 'Women', href: '/women' },
    { key: 'men', label: 'Men', href: '/men' },
];

export default function NewArrivalsSection({ products = [] }) {
    const [activeTab, setActiveTab] = useState('women');

    const filtered = products
        .filter(p => normalizeGender(p.category) === activeTab)
        .slice(0, 12);

    const activeHref = TABS.find(t => t.key === activeTab)?.href ?? '/shop';

    return (
        <section className="py-10 px-4 bg-white border-t border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
                <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-[#2EC4B6] mb-3">
                    Just Landed
                </p>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900">New Arrivals</h2>
            </div>

            {/* Tabs + View All */}
            <div className="flex justify-center border-b border-gray-200 mb-5">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                            activeTab === tab.key
                                ? 'border-[#32BBAB] text-[#32BBAB]'
                                : 'border-transparent text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
                <Link
                    href="/shop-new"
                    prefetch={false}
                    className="px-5 py-2 text-xs font-semibold uppercase tracking-widest border-b-2 border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors -mb-px"
                >
                    View All
                </Link>
            </div>

            {/* Slider */}
            {filtered.length > 0 ? (
                <Swiper
                    modules={[Navigation, FreeMode]}
                    freeMode
                    navigation
                    slidesPerView={3}
                    spaceBetween={12}
                    breakpoints={{
                        640: { slidesPerView: 5, spaceBetween: 12 },
                        1024: { slidesPerView: 6, spaceBetween: 16 },
                    }}
                    className=""
                >
                    {filtered.map(product => (
                        <SwiperSlide key={product.id}>
                            <ProductCard product={product} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className="flex items-center justify-center min-h-40 text-gray-400 text-sm">
                    No new arrivals yet
                </div>
            )}
        </section>
    );
}
