'use client'

import { useRouter } from 'next/navigation'

export default function RopaPage() {
  const router = useRouter()

  return (
    <div className="p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ROPA Management</h1>

        {/* ✅ ปุ่ม Create DC Form */}
        <button
          onClick={() => router.push('/ropa/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create DC Form
        </button>
      </div>

      {/* List placeholder */}
      <div className="border rounded-lg p-4 text-gray-500">
        No ROPA yet...
      </div>
    </div>
  )
}