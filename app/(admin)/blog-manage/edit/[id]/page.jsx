'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import BlogPostForm from '@/components/Admin/BlogPostForm';
import config from '@/config';

export default function EditBlogPostPage({ params }) {
  const { id } = use(params);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
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
        const found = Array.isArray(data) ? data.find((p) => String(p.Id) === String(id)) : null;
        if (found) setPost(found);
        else setNotFound(true);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ECF0F4]">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ECF0F4]">
        <p className="text-gray-500">Post not found.</p>
      </div>
    );
  }

  return <BlogPostForm mode="edit" initialData={post} />;
}
