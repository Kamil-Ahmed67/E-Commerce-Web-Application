// lib/server/categoryOrderData.js
// Admin-editable per-gender product-type display order, backed by
// EcomtblCategoryOrder / SP_EcomtblCategoryOrdering (see db/category-order-migration.sql).
//
// Rows are scoped by Brand: 'Main Site' is the general/fallback order used
// site-wide (mobile menu, /men, /women); 'Vidjar' | 'PureNorth' | 'Mingle' |
// 'Avasaa' are brand-specific overrides for /brands/<brand>/men|women.

import config from "@/config";
import { normalizeCategoryName } from "@/utils/categoryOrder";
import { MAIN_SITE_SCOPE } from "@/lib/categoryAccessKey";

const postProcedure = async (parameters, cacheOptions = { cache: "no-store" }) => {
  const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      TenantId: config.tenantId,
    },
    body: JSON.stringify({
      operation: "",
      procedureName: "SP_EcomtblCategoryOrdering",
      parameters,
    }),
    ...cacheOptions,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }

  return response.json();
};

// Fetches every saved row (all brands, both genders) in one call — Next.js
// dedupes/caches identical fetches within a render, so calling getCategoryOrder()
// for several brands on the same page only hits the API once.
const fetchAllRows = () =>
  postProcedure({ QueryChecker: 1 }, { next: { revalidate: 300, tags: ["category-order"] } });

// Returns { men: Map<normalizedProductType, SortOrder>, women: Map<...> } for one brand.
// brand defaults to the general Main Site order.
export const getCategoryOrder = async (brand = MAIN_SITE_SCOPE) => {
  try {
    const rows = await fetchAllRows();
    const men = new Map();
    const women = new Map();

    (rows || [])
      .filter((row) => (row.Brand || MAIN_SITE_SCOPE) === brand)
      .forEach((row) => {
        const target = (row.Gender || "").toLowerCase() === "men" ? men : women;
        target.set(normalizeCategoryName(row.ProductType), row.SortOrder);
      });

    return { men, women };
  } catch (err) {
    console.error("Error fetching category order:", err);
    return { men: new Map(), women: new Map() };
  }
};

// brand: 'Main Site' | 'Vidjar' | 'PureNorth' | 'Mingle' | 'Avasaa'
// gender: 'Men' | 'Women'; orderedProductTypes: array of product type strings in the desired order
export const saveCategoryOrder = async (brand, gender, orderedProductTypes) => {
  const results = await Promise.all(
    orderedProductTypes.map((productType, index) =>
      postProcedure({
        QueryChecker: 2,
        Brand: brand,
        Gender: gender,
        ProductType: productType,
        SortOrder: index,
      }).catch((err) => {
        console.error(`Failed to save order for ${brand} ${gender} ${productType}:`, err);
        return null;
      })
    )
  );

  return results.every(Boolean);
};
