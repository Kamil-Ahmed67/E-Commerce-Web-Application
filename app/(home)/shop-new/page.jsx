import ShopNewWithSidebar from '@/components/ShopNewWithSidebar'
import React, { Suspense } from 'react'

export default function ShopNewArrival() {
  return (
    <div>
      <Suspense fallback={<div className="text-center text-gray-600 py-20">Loading...</div>}>
        <ShopNewWithSidebar />
      </Suspense>
    </div>
  )
}
