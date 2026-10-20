import ShopWithSidebar from '@/components/ShopWithSidebar';
import { Suspense } from 'react';

export default function Shop() {
  return (
    <div>
      <Suspense fallback={<div className="text-center text-gray-600 py-20">Loading...</div>}>
        <ShopWithSidebar />
      </Suspense>
    </div>
  );
}