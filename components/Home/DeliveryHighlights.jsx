'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { FiTruck, FiHeadphones, FiDollarSign, FiShield, FiRefreshCw, FiMapPin } from 'react-icons/fi';

const HIGHLIGHTS = [
    {
        icon: FiTruck,
        title: 'Fast Delivery',
        desc: 'Get your order delivered within 2–5 business days across Bangladesh.',
    },
    {
        icon: FiHeadphones,
        title: '24/7 Support',
        desc: 'Our customer service team is available round the clock to help you.',
    },
    {
        icon: FiDollarSign,
        title: 'Cash on Delivery',
        desc: 'Pay when your order arrives — no card required, hassle-free.',
    },
    {
        icon: FiShield,
        title: 'Secure Shopping',
        desc: 'Your data and payments are fully protected with us.',
    },
    {
        icon: FiRefreshCw,
        title: 'Easy Returns',
        desc: 'Not satisfied? Return within 7 days for a full exchange or refund.',
    },
    {
        icon: FiMapPin,
        title: 'Nationwide Coverage',
        desc: 'We deliver to every corner of Bangladesh, right to your doorstep.',
    },
];

export default function DeliveryHighlights() {
    return (
        <section className="py-10 px-4 bg-white border-t border-gray-100">
            <h2 className="text-2xl md:text-3xl font-light text-gray-900 text-center mb-8">
                Delivery Experience
            </h2>
            <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                loop
                slidesPerView={1.4}
                spaceBetween={12}
                breakpoints={{
                    480: { slidesPerView: 2.2 },
                    768: { slidesPerView: 3.2 },
                    1024: { slidesPerView: 4 },
                }}
            >
                {HIGHLIGHTS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <SwiperSlide key={item.title}>
                            <div className="flex flex-col items-center text-center px-3 py-5 border border-gray-100 rounded-sm h-full">
                                <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center mb-3 shrink-0">
                                    <Icon className="w-5 h-5 text-[#32BBAB]" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-800 mb-1">
                                    {item.title}
                                </p>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </section>
    );
}
