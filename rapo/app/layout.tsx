import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RAPo | RoPA Management System",
  description: "RoPA Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-100`}>
        
        {/* Top Navbar */}
        <div className="bg-[#203690] text-white px-6 py-4 font-semibold">
          RAPo | RoPA Management System
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>

      </body>
    </html>
  );
}