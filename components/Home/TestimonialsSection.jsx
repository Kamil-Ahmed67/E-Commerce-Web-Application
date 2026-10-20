'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Dummy data — replace with API data later. Shape: { id, name, location, avatarTone, rating, quote, product, brand, date }
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Nusrat Jahan',
    location: 'Dhaka',
    tone: 'from-[#2EC4B6] to-[#1b8f84]',
    rating: 5,
    quote:
      'The fabric quality genuinely surprised me. It feels far more premium than the price suggests, and the fit was perfect straight out of the box. I have already ordered two more pieces.',
    product: 'Cotton Kurti Set',
    brand: 'Mingle',
    date: 'August 2026',
  },
  {
    id: 2,
    name: 'Tanvir Ahmed',
    location: 'Chattogram',
    tone: 'from-[#f59e0b] to-[#b45309]',
    rating: 5,
    quote:
      'Ordered on Sunday, delivered by Tuesday. The packaging was neat, the shirt looked exactly like the photos, and the size guide was spot on. Easily my go-to store now.',
    product: 'Slim Fit Oxford Shirt',
    brand: 'Vidjar',
    date: 'July 2026',
  },
  {
    id: 3,
    name: 'Farhana Rahman',
    location: 'Sylhet',
    tone: 'from-[#8b5cf6] to-[#5b21b6]',
    rating: 5,
    quote:
      'I was nervous about buying clothes online, but the exchange process was effortless. Support answered within minutes and the colours are rich and true to life.',
    product: 'Printed Pashmina Scarf',
    brand: 'Avasaa',
    date: 'July 2026',
  },
  {
    id: 4,
    name: 'Rafiul Islam',
    location: 'Rajshahi',
    tone: 'from-[#0ea5e9] to-[#0369a1]',
    rating: 4,
    quote:
      'Clean, minimal designs that work for the office and weekends alike. Stitching is tidy and it has held up beautifully after many washes.',
    product: 'Everyday Polo',
    brand: 'Pure North',
    date: 'June 2026',
  },
];

const AUTOPLAY_MS = 7000;

const initials = (name) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

function Stars({ value, className = 'w-4 h-4' }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 20 20"
          className={`${className} ${n <= value ? 'text-[#f5b301]' : 'text-gray-200'}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function Avatar({ person, size = 'w-12 h-12 text-base' }) {
  return (
    <span
      aria-hidden="true"
      className={`${size} shrink-0 rounded-full bg-gradient-to-br ${person.tone} text-white font-medium tracking-wide flex items-center justify-center`}
    >
      {initials(person.name)}
    </span>
  );
}

export default function TestimonialsSection() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false); // hover / focus
  const [userStopped, setUserStopped] = useState(false); // explicit pause button
  const [inView, setInView] = useState(false);
  const rootRef = useRef(null);
  const touchX = useRef(null);

  const count = TESTIMONIALS.length;
  const current = TESTIMONIALS[index];
  const playing = !paused && !userStopped && inView && !reduceMotion;

  const go = useCallback(
    (next, direction) => {
      setDir(direction ?? (next > index ? 1 : -1));
      setIndex((next + count) % count);
    },
    [index, count]
  );

  // Only run the timer while the section is on screen (saves work off-screen)
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => go(index + 1, 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [playing, index, go]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') go(index + 1, 1);
    if (e.key === 'ArrowLeft') go(index - 1, -1);
  };

  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  };

  const slide = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 40 * dir },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 * dir },
      };

  return (
    <section
      ref={rootRef}
      aria-labelledby="testimonials-heading"
      className="py-10 px-4 bg-white border-t border-gray-100"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-[#2EC4B6] mb-3">
            Loved by our customers
          </p>
          <h2 id="testimonials-heading" className="text-2xl md:text-3xl font-light text-gray-900">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-4">
          {/* Trust summary */}
          <div className="rounded-2xl bg-[#161819] text-white p-6 md:p-8 flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-center gap-4 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#2EC4B6]/20 blur-3xl"
            />
            <div className="relative">
              <p className="text-5xl md:text-6xl font-light leading-none">
                4.9<span className="text-xl text-white/50">/5</span>
              </p>
              <div className="mt-3">
                <Stars value={5} className="w-5 h-5" />
              </div>
            </div>
            <div className="relative text-right lg:text-left">
              <p className="text-sm text-white/80 leading-relaxed">
                Based on <span className="text-white font-semibold">2,400+</span> verified reviews across all four brands.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#2EC4B6]">
                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M10 1l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V4l7-3zm-1 11.6l5-5-1.2-1.2L9 10.2 7.2 8.4 6 9.6l3 3z" />
                </svg>
                Verified buyers
              </p>
            </div>
          </div>

          {/* Featured testimonial */}
          <div
            role="group"
            aria-roledescription="carousel"
            aria-label="Customer testimonials"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={onTouchEnd}
            className="relative rounded-2xl border border-gray-100 bg-gray-50/60 p-6 md:p-10 flex flex-col justify-between min-h-[340px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2EC4B6]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 48 36"
              className="absolute top-6 right-6 md:top-8 md:right-10 w-12 md:w-16 text-[#2EC4B6]/15"
              fill="currentColor"
            >
              <path d="M0 36V19.5C0 8 6 1.5 17 0l1.5 5C12.5 6.5 10 10 10 14h8v22H0zm27 0V19.5C27 8 33 1.5 44 0l1.5 5C39.5 6.5 37 10 37 14h8v22H27z" />
            </svg>

            <div aria-live={playing ? 'off' : 'polite'} aria-atomic="true" className="relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.figure
                  key={current.id}
                  {...slide}
                  transition={{ duration: reduceMotion ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                  aria-label={`Testimonial ${index + 1} of ${count}`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <Stars value={current.rating} className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-500">{current.brand}</span>
                  </div>

                  <blockquote className="text-lg md:text-2xl font-light leading-relaxed text-gray-900">
                    &ldquo;{current.quote}&rdquo;
                  </blockquote>

                  <figcaption className="mt-8 flex items-center gap-4">
                    <Avatar person={current} />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {current.name}
                        <svg
                          viewBox="0 0 20 20"
                          className="w-4 h-4 text-[#2EC4B6]"
                          fill="currentColor"
                          role="img"
                          aria-label="Verified buyer"
                        >
                          <path d="M10 1l2.2 1.6 2.7-.1.9 2.6 2.2 1.6-.8 2.6.8 2.6-2.2 1.6-.9 2.6-2.7-.1L10 19l-2.2-1.6-2.7.1-.9-2.6L2 13.3l.8-2.6L2 8.1l2.2-1.6.9-2.6 2.7.1L10 1zm-1 11.4l4.3-4.3-1.1-1.1L9 10.2 7.8 9 6.7 10.1 9 12.4z" />
                        </svg>
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {current.location} · Purchased {current.product} · {current.date}
                      </p>
                    </div>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="relative mt-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2" role="group" aria-label="Choose testimonial">
                {TESTIMONIALS.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show testimonial from ${t.name}`}
                    aria-current={i === index}
                    className="group h-6 flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2EC4B6] rounded-full"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-300 overflow-hidden ${
                        i === index ? 'w-10 bg-gray-200' : 'w-3 bg-gray-300 group-hover:bg-gray-400'
                      }`}
                    >
                      {i === index && (
                        <span
                          key={`${index}-${playing}`}
                          className="block h-full bg-[#2EC4B6] origin-left"
                          style={
                            playing
                              ? { animation: `testimonialProgress ${AUTOPLAY_MS}ms linear forwards` }
                              : { width: '100%' }
                          }
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {!reduceMotion && (
                  <button
                    type="button"
                    onClick={() => setUserStopped((v) => !v)}
                    aria-label={userStopped ? 'Play automatic rotation' : 'Pause automatic rotation'}
                    className="w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:border-[#2EC4B6] hover:text-[#2EC4B6] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2EC4B6]"
                  >
                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                      {userStopped ? <path d="M6 4l10 6-10 6V4z" /> : <path d="M5 4h3.5v12H5zM11.5 4H15v12h-3.5z" />}
                    </svg>
                  </button>
                )}
                {[
                  { label: 'Previous testimonial', d: 'M12.5 4L6.5 10l6 6', step: -1 },
                  { label: 'Next testimonial', d: 'M7.5 4l6 6-6 6', step: 1 },
                ].map(({ label, d, step }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(index + step, step)}
                    aria-label={label}
                    className="w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:bg-[#161819] hover:border-[#161819] hover:text-white active:scale-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2EC4B6]"
                  >
                    <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={d} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes testimonialProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
