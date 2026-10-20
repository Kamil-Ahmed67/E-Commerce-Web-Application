import config from "@/config";
import { slugify } from "@/utils/slugify";
import { canonicalBrand } from "@/utils/brandHelpers";
// Helper to fetch products from API
// cacheOptions lets callers opt into Next.js data-cache revalidation (storefront)
// while other callers (admin) can keep cache: "no-store" for always-fresh stock data.
const fetchProductsFromApi = async (queryChecker, cacheOptions = { cache: "no-store" }) => {
  const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "TenantId": config.tenantId,
    },
    body: JSON.stringify({
      operation: "",
      procedureName: "SP_EcomProductItem",
      parameters: {
        QueryChecker: queryChecker,
      },
    }),
    ...cacheOptions,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }

  const data = await response.json();
  //console.log(`Received products (QueryChecker: ${queryChecker}):`, data);
  return data;
};
// Helper to convert DB path → usable image URL
const getFullImageUrl = (path) => {
  if (!path || typeof path !== "string") return null;

  let trimmed = path.trim();

  // Already a proxy URL — return as-is
  if (trimmed.startsWith("/api/drive-image?id=")) return trimmed;
  if (trimmed.startsWith("/api/drive-proxy?id=")) return trimmed;

  // Old format: drive.google.com/file/d/FILE_ID/view → convert to proxy
  if (trimmed.includes("drive.google.com/file/d/")) {
    const match = trimmed.match(/\/d\/([^/?]+)/);
    if (match?.[1]) return `/api/drive-image?id=${match[1]}`;
  }

  if (trimmed.startsWith("//")) {
    trimmed = "https:" + trimmed;
  } else if (trimmed.startsWith("http://")) {
    trimmed = trimmed.replace("http://", "https://");
  }

  // Already a thumbnail or other https URL — return as-is
  if (trimmed.startsWith("https://")) return trimmed;

  // Fallback for other http sources
  if (trimmed.startsWith("http")) return trimmed;

  return null;
};

// Fetch all images from postblitemimg in one call (QueryChecker 7)
const fetchAllProductImages = async (cacheOptions = { cache: "no-store" }) => {
  try {
    const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TenantId": config.tenantId,
      },
      body: JSON.stringify({
        operation: "",
        procedureName: "SP_POStblItemImage",
        parameters: { QueryChecker: 7 },
      }),
      ...cacheOptions,
    });

    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

// Helper to map API product to your front-end format
const mapApiProductToProduct = (p, imageRows) => {
  const rows = imageRows.filter(r => String(r.ItemId || r.itemId) === String(p.Id));

  let thumbnails = rows
    .map(r => getFullImageUrl(r.EcomThumbnailUrls || r.ecomThumbnailUrls))
    .filter(Boolean);

  let previews = rows
    .map(r => getFullImageUrl(r.EcomPreviewUrls || r.ecomPreviewUrls))
    .filter(Boolean);

  let altTexts = rows.map(r => r.ImgAltText || r.imgAltText || '');

  // Fallback: product hasn't been saved through the postblitemimg flow yet
  if (rows.length === 0) {
    thumbnails = p.EcomThumbnailUrls
      ? p.EcomThumbnailUrls.split(",").map(u => getFullImageUrl(u.trim())).filter(Boolean)
      : [];
    previews = p.EcomPreviewUrls
      ? p.EcomPreviewUrls.split(",").map(u => getFullImageUrl(u.trim())).filter(Boolean)
      : [];
    altTexts = thumbnails.map(() => '');
  }

  const title = p.Description || p.StyleNo || `Product ${p.Id}`;
  return {
    id: p.Id,
    title,
    slug: '', // will be assigned with deduplication below
    styleNo: p.StyleNo,
    productType: p.ProductType,
    category: p.Category,
    brand: p.Brand,
    status: p.Status,
    description: p.Description,
    ecomSpecification: p.EcomSpecification,
    ecomDescription: p.EcomDescription,
    isWebsite: p.IsWebsite,
    pmTitle: p.PMTitle || '',
    pmDescription: p.PMDescription || '',
    sizeChartUrl: getFullImageUrl(p.SizeChartUrl) || '',
    sellingPrice: p.SellingPrice,
    EntryDate: p.EntryDate ? new Date(p.EntryDate).toISOString() : null,
    imgs: {
      thumbnails,
      previews: previews.length ? previews : thumbnails,
      altTexts,
    },
  };
};

// Assign deduplicated slugs — mirrors the exact logic in getProductBySlug.
// Sort by ID first so the order is always deterministic regardless of API return order.
const assignSlugs = (products) => {
  const sorted = [...products].sort((a, b) => Number(a.id) - Number(b.id));
  const seenSlugs = {};
  const slugMap = new Map();
  for (const p of sorted) {
    const base = slugify(p.title);
    seenSlugs[base] = (seenSlugs[base] || 0) + 1;
    const count = seenSlugs[base];
    slugMap.set(p.id, count === 1 ? base : `${base}-${count}`);
  }
  return products.map(p => ({ ...p, slug: slugMap.get(p.id) || slugify(p.title) }));
};

export const getAllProducts = async () => {
  try {
    const [data, imageRows] = await Promise.all([
      fetchProductsFromApi(1, { next: { revalidate: 120, tags: ['products'] } }),
      fetchAllProductImages({ next: { revalidate: 120, tags: ['products'] } }),
    ]);
    return assignSlugs(data.map(p => {
      const mapped = mapApiProductToProduct(p, imageRows);
      return { ...mapped, brand: canonicalBrand(mapped.brand) };
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Admin-only: returns ALL active products regardless of IsWebsite (QC=5)
export const getAdminProducts = async () => {
  try {
    const [data, imageRows] = await Promise.all([
      fetchProductsFromApi(5),
      fetchAllProductImages(),
    ]);
    return data.map(p => mapApiProductToProduct(p, imageRows));
  } catch (error) {
    console.error("Error fetching admin products:", error);
    throw error;
  }
};
