import config from "@/config";

// Helper function for fetching variants
const fetchVariants = async (itemId) => {
  try {
    // You'll need to create this endpoint or use a different approach
    // For now, let's assume you have a way to get variants
    // Option 1: If you have a specific endpoint for variants
    const response = await fetch(
      `${config.API_BASE_URL}api/EItem/GetVariantsByItemId?itemId=${itemId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          TenantId: config.tenantId,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching variants:", error);
    return [];
  }
};

// Helper function for fetching stock
const fetchStock = async (itemId) => {
  try {
    // You'll need to create this endpoint or use a different approach
    const response = await fetch(
      `${config.API_BASE_URL}api/EItem/GetStockByItemId?itemId=${itemId}&whId=7`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          TenantId: config.tenantId,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching stock:", error);
    return [];
  }
};

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

const splitToArray = (val) =>
  val
    ? val.split(",").map((v) => v.trim()).filter(Boolean)
    : [];

export const getProductById = async (id) => {
  try {
    // Fetch main product
    const response = await fetch(
      `${config.API_BASE_URL}api/EItem/GetItemById?Id=${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          TenantId: config.tenantId,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch product (${response.status})`);
    }

    const p = await response.json();

    // Fetch variants and stock in parallel
    const [variants, stock] = await Promise.all([
      fetchVariants(id),
      fetchStock(id)
    ]);

    console.log('Fetched data:', {
      mainItem: p,
      variants,
      stock
    });

    // Process images
    const thumbnails = p.EcomThumbnailUrls
      ? p.EcomThumbnailUrls
        .split(",")
        .map(url => url.trim())
        .map(url => getFullImageUrl(url))
        .filter(Boolean)
      : [];
    const previews = p.EcomPreviewUrls
      ? p.EcomPreviewUrls
        .split(",")
        .map(url => url.trim())
        .map(url => getFullImageUrl(url))
        .filter(Boolean)
      : [];
    // Calculate prices from variants
    const variantPrices = variants.map(v => v.SellingPrice).filter(Boolean);
    const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;

    // Extract unique colors and sizes from variants
    const colors = [...new Set(variants.map(v => v.Color).filter(Boolean))];
    const sizes = [...new Set(variants.map(v => v.Size).filter(Boolean))];

    // Calculate discount
    const hasDiscount = p.Discount && p.Discount > 0;
    const discountedPrice = hasDiscount ? minPrice * (1 - p.Discount / 100) : null;

    // Calculate total stock
    const totalStock = stock.reduce((sum, s) => sum + (s.StockQty || 0), 0);

    // Build the complete product object
    return {
      id: p.Id,
      title: p.Description || p.StyleNo || `Product ${p.Id}`,
      Description: p.Description || "",
      AdditionalDescription: p.EcomDescription || "",
      Specification: p.EcomSpecification || "",
      styleNo: p.StyleNo || "",
      productType: p.ProductType || "",
      category: p.Category || "",
      brand: p.Brand || "",
      type: p.ProductType || "",
      gender: "unisex", // Default since not in DB
      status: p.Status || "",
      isWebsite:p.IsWebsite,
      entryDate: p.EntryDate ? new Date(p.EntryDate).toISOString() : null,

      // Images
      imgs: {
        thumbnails,
        previews: previews.length ? previews : thumbnails,
      },

      // Pricing
      price: minPrice,
      discountedPrice: discountedPrice,
      vat: p.Vat || 0,
      discount: p.Discount || 0,

      // Stock
      StockQty: totalStock,
      isStockAlertQty: p.IsStockAlertQty || 0,

      // Variants info
      colors: colors,
      sizes: sizes,

      // Additional fields for the component
      reviews: 0, // Default since not in DB

      // Raw data for reference
      variants: variants.map((v) => ({
        variantId: v.Id,
        barcode: v.Barcode || '',
        sku: v.SKU || '',
        color: v.Color || '',
        size: v.Size || '',
        costingPrice: v.CostingPrice || 0,
        sellingPrice: v.SellingPrice || 0,
        unit: v.Unit || '',
        vatType: v.VatType || '',
        vat: v.Vat || 0,
        vatCalculationType: v.VatCalculationType || '',
      })),

      stock: stock.map((s) => ({
        stockId: s.Id,
        variantId: s.VariantId,
        whId: s.WhId,
        receiveQty: s.ReceiveQty || 0,
        issueQty: s.IssueQty || 0,
        stockQty: s.StockQty || 0,
        returnQty: s.ReturnQty || 0,
        prevQty: s.PrevQty || 0,
        adjQty: s.AdjQty || 0,
      })),
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};