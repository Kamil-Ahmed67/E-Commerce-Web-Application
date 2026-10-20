'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiCalendar, FiArrowRight } from 'react-icons/fi';
import { MdArticle } from 'react-icons/md';
import { slugify } from '@/utils/slugify';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';


function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatDate(str) {
  if (!str) return '';
  try {
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return str; }
}

export default function BlogClient({ posts }) {
  const sorted = [...posts].sort((a, b) => {
    const aSort = a.Sortby ?? Infinity;
    const bSort = b.Sortby ?? Infinity;
    return aSort - bSort;
  });
  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className="pt-24 lg:pt-[120px] manrope">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: null }]} />
      </div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-linear-to-br from-[#0F0B30] via-[#191654] to-[#43C6AC] py-20 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-tr from-[#0F0B30]/80 via-[#191654]/60 to-[#43C6AC]/40" />
          <motion.div
            animate={{ x: [0, 60, 0], y: [0, -40, 0], rotate: [0, 10, 0], transition: { repeat: Infinity, duration: 18, ease: 'easeInOut' } }}
            className="absolute top-1/4 left-1/4 w-40 h-40 bg-[#55DBC0] rounded-lg opacity-20 blur-xl"
          />
          <motion.div
            animate={{ x: [0, -60, 0], y: [0, 30, 0], rotate: [0, -15, 0], transition: { repeat: Infinity, duration: 22, ease: 'easeInOut' } }}
            className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-[#FF6B6B] rounded-full opacity-20 blur-xl"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              Our{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#55DBC0] to-[#F9C74F]">Blog</span>
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '160px' }}
              transition={{ delay: 0.6, duration: 1 }}
              className="h-1.5 bg-linear-to-r from-[#55DBC0] via-[#F9C74F] to-[#FF6B6B] mx-auto mt-3 rounded-full"
            />
            <p className="mt-6 text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
              Style inspiration, fashion insights, and stories from Mingle
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <MdArticle className="mx-auto text-gray-200 mb-4" size={64} />
            <p className="text-gray-400 text-lg">No posts published yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-10"
              >
                <Link href={`/blog/${slugify(stripHtml(featured.Title))}`} prefetch={false} target="_blank" rel="noopener noreferrer">
                  <div className="group relative rounded-2xl overflow-hidden shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300 cursor-pointer">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div className="relative h-64 lg:h-auto min-h-72 overflow-hidden">
                        {featured.ThumbnailUrls ? (
                          <Image
                            src={featured.ThumbnailUrls}
                            alt={stripHtml(featured.Title)}
                            fill
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-teal-600 to-teal-800 flex items-center justify-center">
                            <MdArticle className="text-white/30" size={80} />
                          </div>
                        )}
                        <span className="absolute top-4 left-4 px-3 py-1 bg-teal-600 text-white text-xs font-semibold rounded-full">
                          Featured
                        </span>
                      </div>
                      <div className="p-8 lg:p-10 flex flex-col justify-center">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-teal-700 transition-colors">
                          {stripHtml(featured.Title)}
                        </h2>
                        {featured.ShortDescription && (
                          <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">
                            {featured.ShortDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                          <FiCalendar size={12} />
                          {formatDate(featured.EntryDate)}
                        </div>
                        <span className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all">
                          Read Article <FiArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post, i) => (
                  <motion.div
                    key={post.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                  >
                    <Link href={`/blog/${slugify(stripHtml(post.Title))}`} prefetch={false} target="_blank" rel="noopener noreferrer">
                      <div className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-shadow duration-300 h-full flex flex-col cursor-pointer">
                        <div className="relative h-48 overflow-hidden">
                          {post.ThumbnailUrls ? (
                            <Image
                              src={post.ThumbnailUrls}
                              alt={stripHtml(post.Title)}
                              fill
                              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                              <MdArticle className="text-white/30" size={48} />
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="text-base font-bold text-gray-800 mb-2 leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
                            {stripHtml(post.Title)}
                          </h3>
                          {post.ShortDescription && (
                            <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
                              {post.ShortDescription}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-400 border-t border-gray-100 pt-3 mt-auto">
                            <FiCalendar size={11} />
                            {formatDate(post.EntryDate)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
