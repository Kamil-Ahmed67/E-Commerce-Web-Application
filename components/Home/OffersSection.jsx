'use client';

import dynamic from 'next/dynamic';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const ProductCard = dynamic(() => import('../ProductCard/ProductCard'), {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-sm" />,
    ssr: false,
});

export default function OffersSection({ products = [] }) {
    const displayed = products.slice(0, 12);

    return (
        <section className="py-6 px-4 bg-white border-t border-gray-100">
            {/* Header */}
            <h2 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-3 text-center">
                Offers
            </h2>

            {/* Slider */}
            {displayed.length > 0 ? (
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
                    {displayed.map(product => (
                        <SwiperSlide key={product.id}>
                            <ProductCard product={product} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className="flex items-center justify-center min-h-40 text-gray-400 text-sm">
                    No offers available right now
                </div>
            )}
        </section>
    );
}
