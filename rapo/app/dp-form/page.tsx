'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RopaDPForm from '@/components/RopaDPForm';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { useSidebar } from '@/lib/sidebarContext';

// ✅ Isolated into its own component so Suspense can wrap it
function DPFormContent() {
  const params = useSearchParams();
  const activityId = params.get('activityId');
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={`
        pt-20 p-6 transition-all duration-200
        ${isCollapsed ? 'ml-[64px]' : 'ml-[240px]'}
      `}
    >
      <RopaDPForm activityId={activityId || ''} />
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Topbar />
      <Sidebar />

      {/* ✅ Suspense boundary required by Next.js for useSearchParams() */}
      <Suspense fallback={<div className="p-6 text-gray-500">Loading...</div>}>
        <DPFormContent />
      </Suspense>
    </div>
  );
}