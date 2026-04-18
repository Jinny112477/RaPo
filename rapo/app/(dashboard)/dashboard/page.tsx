'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { mockActivities, mockStats } from '@/lib/mockData';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = mockActivities.filter(a => {
    const matchSearch = a.activityName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = [
    { title: 'ALL ACTIVITIES', value: mockStats.total,    sub: 'กิจกรรมทั้งหมด', color: 'text-black' },
    { title: 'ACTIVE',         value: mockStats.active,   sub: 'กำลังใช้งาน',    color: 'text-green-600' },
    { title: 'REVIEW',         value: mockStats.review,   sub: 'รอทบทวน',        color: 'text-red-600' },
    { title: 'DRAFT',          value: mockStats.draft,    sub: 'แบบร่าง',         color: 'text-gray-500' },
  ];

  const statusBadge = (status: string) => {
    if (status === 'ACTIVE')   return 'bg-green-100 text-green-700';
    if (status === 'REVIEW')   return 'bg-yellow-100 text-yellow-700';
    if (status === 'DRAFT')    return 'bg-gray-100 text-gray-600';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    if (status === 'ARCHIVED') return 'bg-slate-100 text-slate-500';
    return 'bg-gray-100 text-gray-600';
  };

  const riskBadge = (risk: string) => {
    if (risk === 'LOW')      return 'bg-green-50 text-green-700';
    if (risk === 'MEDIUM')   return 'bg-yellow-50 text-yellow-700';
    if (risk === 'HIGH')     return 'bg-orange-50 text-orange-700';
    if (risk === 'CRITICAL') return 'bg-red-50 text-red-700';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* OVERVIEW BOX */}
      <div className="bg-white border border-black px-5 py-4 rounded-md mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-1">Overview</p>
        <p className="text-[11px] text-gray-500 mb-4">
          ข้อมูล ณ วันนี้
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map((s) => {
          const filterValue = s.title === 'ALL ACTIVITIES' ? 'ALL' : s.title;
          const isActive = statusFilter === filterValue;
          return (
            <button
              key={s.title}
              onClick={() => setStatusFilter(filterValue)}
              className={`bg-white border rounded-md px-4 py-3 text-left transition-all
                hover:shadow-md hover:border-blue-400
                ${isActive ? 'border-[#203690] ring-2 ring-[#203690]' : 'border-black'}
              `}
            >
              <p className="text-[11px] text-black">{s.title}</p>
              <p className={`text-xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-400">{s.sub}</p>
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-black rounded-md overflow-hidden">

        {/* HEADER + SEARCH */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <div>
            <p className="text-sm font-semibold text-gray-700">กิจกรรมล่าสุด</p>
            <p className="text-xs text-gray-400">{filtered.length} รายการ</p>
          </div>
          <div className="flex items-center gap-2">
            {/* ปุ่ม Add New ROPA */}
            
            <input
              type="text"
              placeholder="ค้นหากิจกรรม..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-400 rounded px-3 py-1.5 text-sm w-56
                focus:outline-none focus:ring-1 focus:ring-[#203690]"
            />
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full">
          <thead className="bg-gray-100 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">ชื่อกิจกรรม</th>
              <th className="px-4 py-2 text-left">แผนก</th>
              <th className="px-4 py-2 text-left">ฐานกฎหมาย</th>
              <th className="px-4 py-2 text-left">ความเสี่ยง</th>
              <th className="px-4 py-2 text-left">สถานะ</th>
              <th className="px-4 py-2 text-left">อัปเดตล่าสุด</th>
              <th className="px-4 py-2 text-left">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filtered.length > 0 ? (
              filtered.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.activityName}</td>
                  <td className="px-4 py-3 text-gray-500">{a.department}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.legalBasis}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskBadge(a.riskLevel)}`}>
                      {a.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{a.updatedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin?view=${a.id}`)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        ดู
                      </button>
                      {(role === 'admin' || role === 'dataOwner') && (
                        <button
                          onClick={() => router.push(`/createactivity?edit=${a.id}`)}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          แก้ไข
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  ไม่พบข้อมูลกิจกรรม
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Add Button */}
      {(role === 'admin' || role === 'dataOwner') && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <button
            onClick={() => router.push('/ropa/create')}
            className="bg-[#203690] text-white w-14 h-14 flex items-center justify-center
              rounded-full shadow-lg hover:bg-[#182a73] hover:scale-110 hover:shadow-xl transition duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white
            text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            Add New ROPA
          </div>
        </div>
      )}

    </div>
  );
}