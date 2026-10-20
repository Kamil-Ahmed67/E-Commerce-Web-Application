'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const ACCENT = '#32BBAB';

const GRADIENTS = [
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
    'linear-gradient(135deg, #1b2838 0%, #1f4037 50%, #99f2c8 100%)',
    'linear-gradient(135deg, #2d3436 0%, #2c3e50 50%, #3d6b61 100%)',
    'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    'linear-gradient(135deg, #232526 0%, #1a3a3a 50%, #2c5364 100%)',
];

const DEFAULT_IMAGES = {
    women: '/images/about/WMSKDI08 (2).png',
    men: '/images/about/MVP J09 (7).png',
    mingle: '/images/mingle_home.jpeg',
    vidjar: '/images/vidjar_home.jpeg',
    pureNorth: '/images/Pure north_home.jpeg',
    avasaa: '/images/Avasaa_home.jpeg',
};

function ArrivalCard({ card, index }) {
    const [imgError, setImgError] = useState(false);
    const gradient = GRADIENTS[index % GRADIENTS.length];

    return (
        <Link href={card.href} prefetch={false}>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02 }}
                className="group cursor-pointer"
            >
                {/* Image / gradient */}
                <div className="relative overflow-hidden rounded-sm shadow-md">
                    {imgError ? (
                        <div
                            className="relative w-full aspect-3/4 md:aspect-square flex items-center justify-center px-3"
                            style={{ background: gradient }}
                        >
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border border-white/10" />
                                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full border border-white/10" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-white/5" />
                            </div>
                            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: ACCENT }} />
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ background: ACCENT }} />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
                        </div>
                    ) : (
                        <div className="relative w-full aspect-3/4 md:aspect-square">
                            <Image
                                src={card.image}
                                alt={card.name}
                                fill
                                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 300px"
                                onError={() => setImgError(true)}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-300" style={{ background: ACCENT }} />
                        </div>
                    )}
                </div>

                {/* Label below card */}
                <div className="flex items-center justify-center pt-2 pb-1">
                    {card.logo ? (
                        <div className="relative w-20 h-7 md:w-24 md:h-9">
                            <Image src={card.logo} alt={card.name} fill className="object-contain" sizes="96px" />
                        </div>
                    ) : (
                        <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-gray-800 group-hover:text-teal-600 transition-colors duration-200">
                            {card.name}
                        </p>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}

export default function NewArrivalPage({ bannerImages = {} }) {
    const heroSrc = bannerImages.hero || '/images/new arrival.jpeg';

    const GENDER_CARDS = [
        { name: 'Women', image: bannerImages.women || DEFAULT_IMAGES.women, href: '/shop-new?gender=Women', logo: null },
        { name: 'Men', image: bannerImages.men || DEFAULT_IMAGES.men, href: '/shop-new?gender=Men', logo: null },
    ];

    const BRAND_CARDS = [
        { name: 'Mingle', image: bannerImages.mingle || DEFAULT_IMAGES.mingle, href: '/brands/mingle/new-arrivals', logo: '/images/logo/4.png' },
        { name: 'Vidjar', image: bannerImages.vidjar || DEFAULT_IMAGES.vidjar, href: '/brands/vidjar/new-arrivals', logo: '/images/logo/2.png' },
        { name: 'PureNorth', image: bannerImages.pureNorth || DEFAULT_IMAGES.pureNorth, href: '/brands/purenorth/new-arrivals', logo: '/images/logo/1.png' },
        { name: 'Avasaa', image: bannerImages.avasaa || DEFAULT_IMAGES.avasaa, href: '/brands/avasa/new-arrivals', logo: '/images/logo/3.png' },
    ];

    return (
        <div className="min-h-screen overflow-x-hidden bg-white pt-[var(--header-height)]">

            {/* Hero — full image, no crop, no text */}
            <section className="w-full">
                <Image
                    src={heroSrc}
                    alt="New Arrivals"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                    priority
                    unoptimized={heroSrc.startsWith('http')}
                />
            </section>

            {/* Shop by Gender */}
            <section className="bg-white pt-6 pb-4 px-3 md:px-6 border-t border-gray-100">
                <div className="text-center mb-5 md:mb-8">
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-1" style={{ color: ACCENT }}>
                        Latest Collection
                    </p>
                    <h2 className="text-xs md:text-sm font-semibold uppercase tracking-widest text-gray-800">
                        Shop New Arrivals
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-3xl mx-auto">
                    {GENDER_CARDS.map((card, i) => (
                        <ArrivalCard key={card.name} card={card} index={i} />
                    ))}
                </div>
            </section>

            {/* Shop by Brand */}
            <section className="bg-white pt-4 pb-6 px-3 md:px-6">
                <div className="text-center mb-5 md:mb-8">
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-1" style={{ color: ACCENT }}>
                        New Arrivals
                    </p>
                    <h2 className="text-xs md:text-sm font-semibold uppercase tracking-widest text-gray-800">
                        Shop by Brand
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 max-w-5xl mx-auto">
                    {BRAND_CARDS.map((card, i) => (
                        <ArrivalCard key={card.name} card={card} index={i + GENDER_CARDS.length} />
                    ))}
                </div>
            </section>
        </div>
    );
}
