'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/form`);
        const json = await res.json();
        if (json.success) setActivities(json.data);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
  }, [user?.id]);

  // ── Stats — use 'approval_status' and real values ────────────
  const stats = [
    {
      key: 'ALL',
      title: 'Total Activities',
      value: activities.length,
      sub: 'กิจกรรมทั้งหมด',
      extra: 'ทั้งหมด',
      color: 'text-gray-900',
    },
    {
      key: 'approved',
      title: 'Active',
      value: activities.filter(a => a.approval_status === 'approved').length,
      sub: 'กำลังใช้งาน',
      extra: 'อนุมัติแล้ว',
      color: 'text-green-600',
    },
    {
      key: 'pending',
      title: 'Under Review',
      value: activities.filter(a => a.approval_status === 'pending').length,
      sub: 'รอทบทวน',
      extra: 'Needs attention',
      color: 'text-yellow-600',
    },
    {
      key: 'draft',
      title: 'Draft',
      value: activities.filter(a => a.approval_status === 'draft').length,
      sub: 'แบบร่าง',
      extra: 'In progress',
      color: 'text-gray-500',
    },
  ];

  // ── Filter — use actual column names ─────────────────────────
  const filtered = activities.filter(a => {
    const matchSearch = a.activity_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.approval_status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Badges — match actual approval_status values ──────────────
  const statusBadge = (status: string) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'pending')  return 'bg-yellow-100 text-yellow-700';
    if (status === 'draft')    return 'bg-gray-100 text-gray-600';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    if (status === 'archived') return 'bg-slate-100 text-slate-500';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mb-6">
        <p className="text-sm text-gray-500 mt-1">ภาพรวมกิจกรรมและสถานะล่าสุด</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const isActive = statusFilter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`bg-white border rounded-xl p-4 text-left transition-all hover:shadow-md hover:border-[#203690]
                ${isActive ? 'border-[#203690] ring-2 ring-[#203690]' : 'border-gray-200'}`}
            >
              <p className="text-xs text-gray-500">{s.title}</p>
              <p className={`text-2xl font-semibold mt-1 ${s.color}`}>
                {loading ? '—' : s.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{s.extra}</p>
              <div className="mt-3 text-[11px] text-gray-400">{s.sub}</div>
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-black rounded-md overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <div>
            <p className="text-sm font-semibold text-gray-700">กิจกรรมล่าสุด</p>
            <p className="text-xs text-gray-400">{filtered.length} รายการ</p>
          </div>
          <input
            type="text"
            placeholder="ค้นหากิจกรรม..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-400 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#203690]"
          />
        </div>

        <table className="w-full">
          <thead className="bg-gray-100 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">ชื่อกิจกรรม</th>
              <th className="px-4 py-2 text-left">หัวข้อ</th>
              <th className="px-4 py-2 text-left">วัตถุประสงค์</th>
              <th className="px-4 py-2 text-left">สถานะ</th>
              <th className="px-4 py-2 text-left">อัปเดตล่าสุด</th>
              <th className="px-4 py-2 text-left">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  กำลังโหลด...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((a) => (
                <tr key={a.activity_id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.activity_name}</td>
                  <td className="px-4 py-3 text-gray-500">{a.activity_subject}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[180px]">{a.purpose}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(a.approval_status)}`}>
                      {a.approval_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {a.updated_at ? new Date(a.updated_at).toLocaleDateString('th-TH') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin?view=${a.activity_id}`)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        ดู
                      </button>
                      {(role === 'admin' || role === 'dataOwner') && (
                        <button
                          onClick={() => router.push(`/createactivity?edit=${a.activity_id}`)}
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
                <td colSpan={6} className="text-center py-10 text-gray-400">
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
            className="bg-[#203690] text-white w-14 h-14 flex items-center justify-center rounded-xl shadow-lg hover:bg-[#182a73] hover:shadow-xl transition duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            Add New ROPA
          </div>
        </div>
      )}
    </div>
  );
}