'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FiFilter } from 'react-icons/fi';
import { normalizeGender } from '@/utils/genderHelpers';
import { normalizeCategoryName, sortByCategoryOrder } from '@/utils/categoryOrder';

const ProductCard = dynamic(() => import('../ProductCard/ProductCard'), {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-sm" />,
    ssr: false,
});

const AUDIENCES = [
    { key: 'women', label: 'Women', param: 'Women' },
    { key: 'men', label: 'Men', param: 'Men' },
];

const pill = (active, accent = false) =>
    `px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
        active
            ? accent
                ? 'bg-[#2EC4B6] border-[#2EC4B6] text-white'
                : 'bg-[#161819] border-[#161819] text-white'
            : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400'
    }`;

const ALL = 'ALL';

export default function ShopTheRange({ products = [] }) {
    const [audience, setAudience] = useState('women');
    const [selectedBrand, setBrand] = useState('MINGLE');
    const [category, setCategory] = useState(null);

    // Brand names normalized to uppercase so mixed-case DB values (e.g. "Mingle" vs "MINGLE")
    // don't produce duplicate/mismatched pills
    const brands = useMemo(
        () => [...new Set(products.map(p => p.brand?.toUpperCase()).filter(Boolean))].sort(),
        [products]
    );

    // Default to MINGLE; fall back to the first brand if MINGLE isn't in the data
    const brand = selectedBrand === ALL ? ALL : (brands.includes(selectedBrand) ? selectedBrand : brands[0] ?? null);

    // Products matching audience + brand — drives which categories are offered
    const scoped = useMemo(
        () =>
            products.filter(p =>
                (audience === ALL || normalizeGender(p.category) === audience) &&
                (brand === ALL || p.brand?.toUpperCase() === brand)
            ),
        [products, audience, brand]
    );

    const categories = useMemo(() => {
        const seen = new Map();
        scoped.forEach(p => {
            const key = normalizeCategoryName(p.productType);
            if (key && !seen.has(key)) seen.set(key, p.productType);
        });
        return sortByCategoryOrder([...seen.values()], null);
    }, [scoped]);

    // "All" shows every category; otherwise fall back to the first category when the
    // selection isn't available for this audience/brand
    const activeCategory =
        category === ALL
            ? null
            : categories.find(c => category && normalizeCategoryName(c) === normalizeCategoryName(category)) ??
              categories[0] ??
              null;

    const results = useMemo(() => {
        return scoped.filter(p =>
            !activeCategory || normalizeCategoryName(p.productType) === normalizeCategoryName(activeCategory)
        );
    }, [scoped, activeCategory]);

    const viewAllHref = useMemo(() => {
        const params = new URLSearchParams();
        if (audience !== ALL) params.set('gender', AUDIENCES.find(a => a.key === audience).param);
        if (brand && brand !== ALL) params.set('brand', brand);
        if (activeCategory) params.set('category', activeCategory);
        const qs = params.toString();
        return qs ? `/shop?${qs}` : '/shop';
    }, [audience, brand, activeCategory]);

    return (
        <section className="py-10 px-4 bg-white border-t border-gray-100">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-[#2EC4B6] mb-3">
                        Discover More
                    </p>
                    <h2 className="text-2xl md:text-3xl font-light text-gray-900">Shop the Range</h2>
                </div>

                <div className="bg-[#faf9f7] border border-gray-200 rounded-sm px-4 md:px-12 py-4 mb-8">
                    {/* Audience */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3 pb-3 border-b border-gray-200">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mr-2">Audience:</span>
                            <button onClick={() => setAudience(ALL)} className={pill(audience === ALL)}>
                                ALL
                            </button>
                            {AUDIENCES.map(a => (
                                <button key={a.key} onClick={() => setAudience(a.key)} className={pill(audience === a.key)}>
                                    {a.label.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Brands */}
                    <div className="flex flex-wrap items-center gap-2 py-3 border-b border-gray-200">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mr-2">Brands:</span>
                        <button onClick={() => setBrand(ALL)} className={pill(brand === ALL)}>
                            ALL
                        </button>
                        {brands.map(b => (
                            <button key={b} onClick={() => setBrand(b)} className={pill(brand === b)}>
                                {b}
                            </button>
                        ))}
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap items-center gap-2 pt-3">
                        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500 mr-2">
                            <FiFilter /> Categories:
                        </span>
                        <button onClick={() => setCategory(ALL)} className={pill(category === ALL, true)}>
                            ALL
                        </button>
                        {categories.map(c => (
                            <button key={c} onClick={() => setCategory(c)} className={pill(category !== ALL && activeCategory === c, true)}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results: one row of 6 */}
                {results.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                        {results.slice(0, 6).map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-40 text-gray-400 text-sm">
                        No products match your selection
                    </div>
                )}

                <div className="flex justify-center mt-8">
                    <Link
                        href={viewAllHref}
                        prefetch={false}
                        className="px-10 py-3 rounded-full bg-[#161819] text-white text-sm font-semibold uppercase tracking-widest hover:bg-[#2EC4B6] transition-colors"
                    >
                        View All
                    </Link>
                </div>
            </div>
        </section>
    );
}
