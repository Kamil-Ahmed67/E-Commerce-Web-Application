/**
 * Converts a product title/description into a URL-safe slug.
 * Works on both server and client.
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[''`]/g, '')         // strip apostrophes (men's → mens)
    .replace(/[^a-z0-9\s-]/g, '') // remove remaining non-alphanumeric chars
    .replace(/\s+/g, '-')          // spaces → hyphens
    .replace(/-+/g, '-')           // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');      // trim leading/trailing hyphens
}
