'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // AnimatePresence used in HeroCarousel
import Image from 'next/image';
import Link from 'next/link';

// ── Brand config ──────────────────────────────────────────────────────────────
const BRANDS = [
  {
    id: 'Mingle',
    label: 'Mingle',
    accent: '#43C6AC',
    accentLight: '#55DBC0',
    tagline: 'Celebrating Tradition. Embracing Every Season.',
    description:
      'In Bangladesh, every season carries a story. Every festivity holds meaning. Every thread reflects heritage.\n\nMingle is an ethnic wear brand created to honor those moments — from vibrant Eid and celebrations to Pohela Boishakh, from wedding seasons to intimate family gatherings. Rooted in Bangladeshi tradition, Mingle designs garments that celebrate culture with grace, color, and authenticity.\n\nOur collections are inspired by the rhythm of the land — the monsoon blues, autumn\'s golden light, winter festivities, and spring\'s renewal. We reinterpret classic silhouettes with refined tailoring and thoughtful detailing, preserving tradition while presenting it with modern elegance.\n\nMingle is for those who celebrate where they come from — in every season, in every gathering, in every thread.\n\nBecause tradition is not just remembered. It is beautifully worn.',
    heroImage: 'https://drive.google.com/thumbnail?id=15NWvLe8aHAJCBtkoqMssES4EmDRrq0LP&sz=w1600',
    storyImage: 'https://drive.google.com/thumbnail?id=1KOdf-AbR904Sru7mhr-M5iLGMvc6dndC&sz=w1600',
    shopLink: '/shop?brand=MINGLE',
  },
  {
    id: 'Vidjar',
    label: 'Vidjar',
    accent: '#6366F1',
    accentLight: '#818CF8',
    tagline: 'Where Heritage Meets Modern Ease',
    description:
      'Style evolves — but identity remains.\n\nVidjar is a contemporary casualwear brand that seamlessly blends Bangladeshi heritage with Western influences. Designed for the modern individual, Vidjar reinterprets traditional craftsmanship through clean silhouettes, relaxed tailoring, and globally relevant design.\n\nRooted in Bangladesh and inspired by the world, our collections balance cultural depth with everyday versatility. Subtle traditional details meet modern cuts. Classic fabrics are refined with contemporary structure. The result is effortless casualwear with character.\n\nAt Vidjar, we believe casual does not mean ordinary. It means confident. It means expressive. It means wearable art shaped by culture and crafted for today\'s lifestyle.\n\nVidjar is for those who move between cultures with ease — who appreciate heritage but dress for the present.\n\nBecause true style doesn\'t choose between worlds. It brings them together.',
    heroImage: 'https://drive.google.com/thumbnail?id=1otFDvwzFbgySO1DHOabgZimvyDP8Sbo7&sz=w1600',
    storyImage: 'https://drive.google.com/thumbnail?id=1jPDUVztWiiEcF46UTNhHEJXa2WKuhv8B&sz=w1600',
    shopLink: '/shop?brand=VIDJAR',
  },
  {
    id: 'Avasaa',
    label: 'Avasaa',
    accent: '#6DBF9E',
    accentLight: '#86D4B4',
    tagline: 'It\'s a luxury you live in.',
    description:
      'Home is where life slows down, where conversations linger, and where your most authentic self exists. What you wear in those moments should feel just as intentional as what you wear outside.\n\nAvasaa is a comfort wear brand born in Bangladesh, created for individuals who believe home wear deserves elegance. We design elevated essentials using soft, breathable fabrics, refined silhouettes, and premium finishing — ensuring every piece feels effortless yet thoughtfully crafted.\n\nBlending Bangladeshi craftsmanship with modern sensibility, Avasaa transforms everyday loungewear into pieces that bring confidence, ease, and quiet sophistication to your daily rituals.\n\nBecause comfort isn\'t ordinary. It\'s a luxury you live in.',
    heroImage: 'https://drive.google.com/thumbnail?id=181N_gPifBQUWcbLZCuIsgrfojEgHIjYM&sz=w1600',
    storyImage: 'https://drive.google.com/thumbnail?id=1-Mo2SUjhddrjMjX-kdBPbBQqwkuQh02L&sz=w1600',
    shopLink: '/shop?brand=AVASAA',
  },
  {
    id: 'PureNorth',
    label: 'Pure North',
    accent: '#39B2AC',
    accentLight: '#4EC9C3',
    tagline: 'Move with discipline. Live with strength.',
    description:
      'Strength is a decision. Wellness is a commitment. Excellence is a lifestyle.\n\nPure North is a luxury activewear brand created for individuals who choose health over hesitation — who rise early, move with intention, and understand that true confidence is built through discipline.\n\nEvery piece is engineered to support movement without distraction — sculpted fits, technical fabrics, and precision finishing designed for endurance, strength, and recovery.\n\nThis is not fast fashion. This is performance with purpose — for those who understand that investing in their body is the highest form of self-respect.\n\nBecause health is not a trend. It is a lifestyle standard who loves themselves.',
    heroImage: 'https://drive.google.com/thumbnail?id=1fbIl9xPOY6Dob6luzXGuGEKQzpRnAZII&sz=w1600',
    storyImage: 'https://drive.google.com/thumbnail?id=1pPHrugl13L139E8lcSyeEVq2TxaQ_eKh&sz=w1600',
    shopLink: '/shop?brand=PureNorth',
  },
];

// ── Seasonal collections ──────────────────────────────────────────────────────
const COLLECTIONS = [
  {
    id: 'eid',
    label: 'Eid Collection',
    tag: 'Festive 2025',
    tagColor: '#F9C74F',
    description: 'Celebrate Eid in timeless elegance. Handcrafted silhouettes, rich fabrics, and festive hues for your most special moments.',
    image: '/images/about/Women.jpg',
    shopLink: '/shop?collection=eid',
    gradient: 'from-[#7C3AED] to-[#F59E0B]',
  },
  {
    id: 'puja',
    label: 'Puja Collection',
    tag: 'Festive 2024',
    tagColor: '#43C6AC',
    description: 'Rooted in heritage, styled for today. Vibrant ethnic wear that brings the spirit of the festival alive in every thread.',
    image: '/images/about/Kids.jpg',
    shopLink: '/shop?collection=puja',
    gradient: 'from-[#B45309] to-[#43C6AC]',
  },
  {
    id: 'summer',
    label: 'Summer Edit',
    tag: 'Summer 2025',
    tagColor: '#55DBC0',
    description: 'Light fabrics, easy silhouettes, effortless colour. Designed for long days, warm evenings, and everything in between.',
    image: '/images/about/sweat.jpg',
    shopLink: '/shop?collection=summer',
    gradient: 'from-[#0F0B30] to-[#55DBC0]',
  },
  {
    id: 'streetlux',
    label: 'Street Luxe',
    tag: 'Year Round',
    tagColor: '#6366F1',
    description: 'Where streetwear meets luxury. Bold cuts, premium materials, and a style that turns every pavement into a runway.',
    image: '/images/about/Men.jpg',
    shopLink: '/shop?collection=streetlux',
    gradient: 'from-[#1E1B4B] to-[#6366F1]',
  },
];

// ── Hero Carousel ─────────────────────────────────────────────────────────────
function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(prev => (prev + 1) % BRANDS.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(prev => (prev - 1 + BRANDS.length) % BRANDS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [next]);

  const brand = BRANDS[current];

  const variants = {
    enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
    exit: (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.55, ease: [0.7, 0, 0.84, 0] } }),
  };

  const textVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12 + 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] } }),
  };

  return (
    // calc(100vh - navbar height): 62px mobile / 118px desktop
    <div className="relative w-full overflow-hidden bg-[#0F0B30]"
      style={{ height: 'calc(100vh - 3.875rem)' }}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex flex-col md:flex-row"
        >
          {/* ── LEFT: Image ── fills half the screen, cropped to fit */}
          <div className="relative w-full md:w-1/2 h-[45%] md:h-full overflow-hidden bg-[#0F0B30]">
            <Image
              src={brand.heroImage}
              alt={brand.label}
              fill
              className="object-cover object-top"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Fade into text panel */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0F0B30]/70 hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0B30]/80 via-transparent to-transparent md:hidden" />
          </div>

          {/* ── RIGHT: Text ── */}
          <div
            className="relative w-full md:w-1/2 h-[55%] md:h-full flex flex-col justify-center px-8 md:px-14 lg:px-20 py-8 md:py-0"
            style={{ background: '#0F0B30' }}
          >
            {/* Glow */}
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ background: brand.accent }}
            />

            <div className="relative z-10 max-w-lg overflow-y-auto max-h-full pr-2">
              {/* Brand name — large */}
              <motion.h1
                custom={0} variants={textVariants} initial="hidden" animate="visible"
                className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-none mb-3 tracking-tight uppercase"
              >
                {brand.label}
              </motion.h1>

              {/* Tagline — small */}
              <motion.p
                custom={1} variants={textVariants} initial="hidden" animate="visible"
                className="text-sm md:text-base font-medium mb-5 tracking-wide"
                style={{ color: brand.accent }}
              >
                {brand.tagline}
              </motion.p>

              {/* Divider */}
              {/* <motion.div
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ delay: 0.55, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="h-0.5 mb-6 rounded-full"
                style={{ background: `linear-gradient(90deg, ${brand.accent}, transparent)` }}
              /> */}

              {/* Description */}
              <motion.div
                custom={2} variants={textVariants} initial="hidden" animate="visible"
                className="text-sm text-gray-300 leading-relaxed mb-8 space-y-3"
              >
                {brand.description.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div custom={3} variants={textVariants} initial="hidden" animate="visible">
                <Link href={brand.shopLink} prefetch={false}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-animated-gradient px-8 py-3.5 font-bold text-xs uppercase tracking-widest rounded-full shadow-xl transition-all duration-300"
                  >
                    Shop {brand.label}
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            {/* Slide counter */}
            <div className="absolute bottom-6 right-8 md:bottom-10 md:right-14 text-xs text-gray-500 font-mono tracking-widest select-none">
              <span className="text-white font-bold">{String(current + 1).padStart(2, '0')}</span>
              <span className="mx-1">/</span>
              {String(BRANDS.length).padStart(2, '0')}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button onClick={prev} aria-label="Previous"
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
      >←</button>
      <button onClick={next} aria-label="Next"
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
      >→</button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {BRANDS.map((b, i) => (
          <button
            key={b.id}
            onClick={() => go(i)}
            aria-label={`Go to ${b.label}`}
            className="transition-all duration-300"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: 99,
              background: i === current ? b.accent : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Collections Grid ──────────────────────────────────────────────────────────
function CollectionsGrid() {
  return (
    <section className="w-full lg:h-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 lg:h-full">
        {BRANDS.map((brand, i) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden group cursor-pointer aspect-[3/4] lg:aspect-auto lg:h-full"
          >
            {/* Photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.storyImage}
              alt={brand.label}
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
            />

            {/* Always-visible dark gradient at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Always-visible brand name at bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
              <p className="text-[10px] uppercase tracking-[0.3em] font-semibold mb-1"
                style={{ color: brand.accent }}>
                {brand.season}
              </p>
              <h3 className="text-lg font-black text-white leading-tight">
                {brand.label}
              </h3>
            </div>

            {/* Hover overlay — slides up */}
            <div
              className="absolute inset-0 flex flex-col justify-end px-5 pb-6 z-20
                         translate-y-full group-hover:translate-y-0
                         transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ background: `linear-gradient(to top, ${brand.accent}F0 0%, ${brand.accent}CC 40%, transparent 100%)` }}
            >
              {/* Accent line */}
              <div className="w-8 h-0.5 bg-white/60 mb-4 rounded-full" />

              <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-semibold mb-1">
                {brand.season}
              </p>
              <h3 className="text-xl font-black text-white mb-2 leading-tight">
                {brand.tagline}
              </h3>
              <p className="text-xs text-white/80 leading-relaxed line-clamp-3">
                {brand.description}
              </p>
            </div>

            {/* Top accent tag */}
            <div
              className="absolute top-4 left-4 z-30 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              {brand.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Collection Card ───────────────────────────────────────────────────────────
function CollectionCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden group cursor-pointer"
      style={{ aspectRatio: '3/4' }}
    >
      {/* Photo */}
      <Image
        src={item.image}
        alt={item.label}
        fill
        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
        sizes="(max-width: 768px) 50vw, 25vw"
      />

      {/* Static gradient — always visible at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* Always-visible bottom text */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 z-10 translate-y-0 group-hover:-translate-y-2 transition-transform duration-500">
        <span
          className="inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-white mb-2"
          style={{ background: item.tagColor }}
        >
          {item.tag}
        </span>
        <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
          {item.label}
        </h3>
      </div>

      {/* Hover overlay */}
      <div
        className={`absolute inset-0 z-20 flex flex-col justify-end px-6 pb-8
          opacity-0 group-hover:opacity-100
          translate-y-4 group-hover:translate-y-0
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          bg-gradient-to-t ${item.gradient}/90 via-black/60 from-black/80`}
      >
        <span
          className="inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-white mb-3 w-fit"
          style={{ background: item.tagColor }}
        >
          {item.tag}
        </span>
        <h3 className="text-2xl font-black text-white mb-3 leading-tight">
          {item.label}
        </h3>
        <p className="text-xs text-white/80 leading-relaxed mb-6 line-clamp-3">
          {item.description}
        </p>
        <Link href={item.shopLink} prefetch={false}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-animated-gradient px-7 py-3 text-xs font-black uppercase tracking-widest rounded-full shadow-xl w-fit"
          >
            Shop Collection →
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  return (
    <div className="min-h-screen manrope pt-[var(--header-height)] bg-white">

      {/* ── 1. HERO CAROUSEL ─────────────────────────────────────────── */}
      <HeroCarousel />

      {/* ── 2 + 3. INTRO + COLLECTIONS GRID (one screen) ────────────── */}
      <section className="flex flex-col lg:h-[calc(100vh-3.875rem)]">

        {/* Title — compact, fixed height */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex-shrink-0 text-center px-6 py-6"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-[#43C6AC] font-semibold mb-2">
            Our Collections
          </p>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-800 mb-2 leading-snug">
            Four Brands. One Vision.
          </h2>
        </motion.div>

        {/* Photos — fill remaining height on desktop, natural height on mobile */}
        <div className="lg:flex-1 lg:min-h-0">
          <CollectionsGrid />
        </div>

      </section>

      {/* ── 4. SEASONAL COLLECTIONS ──────────────────────────────────── */}
      {/* <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 pt-20 pb-8 text-center"
      >
        <p className="text-xs uppercase tracking-[0.35em] text-[#43C6AC] font-semibold mb-3">
          Seasonal Edits
        </p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
          Shop by Collection
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Curated drops for every season and occasion — hover to explore.
        </p>
      </motion.div>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COLLECTIONS.map((item, index) => (
            <CollectionCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </section> */}

      {/* ── 6. CTA FOOTER ────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-[#191654] to-[#43C6AC] py-16 lg:py-20 overflow-hidden"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[600px] h-[600px] rounded-full bg-[#55DBC0] blur-3xl" />
        </motion.div>

        <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.4em] text-[#55DBC0] font-semibold mb-4"
          >
            Ready to wear these looks?
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight"
          >
            Shop the Collection
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-sm mb-10 max-w-md mx-auto"
          >
            Every piece from our lookbook is available in the store. Find your size, choose your style.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/shop" prefetch={false}>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                className="btn-animated-gradient px-10 py-4 font-bold rounded-full shadow-xl transition-all duration-300 text-sm uppercase tracking-widest"
              >
                Shop Now
              </motion.button>
            </Link>
            <Link href="/contact" prefetch={false}>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                className="px-10 py-4 bg-transparent border-2 border-white/50 text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300 text-sm uppercase tracking-widest"
              >
                Get in Touch
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

    </div>
  );
}
