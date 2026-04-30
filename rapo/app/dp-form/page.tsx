'use client';

import { useSearchParams } from 'next/navigation';
import RopaDPForm from '@/components/RopaDPForm';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { useSidebar } from '@/lib/sidebarContext';

export default function Page() {
  const params = useSearchParams();
  const activityId = params.get('activityId');
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Topbar */}
      <Topbar />

      {/* Sidebar */}
      <Sidebar />

      {/* Content */}
      <div
        className={`
          pt-20 p-6 transition-all duration-200
          ${isCollapsed ? 'ml-[64px]' : 'ml-[240px]'}
        `}
      >
        <RopaDPForm activityId={activityId || ''} />
      </div>

    </div>
  );
}