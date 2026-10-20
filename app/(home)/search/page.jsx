import ShopWithSidebar from '@/components/ShopWithSidebar';
import { Suspense } from 'react';

export async function generateMetadata({ searchParams }) {
    const params = await searchParams;
    const q = params?.q || '';
    return {
        title: q ? `Search results for "${q}" — Mingle In Style` : 'Search — Mingle In Style',
    };
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="text-center text-gray-600 py-20">Loading...</div>}>
            <ShopWithSidebar searchMode={true} />
        </Suspense>
    );
}
