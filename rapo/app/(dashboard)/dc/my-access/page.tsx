
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockActivities } from '@/lib/mockData';
import { useAuth } from '@/lib/authContext';

export default function MyAccessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const myActivities = mockActivities.filter(a => a.owner === user?.name);

  const filtered = myActivities.filter(a =>
    statusFilter === 'ALL' || a.status === statusFilter
  );

  const statusBadge = (status: string) => {
    if (status === 'ACTIVE')   return 'bg-green-100 text-green-700';
    if (status === 'REVIEW')   return 'bg-yellow-100 text-yellow-700';
    if (status === 'DRAFT')    return 'bg-gray-100 text-gray-600';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    if (status === 'ARCHIVED') return 'bg-slate-100 text-slate-500';
    return 'bg-gray-100 text-gray-600';
  };

  const stats = [
    { label: 'ทั้งหมด',    value: myActivities.length,                                    color: 'text-black' },
    { label: 'ACTIVE',     value: myActivities.filter(a => a.status === 'ACTIVE').length,  color: 'text-green-600' },
    { label: 'REVIEW',     value: myActivities.filter(a => a.status === 'REVIEW').length,  color: 'text-yellow-600' },
    { label: 'REJECTED',   value: myActivities.filter(a => a.status === 'REJECTED').length,color: 'text-red-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="bg-white border border-black px-5 py-4 rounded-md mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-0.5">My Access</p>
        <p className="text-[11px] text-gray-500">
          ROPA ทั้งหมดที่คุณสร้าง — {user?.name}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map(s => {
          const filterVal = s.label === 'ทั้งหมด' ? 'ALL' : s.label;
          const isActive = statusFilter === filterVal;
          return (
            <button
              key={s.label}
              onClick={() => setStatusFilter(filterVal)}
              className={`bg-white border rounded-md px-4 py-3 text-left transition-all
                hover:shadow-md hover:border-blue-400
                ${isActive ? 'border-[#203690] ring-2 ring-[#203690]' : 'border-black'}
              `}
            >
              <p className="text-[11px] text-black">{s.label}</p>
              <p className={`text-xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-black rounded-md overflow-hidden">

        {/* TOOLBAR */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-700">
            รายการ ROPA ของฉัน ({filtered.length} รายการ)
          </p>
          <button
            onClick={() => router.push('/ropa/create')}
            className="bg-[#203690] text-white px-3 py-1.5 rounded text-xs
              font-medium hover:bg-[#182a73] transition"
          >
            + สร้าง ROPA ใหม่
          </button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-100 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">ชื่อกิจกรรม</th>
              <th className="px-4 py-2 text-left">แผนก</th>
              <th className="px-4 py-2 text-left">ฐานกฎหมาย</th>
              <th className="px-4 py-2 text-left">สถานะ</th>
              <th className="px-4 py-2 text-left">อัปเดตล่าสุด</th>
              <th className="px-4 py-2 text-left">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filtered.length > 0 ? (
              filtered.map(a => (
                <tr key={a.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {a.activityName}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.department}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.legalBasis}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{a.updatedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">

                      {/* ดูรายละเอียด */}
                      <button
                        onClick={() => router.push(`/ropa/${a.id}`)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        ดู
                      </button>

                      {/* แก้ไข เฉพาะ DRAFT */}
                      {a.status === 'DRAFT' && (
                        <button
                          onClick={() => router.push(`/ropa/create?edit=${a.id}`)}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          แก้ไข
                        </button>
                      )}

                      {/* กรอกฟอร์ม DP เฉพาะ ACTIVE */}
                      {a.status === 'ACTIVE' && (
                        <button
                          onClick={() => router.push(`/ropa/create?type=dp&activityId=${a.id}`)}
                          className="text-xs text-emerald-600 hover:underline font-medium"
                        >
                          + กรอกฟอร์ม DP
                        </button>
                      )}

                      {/* REJECTED — แจ้งเตือน */}
                      {a.status === 'REJECTED' && (
                        <span className="text-xs text-red-400">
                          ถูกปฏิเสธ
                        </span>
                      )}

                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FLOATING BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          onClick={() => router.push('/ropa/create')}
          className="bg-[#203690] text-white w-14 h-14 flex items-center justify-center
            rounded-full shadow-lg hover:bg-[#182a73] hover:scale-110
            hover:shadow-xl transition duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white
          text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100
          transition whitespace-nowrap">
          สร้าง ROPA ใหม่
        </div>
      </div>

    </div>
  );
}
