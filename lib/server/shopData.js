import config from "@/config";
import { getAllProducts } from "./getAllProducts";
import { slugify } from "@/utils/slugify";

// Helper to fetch products from API
const fetchProductsFromApi = async (queryChecker) => {
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
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }

  return await response.json();
};

// Fetch all images from postblitemimg in one call (QueryChecker 7)
const fetchAllProductImages = async () => {
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
      next: { revalidate: 120 },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
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

// Helper to map API product to front-end format (no slug yet)
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
    slug: slugify(title), // may be overwritten below with deduplicated version
    styleNo: p.StyleNo,
    productType: p.ProductType,
    category: p.Category,
    brand: p.Brand,
    status: p.Status,
    description: p.Description,
    ecomSpecification: p.EcomSpecification,
    ecomDescription: p.EcomDescription,
    isWebsite: p.IsWebsite,
    sellingPrice: p.SellingPrice,
    EntryDate: p.EntryDate ? new Date(p.EntryDate).toISOString() : null,
    imgs: {
      thumbnails,
      previews: previews.length ? previews : thumbnails,
      altTexts,
    },
  };
};

// getProducts — all website-enabled products (QC=1)
// Delegates entirely to getAllProducts so slug deduplication is always consistent.
export const getProducts = async () => {
  return getAllProducts();
};

// getNewProducts — only Status='New' products (QC=3)
// Slugs are resolved against the FULL product list so they match getProductBySlug.
export const getNewProducts = async () => {
  try {
    const [newData, imageRows, allProducts] = await Promise.all([
      fetchProductsFromApi(3),
      fetchAllProductImages(),
      getAllProducts(), // needed for correct slug deduplication
    ]);

    // Build a slug lookup from the full product list (already deduplicated)
    const slugById = new Map(allProducts.map(p => [String(p.id), p.slug]));

    return newData.map(p => {
      const mapped = mapApiProductToProduct(p, imageRows);
      // Use the canonical slug from the full list; fall back to simple slugify
      const canonicalSlug = slugById.get(String(p.Id)) || mapped.slug;
      return { ...mapped, slug: canonicalSlug };
    });
  } catch (error) {
    console.error("Error fetching new products:", error);
    throw error;
  }
};
