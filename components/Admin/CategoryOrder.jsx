'use client';

import { useEffect, useState } from 'react';
import { Reorder } from 'framer-motion';
import { FiMenu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProducts } from '@/lib/server/shopData';
import { isMenCategory, isWomenCategory } from '@/utils/genderHelpers';
import { sortByCategoryOrder } from '@/utils/categoryOrder';
import { getCategoryOrder, saveCategoryOrder } from '@/lib/server/categoryOrderData';
import { MAIN_SITE_SCOPE } from '@/lib/categoryAccessKey';

// productBrand matches the ALL-CAPS `brand` field stored on each product row;
// key matches the Brand column in EcomtblCategoryOrder (same convention as the
// existing banner AccessKey system in lib/categoryAccessKey.js).
const BRANDS = [
  { key: MAIN_SITE_SCOPE, label: 'Main Site', productBrand: null },
  { key: 'Vidjar', label: 'Vidjar', productBrand: 'VIDJAR' },
  { key: 'PureNorth', label: 'Pure North', productBrand: 'PURE NORTH' },
  { key: 'Mingle', label: 'Mingle', productBrand: 'MINGLE' },
  { key: 'Avasaa', label: 'Avasaa', productBrand: 'AVASAA' },
];

const GenderColumn = ({ title, gender, items, onChange, onSave, saving }) => (
  <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex-1 min-w-[280px]">
    <div className="bg-linear-to-r from-teal-700 to-teal-900 px-6 py-4 flex items-center justify-between">
      <h3 className="text-white font-medium">{title}</h3>
      <button
        onClick={onSave}
        disabled={saving}
        className="px-3 py-1.5 bg-white text-teal-800 text-xs font-semibold rounded-md hover:bg-teal-50 disabled:opacity-50 transition"
      >
        {saving ? 'Saving…' : 'Save Order'}
      </button>
    </div>
    <div className="p-3">
      {items.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-8">No {gender.toLowerCase()} product types found</p>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={onChange} className="space-y-2">
          {items.map((item) => (
            <Reorder.Item
              key={item}
              value={item}
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md cursor-grab active:cursor-grabbing select-none"
            >
              <FiMenu className="text-gray-400 shrink-0" />
              <span className="text-sm font-medium text-gray-800 truncate">{item}</span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  </div>
);

const CategoryOrder = () => {
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(MAIN_SITE_SCOPE);
  const [menItems, setMenItems] = useState([]);
  const [womenItems, setWomenItems] = useState([]);
  const [savingGender, setSavingGender] = useState(null);

  // Load the full product catalog once.
  useEffect(() => {
    let isMounted = true;
    getProducts()
      .then((data) => { if (isMounted) setAllProducts(data); })
      .catch((err) => { console.error(err); toast.error('Failed to load products'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  // Recompute the two lists whenever the selected brand (or the catalog) changes.
  useEffect(() => {
    if (loading) return;
    let isMounted = true;

    const brandMeta = BRANDS.find((b) => b.key === selectedBrand);
    const scoped = brandMeta?.productBrand
      ? allProducts.filter((p) => p.brand === brandMeta.productBrand)
      : allProducts;

    const isMainSite = selectedBrand === MAIN_SITE_SCOPE;

    Promise.all([
      getCategoryOrder(selectedBrand),
      isMainSite ? Promise.resolve(null) : getCategoryOrder(MAIN_SITE_SCOPE),
    ])
      .then(([brandOrder, mainOrder]) => {
        if (!isMounted) return;

        const menTypes = [...new Set(
          scoped.filter((p) => isMenCategory(p.category)).map((p) => p.productType).filter(Boolean)
        )];
        const womenTypes = [...new Set(
          scoped.filter((p) => isWomenCategory(p.category)).map((p) => p.productType).filter(Boolean)
        )];

        setMenItems(sortByCategoryOrder(menTypes, brandOrder.men, (x) => x, mainOrder?.men));
        setWomenItems(sortByCategoryOrder(womenTypes, brandOrder.women, (x) => x, mainOrder?.women));
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load category order');
      });

    return () => { isMounted = false; };
  }, [selectedBrand, allProducts, loading]);

  const handleSave = async (gender, items) => {
    setSavingGender(gender);
    try {
      const success = await saveCategoryOrder(selectedBrand, gender, items);
      if (success) {
        fetch('/api/revalidate-category-order', { method: 'POST' }).catch(() => {});
        toast.success(`${gender} order saved`);
      } else {
        toast.error(`Failed to save ${gender} order`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to save ${gender} order`);
    } finally {
      setSavingGender(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const selectedLabel = BRANDS.find((b) => b.key === selectedBrand)?.label;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="px-4 py-4 space-y-3">
        <p className="text-sm text-gray-600">
          Drag to reorder how product-type categories appear on the mobile menu, the Men/Women &quot;Shop by Category&quot;
          sections, and (for a specific brand) that brand&apos;s collection pages. New product types not yet placed
          here appear at the bottom.
        </p>

        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => (
            <button
              key={b.key}
              onClick={() => setSelectedBrand(b.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                selectedBrand === b.key
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {selectedBrand !== MAIN_SITE_SCOPE && (
          <p className="text-xs text-gray-500">
            Product types with no {selectedLabel}-specific position shown here fall back to the Main Site order on the storefront.
          </p>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          <GenderColumn
            title="Men"
            gender="Men"
            items={menItems}
            onChange={setMenItems}
            onSave={() => handleSave('Men', menItems)}
            saving={savingGender === 'Men'}
          />
          <GenderColumn
            title="Women"
            gender="Women"
            items={womenItems}
            onChange={setWomenItems}
            onSave={() => handleSave('Women', womenItems)}
            saving={savingGender === 'Women'}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryOrder;
