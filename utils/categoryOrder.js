// utils/categoryOrder.js
// Pure sorting helpers for product-type categories. The actual order is
// admin-editable data (EcomtblCategoryOrder, via lib/server/categoryOrderData.js)
// — this file has no hardcoded category list so brand-new product types never
// require a code change; they just rank last until an admin places them.

// Strip everything but letters/digits so "T-Shirt", "T-shirt", "Tshirt" all match,
// same for "Co-Ords"/"Co-ords", "Suit/SKD", "Two-piece", etc.
export const normalizeCategoryName = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// [tier, position] — tier 0 beats tier 1 beats tier 2, regardless of position value,
// so a brand-specific order always wins over the Main Site fallback.
const rankTuple = (name, orderMap, fallbackMap) => {
    const key = normalizeCategoryName(name);
    if (orderMap?.has(key)) return [0, orderMap.get(key)];
    if (fallbackMap?.has(key)) return [1, fallbackMap.get(key)];
    return [2, Infinity];
};

// items: array of anything; orderMap: Map<normalizedName, SortOrder> (primary — e.g. brand-specific order);
// getName: how to read the category name off an item (defaults to identity for plain strings);
// fallbackMap: optional Map used for items with no entry in orderMap (e.g. the Main Site order).
export const sortByCategoryOrder = (items, orderMap, getName = (x) => x, fallbackMap = null) => {
    return [...items].sort((a, b) => {
        const [tierA, posA] = rankTuple(getName(a), orderMap, fallbackMap);
        const [tierB, posB] = rankTuple(getName(b), orderMap, fallbackMap);
        return tierA !== tierB ? tierA - tierB : posA - posB;
    });
};
