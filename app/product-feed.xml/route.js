import { getAllProducts } from "@/lib/server/getAllProducts";
import { getProductById } from "@/lib/server/getProductById";

// Revalidates alongside the rest of the product data (see getAllProducts.js / getProductById.js).
export const revalidate = 120;

const SITE_URL = "https://mingleinstylebd.com";
const CURRENCY = "BDT";

const escapeXml = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const absoluteUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

// Facebook only accepts: female, male, unisex
const mapGender = (gender) => {
  const g = (gender || "").toLowerCase();
  if (g === "men") return "male";
  if (g === "women") return "female";
  return "unisex";
};

// Runs `fn` over `items` with at most `limit` in flight at once, so the
// feed doesn't fire hundreds of simultaneous getProductById calls at the API.
async function withConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const buildItemXml = ({
  id,
  title,
  description,
  availability,
  price,
  salePrice,
  link,
  image,
  brand,
  category,
  gender,
  color,
  size,
  quantity,
}) => `  <item>
    <g:id>${escapeXml(id)}</g:id>
    <g:title><![CDATA[${title}]]></g:title>
    <g:description><![CDATA[${description}]]></g:description>
    <g:availability>${availability}</g:availability>
    <g:condition>new</g:condition>
    <g:price>${price}</g:price>${salePrice ? `\n    <g:sale_price>${salePrice}</g:sale_price>` : ""}
    <g:link>${escapeXml(link)}</g:link>
    <g:image_link>${escapeXml(image)}</g:image_link>
    <g:brand><![CDATA[${brand}]]></g:brand>${category ? `\n    <g:google_product_category><![CDATA[${category}]]></g:google_product_category>\n    <g:fb_product_category><![CDATA[${category}]]></g:fb_product_category>` : ""}
    <g:gender>${gender}</g:gender>
    <g:age_group>adult</g:age_group>${color ? `\n    <g:color><![CDATA[${color}]]></g:color>` : ""}${size ? `\n    <g:size><![CDATA[${size}]]></g:size>` : ""}
    <g:quantity_to_sell_on_facebook>${quantity}</g:quantity_to_sell_on_facebook>
  </item>`;

// Best-effort mapping from the store's internal category to a Google/Facebook
// product category string. Falls back to a generic apparel category.
const categoryFor = (product) => {
  const cat = (product.category || product.productType || "").trim();
  return cat ? `Apparel & Accessories > Clothing > ${cat}` : "Apparel & Accessories > Clothing";
};

export async function GET() {
  const items = [];

  try {
    const products = await getAllProducts();

    const detailed = await withConcurrency(products, 8, async (p) => {
      try {
        const detail = await getProductById(p.id);
        return { list: p, detail };
      } catch {
        return null; // skip products whose detail fetch fails rather than fail the whole feed
      }
    });

    for (const entry of detailed) {
      if (!entry) continue;
      const { list, detail } = entry;
      if (!list.slug || detail.isWebsite === false) continue;

      const title = detail.pmTitle || list.pmTitle || detail.title || list.title;
      const description =
        detail.pmDescription ||
        list.pmDescription ||
        detail.Description ||
        detail.AdditionalDescription ||
        title;
      const link = `${SITE_URL}/product/${list.slug}`;
      const image = absoluteUrl(detail.imgs?.previews?.[0] || detail.imgs?.thumbnails?.[0] || "");
      if (!image) continue; // image_link is required — skip items with no image
      const brand = detail.brand || list.brand || "Mingle In Style";
      const category = categoryFor(detail);
      const gender = mapGender(detail.gender);

      // One <item> per product, keyed on the numeric database id — this must
      // match the `content_ids` the site's pixel/GTM events send (see
      // lib/trackEvent.js, which always uses String(product.id), never SKU),
      // or Meta can't match catalog items back to pixel events.
      const discountFraction = detail.discount ? detail.discount / 100 : 0;
      const base = detail.price || list.sellingPrice || 0;
      const sale = discountFraction ? Math.round(base * (1 - discountFraction) * 100) / 100 : 0;

      // Total stock across all variants/warehouses of this product.
      const totalStock =
        detail.variants && detail.variants.length > 0
          ? (detail.stock || []).reduce((sum, s) => sum + (s.stockQty || 0), 0)
          : detail.StockQty || 0;

      // color/size only make sense when the product has exactly one variant —
      // with multiple variants there's no single correct value, so omit them.
      const singleVariant = detail.variants && detail.variants.length === 1 ? detail.variants[0] : null;

      items.push(
        buildItemXml({
          id: detail.id,
          title,
          description,
          availability: totalStock > 0 ? "in stock" : "out of stock",
          price: `${base.toFixed(2)} ${CURRENCY}`,
          salePrice: sale ? `${sale.toFixed(2)} ${CURRENCY}` : null,
          link,
          image,
          brand,
          category,
          gender,
          color: singleVariant?.color || "",
          size: singleVariant?.size || "",
          quantity: totalStock,
        })
      );
    }
  } catch (error) {
    console.error("Error building product feed:", error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Mingle In Style Product Feed</title>
  <link>${SITE_URL}</link>
  <description>Product catalog feed for Meta (Facebook/Instagram) Shops and Google Shopping</description>
${items.join("\n")}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
