import BlogClient from './BlogClient';
import config from '@/config';

async function getBlogPosts() {
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
    return Array.isArray(data) ? data.filter((p) => p.IsActive) : [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogClient posts={posts} />;
}
