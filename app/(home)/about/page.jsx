'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Curated Selection — a quality tag with a star, for "we handpick products that meet our high standards"
const CuratedSelectionIcon = ({ className }) => (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="curatedGrad" x1="15" y1="15" x2="105" y2="105" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#1A2980" />
                <stop offset="1" stopColor="#43C6AC" />
            </linearGradient>
        </defs>
        <path
            d="M18 55 L55 18 C58 15 63 15 66 18 L102 54 C105 57 105 62 102 65 L65 102 C62 105 57 105 54 102 L18 66 C15 63 15 58 18 55 Z"
            fill="url(#curatedGrad)"
        />
        <circle cx="40" cy="40" r="7" fill="#ffffff" fillOpacity="0.9" />
        <path
            d="M74 48 L79.5 59.2 L91.8 61 L82.9 69.6 L85 81.9 L74 76.1 L63 81.9 L65.1 69.6 L56.2 61 L68.5 59.2 Z"
            fill="#F9C74F"
        />
    </svg>
);

// Sustainable Future — a globe sprouting a leaf, wrapped by a recycle arc, for "eco-friendly practices...care about our planet"
const SustainableFutureIcon = ({ className }) => (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="ecoGrad" x1="26" y1="28" x2="94" y2="96" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#44A08D" />
                <stop offset="1" stopColor="#43C6AC" />
            </linearGradient>
        </defs>
        <circle cx="60" cy="62" r="34" fill="url(#ecoGrad)" />
        <path d="M28 54 Q60 41 92 54" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2.5" fill="none" />
        <path d="M28 72 Q60 85 92 72" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2.5" fill="none" />
        <path d="M60 28 Q51 46 60 96" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2.5" fill="none" />
        <path
            d="M60 30 C46 16 24 16 14 8 C17 28 28 42 44 46 C52 48 60 40 60 30 Z"
            fill="#F9C74F"
        />
        <path d="M18 12 C30 20 42 26 58 30" stroke="#1A2980" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.45" />
        <path d="M92 40 A46 46 0 0 1 96 82" stroke="#1A2980" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M87 78 L96 82 L100 72" stroke="#1A2980" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

// Customer Joy — a shopping bag with a heart and sparkles, for "delightful shopping experiences"
const CustomerJoyIcon = ({ className }) => (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="joyGrad" x1="32" y1="20" x2="88" y2="104" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#FF6B6B" />
                <stop offset="1" stopColor="#F9C74F" />
            </linearGradient>
        </defs>
        <path
            d="M32 42 L88 42 L82 100 Q81.5 104 77 104 L43 104 Q38.5 104 38 100 Z"
            fill="url(#joyGrad)"
        />
        <path d="M44 42 C44 28 51 20 60 20 C69 20 76 28 76 42" stroke="#1A2980" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path
            d="M60 82 C48 72 46 62 53 58 C57 55.5 60 58 60 62 C60 58 63 55.5 67 58 C74 62 72 72 60 82 Z"
            fill="#ffffff"
        />
        <path d="M22 30 L24 36 L30 38 L24 40 L22 46 L20 40 L14 38 L20 36 Z" fill="#43C6AC" />
        <path d="M96 60 L97.5 64 L101.5 65.5 L97.5 67 L96 71 L94.5 67 L90.5 65.5 L94.5 64 Z" fill="#43C6AC" />
    </svg>
);

const AboutUs = () => {
    const [isOpen, setIsOpen] = useState(false);
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
            Icon: CuratedSelectionIcon,
        },
        {
            title: 'Sustainable Future',
            description:
                'Committed to eco-friendly practices and supporting ethical brands that care about our planet.',
            Icon: SustainableFutureIcon,
        },
        {
            title: 'Customer Joy',
            description:
                'Your happiness is our priority. We go above and beyond to create delightful shopping experiences.',
            Icon: CustomerJoyIcon,
        },
    ];
    const CATEGORIES = [
        { id: 1, name: 'Mingle', image: '/images/logo/4.png', brand: 'Mingle', href: '/brands/mingle' },
        { id: 2, name: 'Vidjar', image: '/images/logo/2.png', brand: 'Vidjar', href: '/brands/vidjar' },
        { id: 3, name: 'Avasaa', image: '/images/logo/3.png', brand: 'Avasaa', href: '/brands/avasa' },
        { id: 4, name: 'PureNorth', image: '/images/logo/1.png', brand: 'PureNorth', href: '/brands/purenorth' },
    ];
    return (
        <div className="pt-24 lg:pt-[120px] manrope">
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
                        Redefining fashion with style and confidence
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
            {/*Our Story Section-1 */}
            <section className="py-5 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-9 pt-6">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        //variants={slideInLeft}
                        >
                            <h2 className="text-3xl lg:text-4xl md:text-5xl font-bold text-gray-800 text-center lg:text-start mb-6">From Humble Beginnings</h2>
                            <div className="space-y-4 text-xs lg:text-sm text-gray-600">
                                <p>
                                    Our story is rooted in experience, strengthened by collaboration, and driven by a shared belief in what Asian craftsmanship can achieve on the global stage.
                                </p>
                                <p>
                                    My journey in the textile industry began over three decades ago. Over the years, I had the privilege of working closely with international brands, immersing myself in every dimension of the craft—from fabric innovation to precision fit, from sourcing to final finish. Those years were not just about business; they were about understanding excellence at its core.
                                </p>
                                <p>
                                    Along this journey, I have been fortunate to have my wife, Nasrin Karim, by my side—not only as my life partner, but also as a trusted advisor and my Co. Founder. Her insight, steadfast encouragement, and commitment to our long-term vision have played an important role in shaping the foundation and governance of our growing organization.
                                </p>
                                <p>
                                    In 2012, during a professional visit to the Nordic region, a moment occurred that would quietly shape the future of our journey. At a showroom in Kolding, Denmark, I met Holger Heldbo. What began as a professional introduction turned into something far more meaningful. Over that weekend, he graciously showed me his town and invited me to experience a local evening festivity. It was there that a genuine friendship was born—one built not only on shared industry knowledge, but on mutual respect and cultural exchange.
                                </p>
                                <p>
                                    In the years that followed, our meetings in Denmark became frequent. Friendship deepened, trust strengthened, and our professional collaboration flourished across multiple global brands.
                                </p>
                                <p>
                                    In 2016, Holger introduced me to his close friend John Rasmussen and his wife, Mariann Lassen, during another business trip. That introduction expanded our circle—and our vision. What began as professional alignment soon evolved into brotherhood. Together, we bridged Asia and Europe through trust, shared values, and decades of collective expertise.
                                </p>
                            </div>
                        </motion.div>
                        <div
                            className="relative pb-15 lg:h-full lg:flex lg:flex-col"
                        >
                            <div className="grid grid-cols-2 gap-3 aspect-4/3 lg:aspect-auto lg:flex-1 lg:min-h-0">
                                <div className="relative rounded-sm overflow-hidden shadow-2xl">
                                    <Image
                                        src="/images/Mr. MD Tobarok Hossain Tipu.jpeg"
                                        alt="Mr. MD Tobarok Hossain Tipu — Founder"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                                <div className="relative rounded-sm overflow-hidden shadow-2xl">
                                    <Image
                                        src="/images/Nasrin Karim.png"
                                        alt="Nasrin Karim — Co-Founder"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-2 text-center shrink-0">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">MD Tobarok Hossain Tipu</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Founder</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Nasrin Karim</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Co-Founder</p>
                                </div>
                            </div>
                            {/* <div
                                className="absolute  -bottom-6 -right-3 lg:-right-5 text-2xl bg-[#1A2980] pinyon w-40 h-40 rounded-full z-10 shadow-xl flex items-center justify-center text-white font-bold  px-4 text-center"
                            >
                                Our Compelling Journey
                            </div> */}
                        </div>
                    </div>
                </div>
            </section>
            {/*Our Story Section-2 */}
            <section className="py-6 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* IMAGE */}
                        <div className="w-full lg:h-full">
                            <div className="grid grid-cols-2 gap-2 w-full aspect-4/3 lg:aspect-auto lg:h-full">
                                <div className="relative overflow-hidden rounded-sm shadow-xl">
                                    <Image
                                        src="/images/Holger Heldbo.jpeg"
                                        alt="Holger Heldbo — Board Member"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent text-white text-center py-3">
                                        <p className="text-sm font-semibold">Holger Heldbo</p>
                                        <p className="text-xs uppercase tracking-wide text-white/80">Board Member</p>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden rounded-sm shadow-xl">
                                    <Image
                                        src="/images/John Rasmussen.jpeg"
                                        alt="John Rasmussen — Board Member"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent text-white text-center py-3">
                                        <p className="text-sm font-semibold">John Rasmussen</p>
                                        <p className="text-xs uppercase tracking-wide text-white/80">Board Member</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TEXT */}
                        <motion.div
                            className="w-full"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <h2 className="text-lg lg:text-xl font-semibold text-[#1A2980] mb-3">
                                Yet one question consistently guided us:
                            </h2>

                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 leading-tight">
                                Why shouldn&apos;t globally respected brands originate from Asia — especially <span className='text-teal-600'>Bangladesh</span>?
                            </h2>

                            <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    Bangladesh stands among the world&apos;s largest apparel producers, yet few international brands proudly call it home. We believed that needed to change. That belief became our purpose.
                                </p>

                                <p>
                                    In 2018, I founded Avasaa in Bangladesh—a comfort-focused brand born in Asia, created to fill a space long overlooked. Throughout this journey, Nasrin played an active role in supporting the strategic direction of the business, helping ensure that our vision remained focused on building enduring brands rather than simply growing a company.
                                </p>

                                <p>
                                    During the global uncertainty of 2020, Holger and John formally joined forces with me, transforming our shared vision into a broader international platform. As our organization expanded, Nasrin became an integral part of our leadership as a Board Member, contributing to the governance and long-term development of the business.
                                </p>

                                <p>
                                    In 2021, we established Pure North in the European Union—our activewear collection designed for performance with refined Nordic sensibility.
                                </p>

                                <p>
                                    Alongside it, we launched Vidjar, our Classic Collection in the Nordic region—embodying timeless structure and understated sophistication.
                                </p>

                                <p>
                                    Most recently, in 2024, we introduced Mingle, an ethnic wear brand that gracefully blends heritage with contemporary expression.
                                </p>

                                <p>
                                    Today, Avasaa, Vidjar, Pure North, and Mingle stand united under one umbrella—MINGLE in Style—representing a collective philosophy: comfort, craftsmanship, and global confidence rooted in Bangladeshi excellence.
                                </p>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>
            {/*Our Story Section-4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {CATEGORIES.map((category) => (
                    <Link
                        key={category.id}
                        href={category.href}
                        prefetch={false}
                        className="group relative block cursor-pointer overflow-hidden rounded-none transition duration-300 h-full"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="w-full h-44 flex flex-col items-center justify-center p-4 gap-2">
                            <Image
                                src={category.image}
                                alt={category.name}
                                width={320}
                                height={120}
                                className="object-contain w-full h-26"
                                priority
                            />
                            {/* <span className="text-xs font-semibold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">{category.name}</span> */}
                        </div>
                    </Link>
                ))}
            </div>
            {/* Our Story Section-5 */}
            <section className="py-12 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center"
                    >

                        {/* Quote */}
                        <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                            This journey has been built with patience, resilience, and unwavering belief.
                            But in many ways, it is only the beginning.

                            With a dedicated team of industry experts who continue to support global
                            brands every day, we remain committed to delivering quality, precision fit,
                            and comfort that travels confidently across borders.

                            What we are building is more than a portfolio of brands. It is a platform —
                            proving that global luxury can proudly begin in Bangladesh.
                        </p>

                        {/* Divider */}
                        <div className="w-16 h-0.5 bg-gray-300 mx-auto my-8"></div>

                        {/* Signature */}
                        <div className="flex flex-col items-center">
                            <span className="pinyon font-semibold text-3xl text-gray-600">
                                MD Tobarok Hossain Tipu
                            </span>

                            <span className="text-lg text-gray-500 mt-1">
                                FOUNDER
                            </span>
                        </div>

                    </motion.div>

                </div>
            </section>
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
                                whileHover={{ y: -6 }}
                                className="relative rounded-sm shadow-lg overflow-hidden group bg-white border border-gray-100 p-8 flex flex-col items-center text-center gap-3 h-59 justify-center transition-shadow duration-300 hover:shadow-2xl"
                            >
                                <div className="w-24 h-24 transition-transform duration-300 ease-out group-hover:scale-110">
                                    <card.Icon className="w-full h-full" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">{card.title}</h3>
                                <p className="text-sm text-gray-600">{card.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            {/* <section className="py-4 lg:py-6 mb-12">
                <motion.h2 className="text-2xl text-center md:text-4xl font-bold text-gray-700 mb-2 lg:mb-4">
                    Our Supports
                </motion.h2>
                <motion.div variants={item} className="w-20 h-1 bg-[#44A08D] mx-auto mb-4 lg:mb-8" />
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
                                className="bg-teal-700 border border-gray-100 p-6 rounded-sm shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <p className="text-2xl md:text-4xl font-bold text-gray-100 mb-1 lg:mb-2">{stat.value}</p>
                                <p className="text-gray-100 text-sm lg:text-base">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section> */}

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
                        Join thousands of happy customers discovering amazing products every day.
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