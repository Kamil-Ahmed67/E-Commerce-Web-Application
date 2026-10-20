// Pages whose meta title/description are hardcoded in source (export const metadata),
// not stored in EcomtblMenu/EcomtblSubMenu. Used by the admin Meta Title & Description
// page to display a read-only fallback for pages the DB-driven list can't see.
export const STATIC_PAGE_META = [
  {
    title: 'New Arrivals',
    path: '/new-arrival',
    metaTitle: 'New Arrivals — Mingle In Style',
    metaDescription: 'Discover the latest arrivals at Mingle In Style. Shop new styles for Women, Men, and all our top brands.',
  },
  {
    title: "Men's Fashion",
    path: '/men',
    metaTitle: "Men's Fashion — Mingle In Style",
    metaDescription: "Shop the latest men's clothing at Mingle In Style. Browse Panjabi, Shirts, Polo, Trousers and more.",
  },
  {
    title: "Women's Fashion",
    path: '/women',
    metaTitle: "Women's Fashion — Mingle In Style",
    metaDescription: "Shop the latest women's clothing at Mingle In Style. Browse Suits, Tops, Kurtis, Jeans and more.",
  },
  {
    title: 'Latest Offers',
    path: '/latest-offers',
    metaTitle: 'Latest Offers | Mingle In Style',
    metaDescription: 'Shop the latest deals and discounts at Mingle In Style.',
  },
  {
    title: 'Store Location',
    path: '/store-location',
    metaTitle: 'Store Location | Mingle In Style',
    metaDescription: "Find Mingle In Style's store location in Uttara, Dhaka.",
    // No dedicated parent menu for this page — file it under "Customer Service" (Id 25).
    parentMenuId: 25,
  },

  // Mingle — saved as submenus under the "Brands" menu (Id 23) when first edited.
  { title: 'Mingle', path: '/brands/mingle', metaTitle: 'Mingle | Where Style Meets Soul — Mingle In Style', metaDescription: 'Discover the Mingle brand — vibrant, inclusive fashion where style meets soul. Explore the full Mingle collection.', parentMenuId: 23, category: 'Brand' },
  { title: 'Mingle Men', path: '/brands/mingle/men', metaTitle: 'Mingle Men | Ethnic Wear for Men — Mingle In Style', metaDescription: 'Shop Mingle ethnic wear for men. Explore Ethnic wear, Pajama styles and more — rooted in tradition, made for today.', parentMenuId: 23, category: 'Brand' },
  { title: 'Mingle Women', path: '/brands/mingle/women', metaTitle: 'Mingle Women | Ethnic Wear for Women — Mingle In Style', metaDescription: 'Shop Mingle ethnic wear for women. Explore Sets, Tops, Bottoms and more — crafted to celebrate tradition with modern elegance.', parentMenuId: 23, category: 'Brand' },
  { title: 'Mingle Collection', path: '/brands/mingle/collection', metaTitle: 'Shop Mingle | Ethnic Wear Collection — Mingle In Style', metaDescription: 'Explore the Mingle ethnic wear collection. Shop Women and Men styles that celebrate tradition with modern elegance.', parentMenuId: 23, category: 'Brand' },
  { title: 'Mingle New Arrivals', path: '/brands/mingle/new-arrivals', metaTitle: 'Mingle New Arrivals | Fresh Ethnic Wear — Mingle In Style', metaDescription: 'Discover the latest new arrivals from Mingle. Fresh ethnic wear styles crafted for tradition and elegance.', parentMenuId: 23, category: 'Brand' },

  // Avasaa
  { title: 'Avasaa', path: '/brands/avasa', metaTitle: 'Avasaa | Feel Comfortable — Mingle In Style', metaDescription: 'Discover Avasaa — comfort wear designed around you. Soft, breathable, effortlessly wearable. Explore the Avasaa collection at Mingle In Style.', parentMenuId: 23, category: 'Brand' },
  { title: 'Avasaa Men', path: '/brands/avasa/men', metaTitle: 'Avasaa Men | Comfort Wear for Men — Mingle In Style', metaDescription: 'Shop Avasaa comfort wear for men. Soft, breathable Tops and Trousers made for all-day ease.', parentMenuId: 23, category: 'Brand' },
  { title: 'Avasaa Women', path: '/brands/avasa/women', metaTitle: 'Avasaa Women | Comfort Wear for Women — Mingle In Style', metaDescription: 'Shop Avasaa comfort wear for women. Soft, breathable Tops and Trousers made for all-day ease.', parentMenuId: 23, category: 'Brand' },
  { title: 'Avasaa Collection', path: '/brands/avasa/collection', metaTitle: 'Shop Avasaa | Comfort Wear Collection — Mingle In Style', metaDescription: 'Explore the Avasaa comfort wear collection. Shop Women and Men styles crafted for softness and everyday elegance.', parentMenuId: 23, category: 'Brand' },
  { title: 'Avasaa New Arrivals', path: '/brands/avasa/new-arrivals', metaTitle: 'Avasaa New Arrivals | Fresh Comfort Wear — Mingle In Style', metaDescription: 'Discover the latest new arrivals from Avasaa. Fresh comfort wear styles added just for you.', parentMenuId: 23, category: 'Brand' },

  // Vidjar
  { title: 'Vidjar', path: '/brands/vidjar', metaTitle: 'Vidjar | Wear the Dare — Mingle In Style', metaDescription: 'Discover Vidjar — bold, premium fashion for those who refuse to blend in. Explore the full Vidjar collection at Mingle In Style.', parentMenuId: 23, category: 'Brand' },
  { title: 'Vidjar Men', path: '/brands/vidjar/men', metaTitle: 'Vidjar Men | Classic Wear for Men — Mingle In Style', metaDescription: 'Shop Vidjar classic wear for men. Timeless Polo Shirts, T-Shirts, Shirts, Jeans, Trousers and Denim.', parentMenuId: 23, category: 'Brand' },
  { title: 'Vidjar Women', path: '/brands/vidjar/women', metaTitle: 'Vidjar Women | Classic Wear for Women — Mingle In Style', metaDescription: 'Shop Vidjar classic wear for women. Timeless Polo Shirts, T-Shirts, Tops, Shirts and Jeans.', parentMenuId: 23, category: 'Brand' },
  { title: 'Vidjar Collection', path: '/brands/vidjar/collection', metaTitle: 'Shop Vidjar | Classic Wear Collection — Mingle In Style', metaDescription: 'Explore the Vidjar classic wear collection. Shop Women and Men styles that define timeless modern fashion.', parentMenuId: 23, category: 'Brand' },
  { title: 'Vidjar New Arrivals', path: '/brands/vidjar/new-arrivals', metaTitle: 'Vidjar New Arrivals | Fresh Classic Wear — Mingle In Style', metaDescription: 'Discover the latest new arrivals from Vidjar. Fresh classic wear styles that define timeless modern fashion.', parentMenuId: 23, category: 'Brand' },

  // PureNorth
  { title: 'PureNorth', path: '/brands/purenorth', metaTitle: 'PureNorth | Crafted by Nature — Mingle In Style', metaDescription: 'Discover PureNorth — rugged, sustainable fashion inspired by the natural world. Explore the full PureNorth collection at Mingle In Style.', parentMenuId: 23, category: 'Brand' },
  { title: 'PureNorth Men', path: '/brands/purenorth/men', metaTitle: 'PureNorth Men | Active Wear for Men — Mingle In Style', metaDescription: 'Shop PureNorth active wear for men. Performance T-Shirts, Polo Shirts, Trousers and Shorts.', parentMenuId: 23, category: 'Brand' },
  { title: 'PureNorth Women', path: '/brands/purenorth/women', metaTitle: 'PureNorth Women | Active Wear for Women — Mingle In Style', metaDescription: 'Shop PureNorth active wear for women. Performance Tanks, Leggings, T-Shirts, Trousers and Shorts.', parentMenuId: 23, category: 'Brand' },
  { title: 'PureNorth Unisex', path: '/brands/purenorth/unisex', metaTitle: 'PureNorth Unisex | Active Wear — Mingle In Style', metaDescription: 'Shop PureNorth unisex active wear.', parentMenuId: 23, category: 'Brand' },
  { title: 'PureNorth Collection', path: '/brands/purenorth/collection', metaTitle: 'Shop PureNorth | Active Wear Collection — Mingle In Style', metaDescription: 'Explore the PureNorth active wear collection. Shop Women and Men performance styles engineered to move further.', parentMenuId: 23, category: 'Brand' },
  { title: 'PureNorth New Arrivals', path: '/brands/purenorth/new-arrivals', metaTitle: 'PureNorth New Arrivals | Fresh Active Wear — Mingle In Style', metaDescription: 'Discover the latest new arrivals from PureNorth. Fresh active wear performance styles engineered to move.', parentMenuId: 23, category: 'Brand' },
];
