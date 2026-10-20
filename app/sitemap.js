import { menuData } from '@/lib/server/menuData';
import { getAllProducts } from '@/lib/server/getAllProducts';

const SITE_URL = 'https://mingleinstylebd.com';

const STATIC_PATHS = [
  '/', '/shop', '/men', '/women', '/unisex', '/new-arrival', '/blog', '/latest-offers',
  '/news-events', '/about', '/contact', '/store-location', '/portfolio',
  '/terms', '/privacy-policy', '/replacement-policy', '/delivery-timeline',
];

const BRAND_SLUGS = ['mingle', 'avasa', 'vidjar', 'purenorth'];
const BRAND_SUBPATHS = ['', 'men', 'women', 'collection', 'new-arrivals'];

export default async function sitemap() {
  const urls = new Map();
  const add = (path) => urls.set(path, `${SITE_URL}${path}`);

  STATIC_PATHS.forEach(add);

  for (const brand of BRAND_SLUGS) {
    for (const sub of BRAND_SUBPATHS) {
      add(sub ? `/brands/${brand}/${sub}` : `/brands/${brand}`);
    }
  }
  add('/brands/purenorth/unisex');

  try {
    const menus = await menuData();
    for (const menu of menus) {
      if (menu.IsActive && menu.Path) add(menu.Path.split('?')[0]);
      for (const sub of menu.submenu || []) {
        if (sub.IsActive && sub.Path) add(sub.Path.split('?')[0]);
      }
    }
  } catch {
    // menu API unreachable — fall back to static paths only
  }

  try {
    const products = await getAllProducts();
    for (const product of products || []) {
      if (product.slug) add(`/product/${product.slug}`);
    }
  } catch {
    // product API unreachable — fall back to static + menu paths only
  }

  return Array.from(urls.values()).map((url) => ({
    url,
    lastModified: new Date(),
  }));
}
