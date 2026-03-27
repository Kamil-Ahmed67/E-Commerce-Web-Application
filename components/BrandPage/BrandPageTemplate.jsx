'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

/* ── Floating orb ───────────────────────────────────────── */
function FloatingOrb({ style, color, delay = 0 }) {
    return (
        <motion.div
            className="absolute rounded-full blur-3xl pointer-events-none"
            style={{ background: color, opacity: 0.18, ...style }}
            animate={{ y: [0, -30, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
        />
    );
}

/* ── Testimonial Card ───────────────────────────────────── */
function TestimonialCard({ testimonial, accentColor, gradientFrom, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="relative rounded-none p-8 flex flex-col gap-5 transition-all duration-300"
            style={{
                background: 'rgba(255,255,255,0.2)',
                border: `1px solid ${accentColor}20`,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
            }}
        >
            {/* Quote mark */}
            <div
                className="text-6xl leading-none font-serif select-none -mb-2"
                style={{ color: `${accentColor}55` }}
            >
                &ldquo;
            </div>

            <p className="text-gray-700 text-base leading-relaxed italic flex-1">
                {testimonial.quote}
            </p>

            {/* Divider */}
            <div
                className="w-10 h-px rounded-full"
                style={{ background: accentColor }}
            />

            {/* Author */}
            <div>
                <p className="text-gray-900 font-bold text-sm">{testimonial.author}</p>
                <p className="text-xs mt-0.5 uppercase tracking-widest text-gray-500 font-medium">
                    {testimonial.role}
                </p>
            </div>

            {/* Star row */}
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: accentColor }} className="text-sm">★</span>
                ))}
            </div>
        </motion.div>
    );
}

export default function BrandPageTemplate({ brand }) {
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    };
    const fadeUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
    };
    const fadeRight = {
        hidden: { opacity: 0, x: 60 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    };

    const shopLink = `/shop?brand=${brand.name}`;

    return (
        <div
            className="min-h-screen overflow-x-hidden"
            style={{
                backgroundImage: "url('/mingle logos/Background.jpeg')",
                backgroundAttachment: 'fixed',
                backgroundSize: 'auto',
                backgroundRepeat: 'repeat',
                backgroundColor: '#f1f5f9'
            }}
        >
            {/*1. HERO BANNER*/}
            <section
                className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden w-full"
                style={{
                    background: `linear-gradient(135deg, ${brand.gradientFrom} 0%, ${brand.gradientVia} 50%, ${brand.gradientTo} 100%)`,
                }}
            >
                {/* Floating orbs */}
                <FloatingOrb color={brand.accentColor} style={{ width: 500, height: 500, top: '-10%', left: '-10%' }} delay={0} />
                <FloatingOrb color={brand.accentColor} style={{ width: 350, height: 350, bottom: '5%', right: '-5%' }} delay={3} />
                <FloatingOrb color={brand.accentColorLight} style={{ width: 250, height: 250, top: '40%', left: '60%' }} delay={6} />

                {/* Fine grid overlay */}
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(${brand.accentColor}33 1px, transparent 1px), linear-gradient(90deg, ${brand.accentColor}33 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Bottom fade overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `linear-gradient(to top, ${brand.gradientFrom}cc 0%, transparent 50%)` }}
                />

                {/* Content — pushed below fixed navbar */}
                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24 lg:pt-32 pb-24">

                    {/* Category pill */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-semibold uppercase tracking-widest"
                        style={{ background: `${brand.accentColor}20`, color: brand.accentColor, border: `1px solid ${brand.accentColor}40` }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: brand.accentColor }} />
                        {brand.category}
                    </motion.div>

                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-10 flex justify-center"
                    >
                        <div
                            className="px-8 py-5 rounded-none shadow-xl"
                            style={{
                                background: brand.logoBg || 'rgba(255,255,255,0.9)',
                                border: `1px solid ${brand.accentColor}30`,
                            }}
                        >
                            <Image
                                src={brand.logo}
                                alt={`${brand.name} logo`}
                                width={200}
                                height={80}
                                className="object-contain h-16 md:h-20 w-auto"
                                priority
                            />
                        </div>
                    </motion.div>

                    {/* Tagline — word-by-word reveal */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
                        className="mb-6 flex flex-wrap justify-center gap-x-4"
                    >
                        {brand.tagline.split(' ').map((word, i) => (
                            <motion.span
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, y: 50, rotateX: -40 },
                                    visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                                }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none"
                                style={{ color: brand.accentColor, display: 'inline-block' }}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </motion.div>

                    {/* Animated underline */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '120px' }}
                        transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-1 mx-auto mb-8 rounded-full"
                        style={{ background: `linear-gradient(90deg, transparent, ${brand.accentColor}, transparent)` }}
                    />

                    {/* Sub tagline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0, duration: 0.8 }}
                        className="text-lg md:text-2xl text-gray-700 max-w-2xl mx-auto mb-12 font-medium tracking-wide"
                    >
                        {brand.subTagline}
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link href={shopLink} prefetch={false}>
                            <motion.button
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn-animated-gradient px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300 shadow-xl"
                                style={{ boxShadow: `0 0 40px ${brand.accentColor}55` }}
                            >
                                Shop {brand.name}
                            </motion.button>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest border-2 text-gray-700 hover:text-gray-900 transition-all duration-300"
                            style={{ borderColor: `${brand.accentColor}80` }}
                            onClick={() => document.getElementById('brand-story')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Our Story
                        </motion.button>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-xs uppercase tracking-widest text-gray-500">Scroll</span>
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                        className="w-0.5 h-8 rounded-full"
                        style={{ background: `linear-gradient(to bottom, ${brand.accentColor}, transparent)` }}
                    />
                </motion.div>
            </section>

            {/* ── CENTRAL COLUMN (GLASSMORPHISM) ─────────────────── */}
            <div className=" my-4 md:my-6 relative overflow-hidden rounded-none px-4 md:px-8">

                {/* ── 2. BRAND STORY ─────────────────────────────────── */}
                <section id="brand-story" className="py-8 lg:py-12 bg-transparent relative z-10 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                            {/* Text */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={staggerContainer}
                            >
                                <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] mb-4 font-bold text-gray-900">
                                    Our Story
                                </motion.p>
                                <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                                    {brand.story.heading}
                                </motion.h2>
                                <motion.div variants={fadeUp} className="w-16 h-1 rounded-full mb-8" style={{ background: brand.accentColor }} />
                                <motion.div variants={staggerContainer} className="space-y-4">
                                    {brand.story.paragraphs.map((p, i) => (
                                        <motion.p key={i} variants={fadeUp} className="text-gray-700 leading-relaxed text-base">{p}</motion.p>
                                    ))}
                                </motion.div>
                                <motion.div variants={fadeUp} className="mt-6">
                                    <Link href={shopLink} prefetch={false}>
                                        <motion.button
                                            whileHover={{ scale: 1.04, x: 4 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="btn-animated-gradient px-8 py-3 rounded-full inline-flex items-center gap-3 font-bold text-sm uppercase tracking-widest transition-all shadow-md"
                                        >
                                            Explore Collection <span className="text-xl">→</span>
                                        </motion.button>
                                    </Link>
                                </motion.div>
                            </motion.div>

                            {/* Image — no badge/number overlay */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={fadeRight}
                                className="relative"
                            >
                                <div className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl" style={{ background: brand.accentColor }} />
                                <div className="relative rounded-none overflow-hidden shadow-2xl aspect-4/5">
                                    <Image
                                        src={brand.storyImage}
                                        alt={`${brand.name} story`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <div
                                        className="absolute inset-0"
                                        style={{ background: `linear-gradient(to top, rgba(255,255,255,0.5) 0%, transparent 60%)` }}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── 3. YOUTUBE VIDEO (renders only when youtubeId is set) ── */}
                {brand.youtubeId && (
                    <section
                        className="py-8 lg:py-12 relative z-10 bg-transparent overflow-hidden"
                    >
                        <div className="max-w-5xl mx-auto px-6 lg:px-12">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={staggerContainer}
                                className="text-center mb-8"
                            >
                                <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] mb-3 font-bold text-gray-900">
                                    Watch
                                </motion.p>
                                <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-gray-900">
                                    See {brand.name} in Action
                                </motion.h2>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="relative rounded-none overflow-hidden shadow-2xl"
                                style={{
                                    boxShadow: `0 0 80px ${brand.accentColor}30, 0 30px 60px rgba(0,0,0,0.6)`,
                                    border: `1px solid ${brand.accentColor}25`,
                                }}
                            >
                                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src={`https://www.youtube-nocookie.com/embed/${brand.youtubeId}?rel=0&modestbranding=1`}
                                        title={`${brand.name} — Brand Video`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="text-center mt-6"
                            >
                                <a
                                    href={`https://www.youtube.com/watch?v=${brand.youtubeId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
                                    style={{ color: brand.accentColor }}
                                >
                                    Watch on YouTube ↗
                                </a>
                            </motion.div>
                        </div>
                    </section>
                )}

            </div>

            {/* ── 4. BRAND VALUES (FULL-WIDTH, SOLID BG) ─────────── */}
            <section
                className="py-10 lg:py-16 relative z-10 w-full overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #f8f9fc 0%, #eef1f6 100%)' }}
            >
                <div className=" px-6 lg:px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                        className="text-center mb-10"
                    >
                        <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] mb-3 font-semibold" style={{ color: brand.accentColor }}>
                            What We Stand For
                        </motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-gray-900">
                            Our Values
                        </motion.h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {brand.values.map((val, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="rounded-none p-6  border transition-all duration-300 group cursor-default shadow-sm hover:shadow-lg"
                                style={{ background: 'rgba(255,255,255,0.85)', borderColor: `${brand.accentColor}25` }}
                            >
                                <div
                                    className="w-14 h-14 rounded-none flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300"
                                    style={{ background: `${brand.accentColor}15` }}
                                >
                                    {val.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{val.title}</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">{val.desc}</p>
                                <div className="w-8 h-0.5 mt-6 rounded-full transition-all duration-500 group-hover:w-16" style={{ background: brand.accentColor }} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS (TRANSPARENT, CENTERED) ────────────── */}
            <div className="mx-auto my-4 md:my-6 relative px-4 md:px-8 overflow-hidden">
                <section className="py-8 lg:py-12 bg-transparent relative z-10">
                    <div className="max-w-6xl mx-auto px-6 lg:px-12">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={staggerContainer}
                            className="text-center mb-10"
                        >
                            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] mb-3 font-bold text-gray-900">
                                What Our Customers Say
                            </motion.p>
                            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-gray-900">
                                Real Stories
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-gray-700 mt-4 max-w-xl mx-auto">
                                From our community — people who live and breathe {brand.name} every day.
                            </motion.p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {brand.testimonials.map((t, i) => (
                                <TestimonialCard
                                    key={i}
                                    testimonial={t}
                                    accentColor={brand.accentColor}
                                    gradientFrom={brand.gradientFrom}
                                    index={i}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* ── 5. SHOP CTA ────────────────────────────────────── */}
            <section
                className="relative py-12 lg:py-20 overflow-hidden w-full"
                style={{ background: `linear-gradient(135deg, ${brand.gradientFrom} 0%, ${brand.gradientVia} 60%, white 100%)` }}
            >
                <FloatingOrb color={brand.accentColor} style={{ width: 600, height: 600, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} delay={2} />

                <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.4 }}
                        variants={staggerContainer}
                    >
                        <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] mb-6 font-semibold" style={{ color: brand.accentColor }}>
                            Ready to Explore?
                        </motion.p>
                        <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
                            Discover the <br />
                            <span style={{ color: brand.accentColor }}>{brand.name}</span> Collection
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-gray-700 text-lg mb-12 max-w-xl mx-auto">
                            Browse the full {brand.name} range — every piece designed with purpose.
                        </motion.p>
                        <motion.div variants={fadeUp}>
                            <Link href={shopLink} prefetch={false}>
                                <motion.button
                                    whileHover={{ scale: 1.07 }}
                                    whileTap={{ scale: 0.96 }}
                                    className="btn-animated-gradient px-14 py-5 rounded-full font-black text-base uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-2xl"
                                    style={{
                                        boxShadow: `0 0 30px ${brand.accentColor}33`,
                                    }}
                                >
                                    Shop {brand.name} Now →
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
