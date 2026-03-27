import config from "@/config";
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
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }

  const data = await response.json();
  //console.log(`Received products (QueryChecker: ${queryChecker}):`, data);
  return data;
};
// Helper to convert DB path → full backend URL
const getFullImageUrl = (path) => {
  if (!path || typeof path !== "string") return null;

  const trimmed = path.trim();

  // Handle Google Drive /file/d/ links
  if (trimmed.includes("drive.google.com/file/d/")) {
    const match = trimmed.match(/\/d\/([^/]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
  }

  // If already full URL
  if (trimmed.startsWith("http")) return trimmed;

  return null;
};
// Helper to map API product to your front-end format
const mapApiProductToProduct = (p) => {
  // console.log("Mapping product:", p.Id, p.Title); // Debug log

  // Process thumbnails
  const thumbnails = p.EcomThumbnailUrls
    ? p.EcomThumbnailUrls
      .split(",")
      .map(url => url.trim())
      .map(url => getFullImageUrl(url))
      .filter(Boolean)
    : [];
  //console.log("Raw API product:", p);
  // Process previews
  const previews = p.EcomPreviewUrls
    ? p.EcomPreviewUrls
      .split(",")
      .map(url => url.trim())
      .map(url => getFullImageUrl(url))
      .filter(Boolean)
    : [];

  // console.log("Final thumbnails:", thumbnails);
  // console.log("Final previews:", previews);

  return {
    id: p.Id,
    styleNo: p.StyleNo,
    productType: p.ProductType,
    category: p.Category,
    brand: p.Brand,
    status: p.Status,
    description: p.Description,
    ecomSpecification: p.EcomSpecification,
    ecomDescription: p.EcomDescription,
    isWebsite:p.IsWebsite,
    sellingPrice: p.SellingPrice,
    EntryDate: p.EntryDate ? new Date(p.EntryDate).toISOString() : null,
    imgs: {
      thumbnails: thumbnails,
      previews: previews,
    },
  };
};

export const getProducts = async () => {
  try {
    const data = await fetchProductsFromApi(1);
    return data.map(mapApiProductToProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getNewProducts = async () => {
  try {
    const data = await fetchProductsFromApi(3);
    return data.map(mapApiProductToProduct);
  } catch (error) {
    console.error("Error fetching new products:", error);
    throw error;
  }
};
