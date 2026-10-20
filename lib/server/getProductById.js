import config from "@/config";
import { getGenderDisplayName } from "@/utils/genderHelpers";

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
        next: { revalidate: 300, tags: ['products'] },
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
        next: { revalidate: 300, tags: ['products'] },
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

  let trimmed = path.trim();

  // Already a proxy URL — return as-is (works locally and on live with credentials)
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

const fetchImagesFromDB = async (itemId) => {
  try {
    const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        TenantId: config.tenantId,
      },
      body: JSON.stringify({
        operation: "",
        procedureName: "SP_POStblItemImage",
        parameters: { QueryChecker: 7 },
      }),
      next: { revalidate: 300, tags: ['products'] },
    });

    if (!response.ok) return [];
    const data = await response.json();
    const rows = Array.isArray(data) ? data : [];
    // Filter in JS — same pattern as getAllProducts.js (QC=3 with ItemId param is unreliable)
    return rows.filter(r => String(r.ItemId || r.itemId) === String(itemId));
  } catch (error) {
    console.error("Error fetching images from postblitemimg:", error);
    return [];
  }
};


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
        next: { revalidate: 300, tags: ['products'] },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch product (${response.status})`);
    }

    const p = await response.json();

    // Fetch variants, stock, and images in parallel
    const [variants, stock, imgRecords] = await Promise.all([
      fetchVariants(id),
      fetchStock(id),
      fetchImagesFromDB(id),
    ]);

    // Process images — prefer postblitemimg rows, fall back to main product field
    let thumbnails, previews, altTexts;

    if (imgRecords.length > 0) {
      thumbnails = imgRecords
        .map(r => getFullImageUrl(r.EcomThumbnailUrls || r.ecomThumbnailUrls))
        .filter(Boolean);
      previews = imgRecords
        .map(r => getFullImageUrl(r.EcomPreviewUrls || r.ecomPreviewUrls))
        .filter(Boolean);
      altTexts = imgRecords.map(r => r.ImgAltText || r.imgAltText || '');
    } else {
      // Fallback: product hasn't been saved through the new flow yet
      thumbnails = p.EcomThumbnailUrls
        ? p.EcomThumbnailUrls.split(",").map(u => getFullImageUrl(u.trim())).filter(Boolean)
        : [];
      previews = p.EcomPreviewUrls
        ? p.EcomPreviewUrls.split(",").map(u => getFullImageUrl(u.trim())).filter(Boolean)
        : [];
      altTexts = thumbnails.map(() => '');
    }
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
      gender: getGenderDisplayName(p.Category) || "",
      status: p.Status || "",
      isWebsite: p.IsWebsite,
      pmTitle: p.PMTitle || '',
      pmDescription: p.PMDescription || '',
      sizeChartUrl: getFullImageUrl(p.SizeChartUrl) || '',
      entryDate: p.EntryDate ? new Date(p.EntryDate).toISOString() : null,

      // Images (sourced from postblitemimg)
      imgs: {
        thumbnails,
        previews: previews.length ? previews : thumbnails,
        altTexts,
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