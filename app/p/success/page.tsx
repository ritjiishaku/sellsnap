import { Suspense } from 'react';
import { PaymentVerification } from './_components/PaymentVerification';

export default function SuccessPage() {
  return (
    <Suspense>
      <PaymentVerification />
    </Suspense>
  );
}
