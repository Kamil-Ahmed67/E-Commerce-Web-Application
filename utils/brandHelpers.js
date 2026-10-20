// utils/brandHelpers.js

/**
 * Compare-safe brand key: lowercase, letters/digits only.
 * "PureNorth", "PURE NORTH" and "pure north" all become "purenorth".
 */
export const brandKey = (brand) =>
    String(brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const isSameBrand = (a, b) => brandKey(a) === brandKey(b);

/**
 * Canonical brand string used by the storefront pages (upper case, "PURE NORTH" with a space),
 * so DB casing/spacing differences never break brand filters.
 */
export const canonicalBrand = (brand) => {
    if (!brand) return brand;
    const key = brandKey(brand);
    if (key === 'purenorth') return 'PURE NORTH';
    return String(brand).trim().toUpperCase();
};
