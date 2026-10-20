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
const ALL = 'ALL';
const MAX_PRODUCTS = 10;

// Audience + Category filter for a single brand's products (brand is fixed by the page)
export default function BrandProductFilter({ brand, products = [] }) {
    const [audience, setAudience] = useState(ALL);
    const [category, setCategory] = useState(ALL);

    const pill = (active, accent = false) =>
        `px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
            active
                ? 'text-white'
                : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400'
        }`;
    const activeStyle = (accent) => ({ background: accent ? brand.accentColor : '#161819', borderColor: accent ? brand.accentColor : '#161819' });

    const scoped = useMemo(
        () => products.filter(p => audience === ALL || normalizeGender(p.category) === audience),
        [products, audience]
    );

    const categories = useMemo(() => {
        const seen = new Map();
        scoped.forEach(p => {
            const key = normalizeCategoryName(p.productType);
            if (key && !seen.has(key)) seen.set(key, p.productType);
        });
        return sortByCategoryOrder([...seen.values()], null);
    }, [scoped]);

    // Drop a selected category that doesn't exist for the chosen audience
    const activeCategory =
        category !== ALL
            ? categories.find(c => normalizeCategoryName(c) === normalizeCategoryName(category)) ?? null
            : null;

    const results = useMemo(
        () => scoped.filter(p => !activeCategory || normalizeCategoryName(p.productType) === normalizeCategoryName(activeCategory)),
        [scoped, activeCategory]
    );

    const viewAllHref = useMemo(() => {
        const params = new URLSearchParams();
        params.set('brand', brand.dbBrand);
        if (audience !== ALL) params.set('gender', AUDIENCES.find(a => a.key === audience).param);
        if (activeCategory) params.set('category', activeCategory);
        return `/shop?${params.toString()}`;
    }, [brand.dbBrand, audience, activeCategory]);

    return (
        <div className="text-left">
            <div className="bg-[#faf9f7] border border-gray-200 rounded-sm px-4 md:px-12 py-4 mb-8">
                <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-gray-200">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mr-2">Audience:</span>
                    <button onClick={() => setAudience(ALL)} className={pill(audience === ALL)} style={audience === ALL ? activeStyle(false) : undefined}>
                        ALL
                    </button>
                    {AUDIENCES.map(a => (
                        <button key={a.key} onClick={() => setAudience(a.key)} className={pill(audience === a.key)} style={audience === a.key ? activeStyle(false) : undefined}>
                            {a.label.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3">
                    <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500 mr-2">
                        <FiFilter /> Categories:
                    </span>
                    <button onClick={() => setCategory(ALL)} className={pill(!activeCategory)} style={!activeCategory ? activeStyle(true) : undefined}>
                        ALL
                    </button>
                    {categories.map(c => (
                        <button key={c} onClick={() => setCategory(c)} className={pill(activeCategory === c)} style={activeCategory === c ? activeStyle(true) : undefined}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                    {results.slice(0, MAX_PRODUCTS).map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center min-h-40 text-gray-500 text-sm">
                    No products match your selection
                </div>
            )}

            <div className="flex justify-center mt-8">
                <Link
                    href={viewAllHref}
                    prefetch={false}
                    className="px-10 py-3 rounded-full bg-[#161819] text-white text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
                >
                    View All
                </Link>
            </div>
        </div>
    );
}
