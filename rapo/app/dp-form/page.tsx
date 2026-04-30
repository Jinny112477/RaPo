import { Suspense } from 'react';
import { DpFormClient } from '@/components/DpFormClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DpFormClient />
    </Suspense>
  );
}