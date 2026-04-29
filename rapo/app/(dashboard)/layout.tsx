'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/lib/sidebarContext';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { RopaProvider } from '@/lib/ropaContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();

  //คอมเม้นไว้ชั่วคราวจะได้พิมพ์ path ได้
  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     router.push('/login');
  //   }
  // }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div
        className={[
          'flex-1 flex flex-col min-w-0 transition-all duration-200',
        ].join(' ')}
      >
        {/* Topbar - takes full remaining width */}
        <div
          className={[
            'transition-all duration-200',
            // Desktop: offset by sidebar width
            isCollapsed ? 'lg:ml-[64px]' : 'lg:ml-[240px]',
          ].join(' ')}
        >
          <Topbar />
        </div>

        {/* Page content */}
        <main
          className={[
            'flex-1 pt-16 transition-all duration-200',
            isCollapsed ? 'lg:ml-[64px]' : 'lg:ml-[240px]',
          ].join(' ')}
        >
            <div className="p-5 lg:p-6 h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
