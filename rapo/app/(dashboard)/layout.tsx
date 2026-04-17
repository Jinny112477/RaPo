export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <div className="w-64 border-r">
        Sidebar
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b">
          Topbar
        </div>

        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}