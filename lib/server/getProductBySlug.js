import { getAllProducts } from './getAllProducts';
import { getProductById } from './getProductById';
import { slugify } from '@/utils/slugify';

/**
 * Resolves a URL slug back to a full product.
 *
 * Strategy:
 *  1. Fetch the lightweight product list (id + title only needed).
 *  2. Build slugs the same way the listing pages do.
 *  3. If two products share a slug, the second gets "-2" appended, etc.
 *     This mirrors how links are generated so round-trips are always consistent.
 *  4. Once the matching id is found, fetch the full product details.
 */
export async function getProductBySlug(slug) {
  const products = await getAllProducts();

  // getAllProducts already assigns deduplicated slugs sorted by ID.
  // Just find the product whose slug matches directly.
  const listingProduct = products.find(p => p.slug === slug) || null;

  if (!listingProduct) return null;

  const fullProduct = await getProductById(listingProduct.id);

  // getAllProducts already fetched images via QC=7 and they're reliable.
  // If getProductById's own image fetch returned empty, use the listing images.
  if (fullProduct && !fullProduct.imgs?.thumbnails?.length && listingProduct.imgs?.thumbnails?.length) {
    fullProduct.imgs = listingProduct.imgs;
  }

  // GetItemById only returns SizeChartUrl once the backend build includes it;
  // the list query (SP QC=1) already carries it, so fall back to that.
  if (fullProduct && !fullProduct.sizeChartUrl && listingProduct.sizeChartUrl) {
    fullProduct.sizeChartUrl = listingProduct.sizeChartUrl;
  }

  return fullProduct;
}

/**
 * Returns the canonical slug for a given product id.
 * Used by the redirect page to compute the destination URL.
 */
export async function getSlugForProductId(id) {
  const products = await getAllProducts();
  const product = products.find(p => String(p.id) === String(id));
  return product?.slug || null;
}
