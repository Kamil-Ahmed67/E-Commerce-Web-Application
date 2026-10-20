'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const DEFAULTS = {
    women: '/images/about/WMSKDI08 (2).png',
    men: '/images/about/MVP J09 (7).png',
};

export default function TrendingCategories({ images = {} }) {
    const CATEGORIES = [
        { title: 'Women', image: images.women || DEFAULTS.women, href: '/women' },
        { title: 'Men', image: images.men || DEFAULTS.men, href: '/men' },
    ];

    return (
        <section className="bg-white py-6 px-4 border-t border-gray-100">
            <h2 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-3 text-center">
                Trending Categories
            </h2>
            <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                    <Link key={cat.title} href={cat.href} prefetch={false}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            className="relative overflow-hidden rounded-sm shadow-sm group cursor-pointer"
                        >
                            <div className="relative w-full aspect-3/4 md:aspect-video">
                                <Image
                                    src={cat.image}
                                    alt={cat.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 50vw, 600px"
                                    priority
                                    unoptimized={cat.image.startsWith('http')}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-white text-xl font-bold uppercase tracking-wider">
                                    {cat.title}
                                </p>
                                <p className="text-white/80 text-xs mt-0.5 uppercase tracking-widest">
                                    Shop Now →
                                </p>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
