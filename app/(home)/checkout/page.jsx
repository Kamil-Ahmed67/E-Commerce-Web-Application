import Checkout from '@/components/Checkout';
import { Suspense } from 'react';
export default function CheckoutPage() {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <Checkout />
      </Suspense>
    </main>
  );
}