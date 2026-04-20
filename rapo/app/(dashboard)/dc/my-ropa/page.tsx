'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { mockActivities } from '@/lib/mockData';

export default function MyRopaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const myActivities = mockActivities.filter(a => a.owner === user?.name);

  const filtered = myActivities.filter(a => {
    const matchSearch = a.activityName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = [
    { title: 'ALL', value: myActivities.length, sub: 'ทั้งหมด', color: 'text-black' },
    { title: 'ACTIVE', value: myActivities.filter(a => a.status === 'ACTIVE').length, sub: 'ใช้งานอยู่', color: 'text-green-600' },
    { title: 'REVIEW', value: myActivities.filter(a => a.status === 'REVIEW').length, sub: 'รอตรวจ', color: 'text-yellow-600' },
    { title: 'DRAFT', value: myActivities.filter(a => a.status === 'DRAFT').length, sub: 'ร่าง', color: 'text-gray-500' },
  ];

  const statusBadge = (status: string) => {
    if (status === 'ACTIVE')   return 'bg-green-100 text-green-700';
    if (status === 'REVIEW')   return 'bg-yellow-100 text-yellow-700';
    if (status === 'DRAFT')    return 'bg-gray-100 text-gray-600';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    if (status === 'ARCHIVED') return 'bg-slate-100 text-slate-500';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="bg-white border border-black px-5 py-4 rounded-md mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-1">My ROPA</p>
        <p className="text-[11px] text-gray-500">ROPA ที่คุณสร้าง — {user?.name}</p>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <button key={s.title} onClick={() => setStatusFilter(s.title)}
            className={`bg-white border rounded-md px-4 py-3 text-left transition-all
              hover:shadow-md hover:border-blue-400
              ${statusFilter === s.title ? 'border-[#203690] ring-2 ring-[#203690]' : 'border-black'}`}>
            <p className="text-[11px] text-black">{s.title}</p>
            <p className={`text-xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-gray-400">{s.sub}</p>
          </button>
        ))}
      </div>

      <div className="bg-white border border-black rounded-md overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-700">ROPA ของฉัน ({filtered.length} รายการ)</p>
          <input type="text" placeholder="ค้นหา..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-400 rounded px-3 py-1.5 text-sm w-48
              focus:outline-none focus:ring-1 focus:ring-[#203690]" />
        </div>

        <table className="w-full">
          <thead className="bg-gray-100 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">ชื่อกิจกรรม</th>
              <th className="px-4 py-2 text-left">แผนก</th>
              <th className="px-4 py-2 text-left">สถานะ</th>
              <th className="px-4 py-2 text-left">อัปเดตล่าสุด</th>
              <th className="px-4 py-2 text-left">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filtered.length > 0 ? filtered.map(a => (
              <tr key={a.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{a.activityName}</td>
                <td className="px-4 py-3 text-gray-500">{a.department}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(a.status)}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{a.updatedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/ropa/${a.id}`)}
                      className="text-xs text-blue-600 hover:underline">ดู</button>
                    <button onClick={() => router.push(`/ropa/create?edit=${a.id}`)}
                      className="text-xs text-gray-500 hover:underline">แก้ไข</button>
                    {a.status === 'ACTIVE' && (
                      <button onClick={() => router.push(`/ropa/create?type=dp&activityId=${a.id}`)}
                        className="text-xs text-emerald-600 hover:underline font-medium">
                        + DP
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
