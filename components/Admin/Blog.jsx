'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiExternalLink } from 'react-icons/fi';
import { MdArticle } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import config from '@/config';
import { slugify } from '@/utils/slugify';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatDate(str) {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return str; }
}

const Blog = () => {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', TenantId: config.tenantId },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomBlog',
          parameters: { QueryChecker: 1 },
        }),
        cache: 'no-store',
      });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', TenantId: config.tenantId },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomBlog',
          parameters: { QueryChecker: 4, Id: deleteTarget.Id },
        }),
      });
      const result = await res.json();
      if (result?.[0]?.AffectedRows > 0) {
        toast.success('Post deleted');
        setPosts((prev) => prev.filter((p) => p.Id !== deleteTarget.Id));
      } else {
        toast.error('Failed to delete post');
      }
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = posts
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        stripHtml(p.Title)?.toLowerCase().includes(q) ||
        p.ShortDescription?.toLowerCase().includes(q) ||
        p.Remarks?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.IsActive !== b.IsActive) return a.IsActive ? -1 : 1;
      const aSort = a.Sortby ?? Infinity;
      const bSort = b.Sortby ?? Infinity;
      return aSort - bSort;
    });

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MdArticle className="text-teal-600" size={24} />
            Blog Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {posts.length} post{posts.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => router.push('/blog-manage/add')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition shadow"
        >
          <FiPlus size={16} />
          Add New Post
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-linear-to-r from-teal-700 to-teal-900">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-light text-white uppercase tracking-wider">SL</th>
                  <th className="px-4 py-4 text-left text-xs font-light text-white uppercase tracking-wider">Cover</th>
                  <th className="px-4 py-4 text-left text-xs font-light text-white uppercase tracking-wider">Title</th>
                  <th className="px-4 py-4 text-left text-xs font-light text-white uppercase tracking-wider">Short Description</th>
                  <th className="px-4 py-4 text-left text-xs font-light text-white uppercase tracking-wider">Date</th>
                  <th className="px-4 py-4 text-left text-xs font-light text-white uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-right text-xs font-light text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-teal-500" />
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <MdArticle className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500 font-medium">
                        {search ? 'No posts match your search' : 'No blog posts yet'}
                      </p>
                      {!search && (
                        <button
                          onClick={() => router.push('/blog-manage/add')}
                          className="mt-3 text-sm text-teal-600 hover:underline"
                        >
                          Create your first post
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map((post, index) => (
                    <tr key={post.Id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 font-medium">{index + 1}</td>
                      <td className="px-4 py-3">
                        {post.ThumbnailUrls ? (
                          <img
                            src={post.ThumbnailUrls}
                            alt=""
                            className="w-14 h-10 object-contain rounded bg-gray-100"
                          />
                        ) : (
                          <div className="w-14 h-10 rounded bg-gray-100 flex items-center justify-center">
                            <MdArticle className="text-gray-300" size={20} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p
                          className="text-sm font-medium text-gray-800 truncate"
                          title={stripHtml(post.Title)}
                        >
                          {stripHtml(post.Title) || '(no title)'}
                        </p>
                        <Link
                          href={`/blog/${slugify(stripHtml(post.Title))}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline mt-0.5"
                        >
                          /blog/{slugify(stripHtml(post.Title))}
                          <FiExternalLink size={11} />
                        </Link>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-xs text-gray-500 truncate">{post.ShortDescription || '—'}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(post.EntryDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                          post.IsActive
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                          {post.IsActive ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/blog-manage/edit/${post.Id}`)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(post)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm z-10"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Post</h3>
              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to delete{' '}
                <strong>&ldquo;{stripHtml(deleteTarget.Title)}&rdquo;</strong>?
                This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Blog;
