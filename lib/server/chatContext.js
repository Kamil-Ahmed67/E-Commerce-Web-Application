import config from "@/config";

const spFetch = async (procedureName, parameters) => {
    try {
        const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "TenantId": config.tenantId,
            },
            body: JSON.stringify({ operation: "", procedureName, parameters }),
            cache: "no-store",
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

const filterByQuery = (items, query, fields) => {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    if (!words.length) return items;
    return items.filter(item => {
        const text = fields.map(f => String(item[f] || '')).join(' ').toLowerCase();
        return words.some(w => text.includes(w));
    });
};

const fetchSpecsForProduct = async (itemId) => {
    const rows = await spFetch("SP_POStblItemSpecification", { QueryChecker: 3, ItemId: Number(itemId) });
    return rows.map(r => `${r.Header || r.header || ''}: ${r.Details || r.details || ''}`).filter(s => s.trim() !== ':');
};

export const searchProducts = async (query) => {
    try {
        const [products, images] = await Promise.all([
            spFetch("SP_EcomProductItem", { QueryChecker: 1 }),
            spFetch("SP_POStblItemImage", { QueryChecker: 7 }),
        ]);

        // Detect price-sort intent
        const q = query.toLowerCase();
        const sortHighToLow = /most expensive|priciest|highest price|price high|expensive/i.test(q);
        const sortLowToHigh = /cheapest|lowest price|price low|most affordable|budget/i.test(q);
        const wantsFullCatalog = sortHighToLow || sortLowToHigh || /all products|what (do you have|products)|everything you (have|sell)/i.test(q);

        let filtered = filterByQuery(
            products,
            query,
            ["Description", "StyleNo", "Category", "Brand", "ProductType", "EcomSpecification", "EcomDescription"]
        );
        const isFiltered = filtered.length > 0;

        // Only fall back to the entire catalog for explicit "show me everything" / ranking
        // queries. Otherwise an unmatched specific query (e.g. a product name typo) must
        // return "not found" rather than silently substituting unrelated products, which
        // was causing the bot to answer about the wrong item.
        if (!isFiltered && !wantsFullCatalog) {
            return `No matching products found for "${query}". Tell the customer this exact item could not be found and ask them to double-check the name, or offer to have the team follow up.`;
        }

        const pool = isFiltered ? filtered : products;

        // Apply price sort if requested
        if (sortHighToLow) {
            pool.sort((a, b) => (Number(b.SellingPrice) || 0) - (Number(a.SellingPrice) || 0));
        } else if (sortLowToHigh) {
            pool.sort((a, b) => (Number(a.SellingPrice) || 0) - (Number(b.SellingPrice) || 0));
        }

        filtered = pool.slice(0, 15);

        if (filtered.length === 0) return "No products found.";

        // Fetch specs AND variants for matched products (gives full color/size/stock info)
        const specsMap = {};
        const variantsMap = {};
        await Promise.all(filtered.map(async p => {
            const [specs, variants, stockRows] = await Promise.all([
                fetchSpecsForProduct(p.Id).catch(() => []),
                fetch(`${config.API_BASE_URL}api/EItem/GetVariantsByItemId?itemId=${p.Id}`, {
                    headers: { "TenantId": config.tenantId }, cache: "no-store"
                }).then(r => r.ok ? r.json() : []).catch(() => []),
                fetch(`${config.API_BASE_URL}api/EItem/GetStockByItemId?itemId=${p.Id}&whId=7`, {
                    headers: { "TenantId": config.tenantId }, cache: "no-store"
                }).then(r => r.ok ? r.json() : []).catch(() => []),
            ]);

            if (specs.length > 0) specsMap[p.Id] = specs;

            const variantList = Array.isArray(variants) ? variants : [];
            const stockList = Array.isArray(stockRows) ? stockRows : [];
            const stockByVariant = {};
            stockList.forEach(s => { stockByVariant[s.VariantId || s.variantId] = Number(s.StockQty || s.stockQty) || 0; });

            const colors = [...new Set(variantList.map(v => v.Color || v.color).filter(Boolean))];
            const sizes = [...new Set(variantList.map(v => v.Size || v.size).filter(Boolean))];
            const totalStock = stockList.reduce((sum, s) => sum + (Number(s.StockQty || s.stockQty) || 0), 0);

            // Build per-variant detail lines (up to 10)
            const variantLines = variantList.slice(0, 10).map(v => {
                const vid = v.Id || v.id;
                const stock = stockByVariant[vid] ?? 0;
                return `    Color: ${v.Color || v.color || 'N/A'} | Size: ${v.Size || v.size || 'N/A'} | Price: ৳${v.SellingPrice || v.sellingPrice || 'N/A'} | Stock: ${stock > 0 ? `${stock} units` : 'Out of stock'}`;
            });

            variantsMap[p.Id] = { colors, sizes, totalStock, variantLines };
        }));

        const lines = filtered.map(p => {
            const img = images.find(i => String(i.ItemId || i.itemId) === String(p.Id));
            const thumb = img?.EcomThumbnailUrls || img?.ecomThumbnailUrls || '';
            const v = variantsMap[p.Id];
            const parts = [
                `Name: ${p.Description || 'N/A'}`,
                `Style No: ${p.StyleNo || 'N/A'}`,
                `Category: ${p.Category || 'N/A'}`,
                `Brand: ${p.Brand || 'N/A'}`,
                `Type: ${p.ProductType || 'N/A'}`,
                `Price: ৳${p.SellingPrice || 'N/A'}`,
                `Status: ${p.Status || 'N/A'}`,
            ];
            if (v) {
                if (v.colors.length) parts.push(`Available Colors: ${v.colors.join(', ')}`);
                if (v.sizes.length) parts.push(`Available Sizes: ${v.sizes.join(', ')}`);
                parts.push(`Total Stock: ${v.totalStock > 0 ? `${v.totalStock} units` : 'Out of stock'}`);
            }
            if (p.EcomSpecification) parts.push(`Details: ${p.EcomSpecification}`);
            if (p.EcomDescription) parts.push(`Description: ${p.EcomDescription}`);
            if (thumb) parts.push(`Image: ${thumb}`);
            const specs = specsMap[p.Id];
            if (specs && specs.length > 0) parts.push(`Specifications: ${specs.join(', ')}`);
            const result = [`- ${parts.join(' | ')}`];
            if (v && v.variantLines.length > 0) {
                result.push(`  Variants:\n${v.variantLines.join('\n')}`);
            }
            return result.join('\n');
        });

        return `Found ${filtered.length} product(s):\n${lines.join('\n\n')}`;
    } catch {
        return "Could not fetch products at this time.";
    }
};

export const getStoreStats = async () => {
    try {
        const products = await spFetch("SP_EcomProductItem", { QueryChecker: 1 });
        const active = products.filter(p => (p.Status || p.status || '').toLowerCase() === 'active');
        const total = products.length;
        const activeCount = active.length;
        const brands = [...new Set(products.map(p => p.Brand || p.brand).filter(Boolean))];
        const categories = [...new Set(products.map(p => p.Category || p.category).filter(Boolean))];
        return [
            `Total products in database: ${total}`,
            `Active/available products: ${activeCount}`,
            `Number of brands: ${brands.length}`,
            `Number of categories: ${categories.length}`,
        ].join('\n');
    } catch {
        return "Could not fetch store stats at this time.";
    }
};

export const getCategories = async () => {
    try {
        const cats = await spFetch("SP_EcomItem", { QueryChecker: 22 });
        const names = [...new Set(
            cats.map(c => c.CategoryName || c.categoryName || c.Name || c.name).filter(Boolean)
        )];
        if (names.length === 0) return "No categories found.";
        return `Available categories:\n${names.map(n => `- ${n}`).join('\n')}`;
    } catch {
        return "Could not fetch categories at this time.";
    }
};

export const getBrands = async () => {
    try {
        const res = await fetch(`${config.API_BASE_URL}api/EItem/GetAllBrand`, {
            headers: { "TenantId": config.tenantId },
            cache: "no-store",
        });
        const data = res.ok ? await res.json() : [];
        const brands = Array.isArray(data) ? data : [];
        const names = brands.map(b => b.BrandName || b.brandName || b.Name || b.name).filter(Boolean);
        if (names.length === 0) return "No brands found.";
        return `Available brands:\n${names.map(n => `- ${n}`).join('\n')}`;
    } catch {
        return "Could not fetch brands at this time.";
    }
};

export const getDeliveryInfo = async () => {
    try {
        const [districts, charges] = await Promise.all([
            spFetch("Sp_EcomDistricts", { QueryChecker: 1 }),
            spFetch("Sp_EcomDistricts", { QueryChecker: 2 }),
        ]);

        const lines = [];
        if (districts.length > 0) {
            const names = districts.map(d => d.DistrictName || d.districtName || d.Name || d.name).filter(Boolean);
            lines.push(`Delivery available to: ${names.join(', ')}`);
        }
        if (charges.length > 0) {
            lines.push('Delivery charges by area:');
            charges.forEach(c => {
                const district = c.DistrictName || c.districtName || '';
                const subDistrict = c.SubDistrictName || c.subDistrictName || c.Name || c.name || 'Area';
                const area = district ? `${subDistrict}, ${district}` : subDistrict;
                const fee = c.Amount ?? c.DeliveryCharge ?? c.deliveryCharge ?? c.Charge ?? c.charge ?? 'N/A';
                lines.push(`- ${area}: ৳${fee}`);
            });
        }
        return lines.length > 0 ? lines.join('\n') : "No delivery information found.";
    } catch {
        return "Could not fetch delivery information at this time.";
    }
};

export const getProductVariants = async (productName) => {
    try {
        const products = await spFetch("SP_EcomProductItem", { QueryChecker: 1 });
        const filtered = filterByQuery(products, productName, ["Description", "StyleNo", "Category", "Brand", "ProductType"]);

        if (filtered.length === 0) {
            return `No product matching "${productName}" was found. Tell the customer this exact item could not be found and ask them to double-check the name, or offer to have the team follow up.`;
        }

        const top3 = filtered.slice(0, 3);

        const results = await Promise.all(top3.map(async (p) => {
            const [variants, stockRows] = await Promise.all([
                fetch(`${config.API_BASE_URL}api/EItem/GetVariantsByItemId?itemId=${p.Id}`, {
                    headers: { "TenantId": config.tenantId }, cache: "no-store"
                }).then(r => r.ok ? r.json() : []).catch(() => []),
                fetch(`${config.API_BASE_URL}api/EItem/GetStockByItemId?itemId=${p.Id}&whId=7`, {
                    headers: { "TenantId": config.tenantId }, cache: "no-store"
                }).then(r => r.ok ? r.json() : []).catch(() => []),
            ]);

            const variantList = Array.isArray(variants) ? variants : [];
            const stockList = Array.isArray(stockRows) ? stockRows : [];

            const stockByVariant = {};
            stockList.forEach(s => { stockByVariant[s.VariantId || s.variantId] = s.StockQty || s.stockQty || 0; });

            const colors = [...new Set(variantList.map(v => v.Color || v.color).filter(Boolean))];
            const sizes = [...new Set(variantList.map(v => v.Size || v.size).filter(Boolean))];
            const totalStock = stockList.reduce((sum, s) => sum + (Number(s.StockQty || s.stockQty) || 0), 0);
            const prices = variantList.map(v => Number(v.SellingPrice || v.sellingPrice)).filter(n => n > 0);
            const minPrice = prices.length ? Math.min(...prices) : p.SellingPrice;
            const maxPrice = prices.length ? Math.max(...prices) : p.SellingPrice;
            const discount = p.Discount || p.discount || 0;

            const lines = [
                `Product: ${p.Description || p.StyleNo} (Style No: ${p.StyleNo || 'N/A'})`,
                `Colors: ${colors.length ? colors.join(', ') : 'N/A'}`,
                `Sizes: ${sizes.length ? sizes.join(', ') : 'N/A'}`,
                `Price: ৳${minPrice}${maxPrice !== minPrice ? `–৳${maxPrice}` : ''}${discount > 0 ? ` | ${discount}% discount applied` : ''}`,
                `Stock: ${totalStock > 0 ? `${totalStock} units available` : 'Out of stock'}`,
            ];

            if (variantList.length > 0) {
                lines.push('Variants:');
                variantList.slice(0, 15).forEach(v => {
                    const vid = v.Id || v.id;
                    const stock = stockByVariant[vid] ?? 0;
                    lines.push(`  - Color: ${v.Color || v.color || 'N/A'} | Size: ${v.Size || v.size || 'N/A'} | SKU: ${v.SKU || v.sku || v.Barcode || 'N/A'} | Price: ৳${v.SellingPrice || v.sellingPrice || 'N/A'} | Stock: ${stock}`);
                });
            }

            return lines.join('\n');
        }));

        return results.join('\n\n');
    } catch {
        return "Could not fetch product variants at this time.";
    }
};

export const getActiveOffers = async () => {
    try {
        const banners = await spFetch("SP_Banners", { QueryChecker: 3 });
        const withOffers = banners.filter(b => b.Title || b.title || b.Description || b.description);
        if (withOffers.length === 0) return "No active promotions found at this time.";

        const lines = ['Current active promotions and offers:'];
        withOffers.forEach(b => {
            const title = b.Title || b.title || '';
            const desc = b.Description || b.description || '';
            const key = b.AccessKey || b.accessKey || '';
            if (title || desc) {
                lines.push(`- ${title}${title && desc ? ': ' : ''}${desc}${key ? ` (${key})` : ''}`);
            }
        });
        return lines.join('\n');
    } catch {
        return "Could not fetch offers at this time.";
    }
};
