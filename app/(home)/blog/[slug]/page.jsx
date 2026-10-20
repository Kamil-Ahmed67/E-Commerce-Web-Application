import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { slugify } from '@/utils/slugify';
import config from '@/config';

async function getAllPosts() {
  try {
    const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', TenantId: config.tenantId },
      body: JSON.stringify({
        operation: '',
        procedureName: 'SP_EcomBlog',
        parameters: { QueryChecker: 1 },
      }),
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

function cleanTitleHtml(html) {
  if (!html) return '';
  return html
    .replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, '')
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')
    .replace(/(<br\s*\/?>)+\s*$/gi, '')
    .trim();
}

function formatDate(str) {
  if (!str) return '';
  try {
    return new Date(str).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch { return str; }
}

function readingTime(html) {
  if (!html) return null;
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const posts = await getAllPosts();
  const post  = posts.find((p) => slugify(stripHtml(p.Title)) === slug);
  return {
    title: post?.MTitle || (post ? `${stripHtml(post.Title)} | Mingle Blog` : 'Blog | Mingle In Style'),
    description: post?.MDescription || post?.ShortDescription || '',
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const posts    = await getAllPosts();
const post     = posts.find((p) => slugify(stripHtml(p.Title)) === slug);
  if (!post) notFound();

  const mins = readingTime(post.Description);
  const date = formatDate(post.EntryDate);

  return (
    <>
      <div className="min-h-screen manrope pt-24 lg:pt-40" style={{ background: '#FAFAF8' }}>

        {/* Breadcrumb */}
        {/* <div className="border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 text-xs font-medium text-gray-400">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-gray-700 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gray-600 truncate max-w-[240px]">{stripHtml(post.Title)}</span>
          </div>
        </div> */}

        {/* Title block */}
        <div className="w-full px-6 pt-4 pb-5 text-center">

          <div
            className="blog-page-title max-w-4xl mx-auto"
            dangerouslySetInnerHTML={{ __html: cleanTitleHtml(post.Title) }}
          />

          <div className="flex items-center justify-center gap-2.5 mt-5 text-xs text-gray-400 font-medium">
            {date && <span>{date}</span>}
            {date && mins && <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />}
            {mins && <span>{mins}</span>}
          </div>
        </div>

        {/* Hero image — full width banner */}
        {post.ThumbnailUrls && (
          <div className="w-full mb-7" style={{ aspectRatio: '16 / 7' }}>
            <div className="relative w-full h-full">
              <Image
                src={post.ThumbnailUrls}
                alt={post.ImgAltText || stripHtml(post.Title)}
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        )}

        {/* Article body */}
        <article className="max-w-[900px] mx-auto px-6 pb-12">
          <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.Description }} />

          <div className="flex items-center gap-4 mt-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-300 text-xs tracking-widest font-bold">END</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-teal-400 hover:text-teal-600 transition-all shadow-sm hover:shadow group"
            >
              <FiArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              All Articles
            </Link>
            <p className="text-xs text-gray-400">
              Published by <span className="text-gray-600 font-semibold">Mingle Fashion</span>
            </p>
          </div>
        </article>
      </div>

      <style>{`
        .blog-page-title h1, .blog-page-title h2, .blog-page-title h3,
        .blog-page-title p, .blog-page-title div, .blog-page-title span {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 800; color: #111;
          line-height: 1.1; letter-spacing: -0.035em;
          margin: 0; padding: 0;
        }
        .blog-page-title u { text-decoration: underline; }
        .blog-page-title em, .blog-page-title i { font-style: italic; }
        .blog-page-title strong, .blog-page-title b { font-weight: 900; }
        .blog-body { font-size: 1.075rem; line-height: 1.75; color: #3d3d3d; overflow-wrap: break-word; word-break: break-word; }
        .blog-body p { margin: 0; padding: 0; color: #3d3d3d; }
        .blog-body p + p { margin-top: 0.5rem; }
        .blog-body h1 { font-size:1.875rem; font-weight:800; color:#111; letter-spacing:-0.025em; line-height:1.2; margin-top:1.25rem; margin-bottom:0.25rem; }
        .blog-body h2 { font-size:1.4rem; font-weight:700; color:#111; letter-spacing:-0.015em; line-height:1.3; margin-top:1.1rem; margin-bottom:0.2rem; padding-top:0.9rem; border-top:1px solid #e5e7eb; }
        .blog-body h3 { font-size:1.15rem; font-weight:700; color:#111; margin-top:0.9rem; margin-bottom:0.2rem; }
        .blog-body h4 { font-size:1rem; font-weight:700; color:#222; margin-top:0.6rem; margin-bottom:0.15rem; }
        .blog-body ul, .blog-body ol { padding-left:1.4rem; margin:0.6rem 0; }
        .blog-body ul { list-style:disc; }
        .blog-body ol { list-style:decimal; }
        .blog-body li { margin:0.25rem 0; color:#3d3d3d; padding-left:0.2rem; }
        .blog-body li::marker { color:#14b8a6; font-weight:700; }
        .blog-body a { color:#0d9488; font-weight:500; text-decoration:underline; text-decoration-color:#99f6e4; text-underline-offset:3px; transition:text-decoration-color 0.15s; }
        .blog-body a:hover { text-decoration-color:#0d9488; }
        .blog-body strong, .blog-body b { font-weight:700; color:#111; }
        .blog-body em, .blog-body i { font-style:italic; }
        .blog-body blockquote { margin:1.1rem 0; padding:0.75rem 1rem; background:#fff; border-left:3px solid #14b8a6; border-radius:0 8px 8px 0; font-size:1.05rem; font-style:italic; color:#555; line-height:1.6; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
        .blog-body img { max-width:100%; border-radius:10px; margin:1rem 0; box-shadow:0 4px 24px -4px rgba(0,0,0,0.12); }
        .blog-body hr { border:none; border-top:1px solid #e5e7eb; margin:1.25rem 0; }
        .blog-body code { background:#f3f4f6; color:#111; padding:0.15em 0.45em; border-radius:5px; font-size:0.88em; font-family:'Courier New',monospace; }
      `}</style>
    </>
  );
}
