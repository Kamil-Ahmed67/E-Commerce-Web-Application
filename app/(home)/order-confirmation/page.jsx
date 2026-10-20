import OrderConfirmation from '@/components/Checkout/OrderConfirmation';
import { Suspense } from 'react';

export default function OrderConfirmationPage() {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <OrderConfirmation />
      </Suspense>
    </main>
  );
}
