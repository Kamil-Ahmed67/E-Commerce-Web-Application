'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const AboutUs = () => {

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
        },
    };
    const item = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: 'easeOut' },
        },
    };

    const stats = [
        { value: '10M+', label: 'Happy Customers' },
        { value: '100K+', label: 'Products Available' },
        { value: '24/7', label: 'Customer Support' },
        { value: '150+', label: 'Countries Served' },
    ];

    const missionCards = [
        {
            title: 'Curated Selection',
            description:
                'We handpick products that meet our high standards for quality, sustainability, and design.',
            image: '/images/about/sweat.jpg',
        },
        {
            title: 'Sustainable Future',
            description:
                'Committed to eco-friendly practices and supporting ethical brands that care about our planet.',
            image: '/images/about/Men.jpg',
        },
        {
            title: 'Customer Joy',
            description:
                'Your happiness is our priority. We go above and beyond to create delightful shopping experiences.',
            image: '/images/about/Kids.jpg',
        },
    ];

    return (
        <div className="pt-16 lg:pt-22">
            {/* Enhanced Animated Banner */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-linear-to-br from-[#0F0B30] via-[#191654] to-[#43C6AC] py-20 md:py-20 overflow-hidden"
            >
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-tr from-[#0F0B30]/80 via-[#191654]/60 to-[#43C6AC]/40" />

                    {/* Animated particles – only after mount */}
                    
                    {/* Floating geometric shapes */}
                    <motion.div
                        animate={{
                            x: [0, 60, 0],
                            y: [0, -40, 0],
                            rotate: [0, 10, 0],
                            transition: { repeat: Infinity, duration: 18, ease: 'easeInOut' },
                        }}
                        className="absolute top-1/4 left-1/4 w-40 h-40 bg-[#55DBC0] rounded-lg opacity-20 blur-xl"
                    />
                    <motion.div
                        animate={{
                            x: [0, -60, 0],
                            y: [0, 30, 0],
                            rotate: [0, -15, 0],
                            transition: { repeat: Infinity, duration: 22, ease: 'easeInOut' },
                        }}
                        className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-[#FF6B6B] rounded-full opacity-20 blur-xl"
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Main heading */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-10"
                    >
                        <motion.h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-5 lg:mb-8 leading-tight tracking-tight">
                            Our <span className="text-transparent bg-clip-text bg-linear-to-r from-[#55DBC0] to-[#F9C74F]">Story</span> at{' '}
                            <span className="text-[#55DBC0]">Mingle</span>
                        </motion.h1>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '200px' }}
                            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="h-1.5 bg-linear-to-r from-[#55DBC0] via-[#F9C74F] to-[#FF6B6B] mx-auto mt-3 lg:mt-6 rounded-full"
                        />
                    </motion.div>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
                        className="text-xl md:text-3xl text-white/90 max-w-4xl mx-auto font-medium leading-relaxed"
                    >
                      Redefining fashion with style and confidence since 2025
                    </motion.p>

                    {/* CTA buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="mt-8 lg:mt-16 flex flex-col sm:flex-row justify-center gap-6"
                    >
                        <Link href="/shop" prefetch={false}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-10 py-4 w-full bg-linear-to-r from-[#55DBC0] to-[#43C6AC] text-[#0F0B30] font-bold rounded-full hover:shadow-xl transition-all duration-300 shadow-lg hover:shadow-[#55DBC0]/40"
                            >
                                Explore Our Products
                            </motion.button>
                        </Link>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-10 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-[#0F0B30] transition-all duration-300 shadow-lg hover:shadow-white/20"
                        >
                            Join Our Community
                        </motion.button>
                    </motion.div>
                </div>

                {/* Floating accent circles */}
                <motion.div
                    animate={{
                        x: [0, 20, 0],
                        y: [0, -15, 0],
                        transition: { repeat: Infinity, duration: 12, ease: 'easeInOut' },
                    }}
                    className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#F9C74F] rounded-full opacity-10 blur-xl"
                />
                <motion.div
                    animate={{
                        x: [0, -20, 0],
                        y: [0, 20, 0],
                        transition: { repeat: Infinity, duration: 15, ease: 'easeInOut' },
                    }}
                    className="absolute -top-32 -right-32 w-96 h-96 bg-[#FF6B6B] rounded-full opacity-10 blur-xl"
                />

                {/* Scrolling indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                >
                    <motion.div
                        animate={{
                            y: [0, 10, 0],
                            transition: { repeat: Infinity, duration: 2 },
                        }}
                    >
                        <svg className="w-6 lg:w-8 h-6 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Mission Section */}
            <section className="py-7 lg:py-14 bg-white">
                <div className=" px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={container}
                        className="text-center mb-8 lg:mb-16"
                    >
                        <motion.h2 className="text-2xl md:text-4xl font-bold text-gray-700 mb-2 lg:mb-4">
                            Our Mission
                        </motion.h2>
                        <motion.div variants={item} className="w-20 h-1 bg-[#44A08D] mx-auto mb-4 lg:mb-8" />
                        <motion.p variants={item} className="text-base lg:text-xl text-gray-600 max-w-3xl mx-auto">
                            At Mingle, we are revolutionizing e-commerce by creating meaningful connections between buyers and sellers through an intuitive, joyful shopping experience that celebrates individuality and community.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={container}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {missionCards.map((card, index) => (
                            <motion.div
                                key={index}
                                variants={item}
                                whileHover={{ scale: 1.05 }}
                                className="relative rounded-sm shadow-lg overflow-hidden group h-59"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-cover bg-center transform transition-transform duration-300 ease-out group-hover:scale-110"
                                    style={{ backgroundImage: `url(${card.image})` }}
                                >
                                    <div className="absolute inset-0 bg-linear-to-b from-[#00000033] via-[#0000004D] to-[#00000080]" />
                                </motion.div>
                                <div className="relative z-10 text-white p-6 h-full flex flex-col justify-end">
                                    <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                                    <p className="text-sm">{card.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-4 lg:py-8 bg-gray-50">
                <div className=" px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={container}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-8 text-center"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={item}
                                whileHover={{ scale: 1.05 }}
                                className="bg-red-800 border border-gray-100 p-6 rounded-sm shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <p className="text-2xl md:text-4xl font-bold text-gray-100 mb-1 lg:mb-2">{stat.value}</p>
                                <p className="text-gray-100 text-sm lg:text-base">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
            {/* Enhanced Our Story Section */}
            <section className="py-5 bg-white">
                <div className=" px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        //variants={slideInLeft}
                        >
                            <h2 className="text-xl lg:text-3xl md:text-4xl font-bold text-gray-700 mb-6">From Humble Beginnings</h2>
                            <div className="space-y-4 text-xs lg:text-sm text-gray-600">
                                <p>
                                    Founded in 2025, Mingle Fashion began with a clear mission: to become a trusted name in the fashion and textile industry by delivering reliable solutions and sourcing excellence. What started as a small venture has quickly grown into a dynamic clothing brand driven by passion, integrity, and a commitment to quality.
                                </p>
                                <p>Over the years, our continuous growth has shaped a strong, dedicated team that forms the backbone of everything we do. Each member brings unique skills and insights, allowing us to innovate and meet evolving style preferences while maintaining high standards in every product we offer</p>
                                <p>At Mingle Fashion, we pride combining trend-forward designs with exceptional craftsmanship. We ensure each piece meets our promise of quality, value, and timely delivery because we believe fashion should not only inspire but also be dependable.</p>
                            </div>
                        </motion.div>
                        <div
                            className="relative"
                        >
                            <div className="relative aspect-video rounded-sm overflow-hidden shadow-2xl">
                                <Image
                                    src="/images/about/Women.jpg"
                                    alt="Mingle team working"
                                    width={1000}
                                    height={667}
                                    className="w-full h-full object-cover"
                                    priority
                                />
                            </div>
                            <div
                                className="absolute  -bottom-6 -right-3 lg:-right-5 bg-[#1A2980] w-40 h-40 rounded-full z-10 shadow-xl flex items-center justify-center text-white font-bold text-sm px-4 text-center"
                            >
                                Best Selling Products
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-10 lg:py-18 bg-linear-to-r from-[#191654] to-[#43C6AC]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-xl lg:text-3xl md:text-4xl font-bold text-white mb-6"
                    >
                        Explore More ?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-sm lg:text-xl text-white mb-4 lg:mb-8 max-w-3xl mx-auto"
                    >
                        Join millions of happy customers discovering amazing products every day.
                    </motion.p>
                    <motion.div
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <Link prefetch={false} href='/shop'>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-3 w-full bg-white text-[#44A08D] font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Shop Now
                            </motion.button>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-[#44A08D] transition-all duration-300"
                        >
                            Become a Seller
                        </motion.button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;