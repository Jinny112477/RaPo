import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { AuthProvider } from "@/lib/authContext"
import { SidebarProvider } from "@/lib/sidebarContext"
import { RopaProvider } from "@/lib/ropaContext"


const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "RAPo | RoPA Management System",
  description: "RoPA Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-100`}>
        <AuthProvider>
          <SidebarProvider>
            <RopaProvider>
              {children}              
            </RopaProvider>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}