const SITE_URL = 'https://mingleinstylebd.com';

const ADMIN_PATHS = [
  '/add-discount', '/customer-feedback', '/discount-management', '/menu-list',
  '/menu', '/meta-title-description', '/blog-manage', '/due-collection',
  '/sell-report', '/stock-adjustment', '/delivery-charge', '/customer-billing',
  '/conversion-api', '/banner', '/manage-banner', '/brand-list', '/admin',
  '/discount', '/feature-control', '/manage-order-demo', '/manage-product',
  '/news-events-manage', '/pos-product', '/product-list',
];

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', ...ADMIN_PATHS],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
