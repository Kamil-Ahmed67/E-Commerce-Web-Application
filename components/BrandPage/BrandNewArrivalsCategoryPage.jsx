import Link from 'next/link';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getProducts } from '@/lib/server/shopData';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import ViewItemListTracker from '@/components/Tracking/ViewItemListTracker';

export default async function BrandNewArrivalsCategoryPage({ brandKey, brandDisplayName, accentColor, category, backHref }) {
    const products = await getProducts();

    const items = products.filter(
        p => p.brand === brandKey && p.status === 'New' && (p.productType || 'Other') === category
    );

    return (
        <div className="min-h-screen bg-white pt-[var(--header-height)]">
            <ViewItemListTracker products={items} listName={`${brandDisplayName} New Arrivals - ${category}`} />
            <div className="px-4 md:px-8 pt-4">
                <Breadcrumb items={[
                    { label: 'Home', href: '/' },
                    { label: brandDisplayName, href: backHref.replace('/new-arrivals', '/collection') },
                    { label: 'New Arrivals', href: backHref },
                    { label: category, href: null },
                ]} />
            </div>

            {/* Header */}
            <div className="text-center py-8 px-4 border-b border-gray-100">
                <p
                    className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-1"
                    style={{ color: accentColor }}
                >
                    {brandDisplayName}
                </p>
                <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-gray-900">
                    {category}
                </h1>
                <Link
                    href={backHref}
                    className="inline-block text-xs text-gray-400 mt-3 uppercase tracking-widest hover:text-gray-600 hover:underline"
                >
                    ← Back to New Arrivals
                </Link>
            </div>

            {/* Content */}
            <div className="py-8 px-4 md:px-8">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-gray-400 text-sm uppercase tracking-widest">No new arrivals yet</p>
                        <p className="text-gray-300 text-xs mt-2 tracking-wider">Check back soon for fresh styles</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                        {items.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
