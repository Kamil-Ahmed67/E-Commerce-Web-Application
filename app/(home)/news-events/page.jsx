'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCalendar, FiExternalLink, FiArrowRight } from 'react-icons/fi';
import { HiNewspaper } from 'react-icons/hi2';
const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    }),
};

function formatDate(str) {
    if (!str) return '';
    try {
        return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return str; }
}

export default function NewsEventsPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/news-events')
            .then((r) => r.json())
            .then((data) => setArticles(Array.isArray(data) ? data : []))
            .catch(() => setArticles([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="pt-24 lg:pt-[120px] manrope min-h-screen bg-[#f7f7f5]">

            {/* ── Hero Banner ── */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-gradient-to-br from-[#0F0B30] via-[#191654] to-[#43C6AC] py-20 overflow-hidden"
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
                        transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
                        className="absolute top-1/4 left-1/4 w-44 h-44 bg-[#55DBC0] rounded-full opacity-20 blur-2xl"
                    />
                    <motion.div
                        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
                        transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut' }}
                        className="absolute bottom-1/3 right-1/3 w-52 h-52 bg-[#F9C74F] rounded-full opacity-[0.12] blur-2xl"
                    />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6"
                    >
                        <HiNewspaper className="text-[#55DBC0] w-4 h-4" />
                        <span className="text-white/80 text-sm font-medium tracking-wide">Press & Media</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight"
                    >
                        News &amp;{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#55DBC0] to-[#F9C74F]">
                            Events
                        </span>
                    </motion.h1>

                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '120px' }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-1 bg-gradient-to-r from-[#55DBC0] to-[#F9C74F] mx-auto rounded-full mb-6"
                    />

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="text-lg md:text-xl text-white/80"
                    >
                        Stories, features &amp; milestones from the world of Mingle
                    </motion.p>
                </div>
            </motion.div>

            {/* ── "In the Press" label ── */}
            <div className="max-w-4xl mx-auto px-4 pt-14 pb-6">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex items-center gap-4"
                >
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-gray-300" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 shrink-0">
                        In the Press
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-300 to-gray-300" />
                </motion.div>
            </div>

            {/* ── Article Cards ── */}
            <div className="max-w-4xl mx-auto px-4 pb-20 space-y-5">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#32BBAB]" />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm">No news or events yet. Check back soon.</div>
                ) : articles.map((article, i) => (
                    <motion.article
                        key={article.Id}
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        custom={i}
                        viewport={{ once: true }}
                    >
                        <Link
                            href={article.Source || '#'}
                            target={article.Source ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="block group bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100 hover:shadow-[0_6px_32px_rgba(50,187,171,0.15)] hover:border-[#32BBAB]/30 transition-all duration-300 cursor-pointer"
                        >
                            {/* Top bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-[#32BBAB] to-[#0F0B30]" />

                            <div className="p-6 sm:p-8">
                                {/* Meta row */}
                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                    {article.NewsPortal && (
                                        <span className="inline-flex items-center gap-1.5 bg-[#0F0B30] text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                                            <HiNewspaper className="w-3 h-3" />
                                            {article.NewsPortal}
                                        </span>
                                    )}
                                    {article.EventDate && (
                                        <>
                                            <span className="text-gray-200">·</span>
                                            <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                                                <FiCalendar size={11} />
                                                {formatDate(article.EventDate)}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Headline */}
                                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug group-hover:text-[#32BBAB] transition-colors duration-200 mb-3">
                                    {article.Title}
                                </h2>

                                {/* Description */}
                                {article.Description && (
                                    <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                                        {article.Description}
                                    </p>
                                )}

                                {/* CTA row */}
                                <div className="flex items-center justify-between mt-2">
                                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#32BBAB] group-hover:bg-[#279487] text-white text-sm font-semibold rounded-full transition-colors duration-300">
                                        Read Full Article
                                        <FiExternalLink size={13} />
                                    </span>
                                    <span className="w-10 h-10 rounded-full border-2 border-[#32BBAB] group-hover:bg-[#32BBAB] flex items-center justify-center transition-all duration-300">
                                        <FiArrowRight size={16} className="text-[#32BBAB] group-hover:text-white transition-colors duration-300" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.article>
                ))}
            </div>

            {/* ── More Coming Soon ── */}
            <div className="bg-white border-t border-gray-100 py-14 px-4">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="max-w-lg mx-auto text-center"
                >
                    <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                        <HiNewspaper className="w-6 h-6 text-[#32BBAB]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">More Coverage Coming</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        We&apos;re regularly featured in press, fashion events, and brand stories.
                        Check back for the latest news from the Mingle universe.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
