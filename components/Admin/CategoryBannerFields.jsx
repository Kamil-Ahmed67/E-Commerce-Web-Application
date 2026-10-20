'use client';

import { MAIN_SITE_SCOPE, GENDERS, buildCategoryAccessKey } from '@/lib/categoryAccessKey';

// Three dropdowns (Brand/Scope, Gender, Product Type) that compose a
// collision-free AccessKey for product-category banners, e.g. "Mingle Men Tops".
export default function CategoryBannerFields({ scope, gender, productType, onChange, brands, productTypes }) {
  const update = (next) => {
    const merged = { scope, gender, productType, ...next };
    onChange(merged, buildCategoryAccessKey(merged.scope, merged.gender, merged.productType));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-medium text-[#4a5568] mb-1">Brand</label>
        <select
          value={scope}
          onChange={(e) => update({ scope: e.target.value })}
          className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1] bg-white"
        >
          <option value={MAIN_SITE_SCOPE}>Main Site (all brands)</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#4a5568] mb-1">Gender</label>
        <select
          value={gender}
          onChange={(e) => update({ gender: e.target.value })}
          className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1] bg-white"
        >
          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#4a5568] mb-1">Product Type</label>
        <select
          value={productType}
          onChange={(e) => update({ productType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1] bg-white"
        >
          <option value="">Select product type</option>
          {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );
}
