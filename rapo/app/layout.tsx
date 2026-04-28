import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';   // ← เพิ่ม

const inter = Inter({ subsets: ['latin'], weight: ['400','500','600','700'] });

export const metadata: Metadata = {
  title: 'RAPo | RoPA Management System',
  description: 'RoPA Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-100`}>
        <Providers>          {/* ← แทนที่ AuthProvider/SidebarProvider/RopaProvider เดิม */}
          {children}
        </Providers>
      </body>
    </html>
  );
}