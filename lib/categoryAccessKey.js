// Builds and parses banner AccessKey strings for product-category banners,
// e.g. "Mingle Men Tops" or "Women Kurti" (main site, no brand).
// Keeping this in one place avoids the brand/gender collisions that happened
// when the key only contained the product type.

export const SITE_ACCESS_KEYS = [
  'Home',
  'Home Men',
  'Home Women',
  'Mingle',
  'Men Banner',
  'Women Banner',
  'Mingle Men Banner',
  'Mingle Women Banner',
  'Vidjar Men Banner',
  'Vidjar Women Banner',
  'Avasaa Men Banner',
  'Avasaa Women Banner',
  'PureNorth Men Banner',
  'PureNorth Women Banner',
  'PureNorth Unisex Banner',
  'New Arrivals Banner',
  'New Arrivals Men',
  'New Arrivals Women',
  'New Arrivals Mingle',
  'New Arrivals Pure North',
  'New Arrivals Avasaa',
  'New Arrivals Vidjar',
  'Mingle Home',
  'Vidjar Home',
  'Avasaa Home',
  'PureNorth Home',
  'Mingle Collection Banner',
  'Vidjar Collection Banner',
  'Avasaa Collection Banner',
  'PureNorth Collection Banner',
  'Mingle Men Tile',
  'Mingle Women Tile',
  'Mingle New Arrivals Tile',
  'Vidjar Men Tile',
  'Vidjar Women Tile',
  'Vidjar New Arrivals Tile',
  'Avasaa Men Tile',
  'Avasaa Women Tile',
  'Avasaa New Arrivals Tile',
  'PureNorth Men Tile',
  'PureNorth Women Tile',
  'PureNorth Unisex Tile',
  'PureNorth New Arrivals Tile',
  'Mingle Story',
  'Vidjar Story',
  'Avasaa Story',
  'PureNorth Story',
  'Contact Hero',
  'Contact Store',
  'Location Hero',
  'Location Gallery',
];

export const MAIN_SITE_SCOPE = 'Main Site';
export const GENDERS = ['Men', 'Women', 'Unisex'];

export const buildCategoryAccessKey = (scope, gender, productType) => {
  if (!gender || !productType) return '';
  return scope && scope !== MAIN_SITE_SCOPE
    ? `${scope} ${gender} ${productType}`
    : `${gender} ${productType}`;
};

// Best-effort reverse lookup for editing an existing banner: figures out
// which {scope, gender, productType} (if any) produced this AccessKey.
export const parseCategoryAccessKey = (accessKey, brandNames, productTypes) => {
  if (!accessKey) return null;
  const lower = accessKey.toLowerCase();
  const sortedTypes = [...productTypes].sort((a, b) => b.length - a.length);

  for (const gender of GENDERS) {
    for (const type of sortedTypes) {
      if (lower === `${gender} ${type}`.toLowerCase()) {
        return { scope: MAIN_SITE_SCOPE, gender, productType: type };
      }
      for (const brand of brandNames) {
        if (lower === `${brand} ${gender} ${type}`.toLowerCase()) {
          return { scope: brand, gender, productType: type };
        }
      }
    }
  }
  return null;
};

export const fetchProductTypes = async (config) => {
  try {
    const res = await fetch(`${config.API_BASE_URL}api/DropDown/GetAllMaterialType`, {
      headers: { TenantId: config.tenantId },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return [...new Set(data.map(item => item.ChildName).filter(Boolean))];
  } catch {
    return [];
  }
};