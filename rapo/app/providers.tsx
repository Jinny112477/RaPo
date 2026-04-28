// AuthProvider อยู่ใน layout แล้ว ปัญหาคือ layout.tsx มี 'use client' ไหม ถ้าไม่มีแต่ AuthProvider เป็น client component จะพัง
// ให้เพิ่ม 'use client' บรรทัดแรกของ app/layout.tsx — แต่ทำไม่ได้ เพราะ root layout ต้องเป็น server component
// แก้ด้วยการสร้าง Providers wrapper แยกต่างหาก:

'use client';

import { AuthProvider } from '@/lib/authContext';
import { SidebarProvider } from '@/lib/sidebarContext';
import { RopaProvider } from '@/lib/ropaContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <RopaProvider>
          {children}
        </RopaProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}