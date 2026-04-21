'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { mockActivities, mockDpRecords } from '@/lib/mockData';
import { DpRecord } from '@/types';

export default function MyRopaPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'dc' | 'dp'>('dc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // ── DC data ──────────────────────────────────────────────────────────────────
  const myDC = mockActivities.filter(a => a.owner === user?.name);
  const filteredDC = myDC.filter(a => {
    const matchSearch = a.activityName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── DP data ──────────────────────────────────────────────────────────────────
  const myDP: DpRecord[] = mockDpRecords.filter((d: DpRecord) => d.createdBy === user?.name);
  const filteredDP = myDP.filter((d: DpRecord) => {
    const matchSearch = d.processorName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch;
  });

  // ── Stats ────────────────────────────────────────────────────────────────────
  const dcStats = [
    { key: 'ALL',      title: 'Total',        value: myDC.length,                                   color: 'text-gray-900' },
    { key: 'ACTIVE',   title: 'Active',        value: myDC.filter(a => a.status === 'ACTIVE').length, color: 'text-green-600' },
    { key: 'REVIEW',   title: 'Under Review',  value: myDC.filter(a => a.status === 'REVIEW').length, color: 'text-yellow-600' },
    { key: 'DRAFT',    title: 'Draft',         value: myDC.filter(a => a.status === 'DRAFT').length,  color: 'text-gray-500' },
  ];

  const dpStats = [
    { key: 'ALL',      title: 'Total',    value: myDP.length,                                           color: 'text-gray-900' },
    { key: 'PENDING',  title: 'Pending',  value: myDP.filter(d => d.status === 'PENDING').length,       color: 'text-yellow-600' },
    { key: 'APPROVED', title: 'Approved', value: myDP.filter(d => d.status === 'APPROVED').length,      color: 'text-green-600' },
    { key: 'REJECTED', title: 'Rejected', value: myDP.filter(d => d.status === 'REJECTED').length,      color: 'text-red-600' },
  ];

  const activeStats = activeTab === 'dc' ? dcStats : dpStats;

  // ── Badges ───────────────────────────────────────────────────────────────────
  const statusBadge = (status: string) => {
    if (status === 'ACTIVE' || status === 'APPROVED') return 'bg-green-100 text-green-700';
    if (status === 'REVIEW' || status === 'PENDING')  return 'bg-yellow-100 text-yellow-700';
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

  // reset filter เมื่อเปลี่ยน tab
  const handleTabChange = (tab: 'dc' | 'dp') => {
    setActiveTab(tab);
    setStatusFilter('ALL');
    setSearch('');
    setMenuIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Activity</h1>
        <p className="text-sm text-gray-500 mt-1">กิจกรรมที่คุณ {user?.name} สร้าง</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => handleTabChange('dc')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all
            ${activeTab === 'dc'
              ? 'bg-[#203690] text-white border-[#203690]'
              : 'bg-white text-gray-600 border-gray-300 hover:border-[#203690]'}`}>
          DC Form ({myDC.length})
        </button>
        <button onClick={() => handleTabChange('dp')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all
            ${activeTab === 'dp'
              ? 'bg-[#203690] text-white border-[#203690]'
              : 'bg-white text-gray-600 border-gray-300 hover:border-[#203690]'}`}>
          DP Form ({myDP.length})
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {activeStats.map(s => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)}
            className={`bg-white border rounded-xl p-4 text-left transition-all
              hover:shadow-md hover:border-[#203690]
              ${statusFilter === s.key ? 'border-[#203690] ring-2 ring-[#203690]' : 'border-gray-200'}`}>
            <p className="text-xs text-gray-500">{s.title}</p>
            <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-black rounded-md overflow-hidden">

        {/* TOOLBAR */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {activeTab === 'dc' ? 'DC Form' : 'DP Form'}
            </p>
            <p className="text-xs text-gray-400">
              {activeTab === 'dc' ? filteredDC.length : filteredDP.length} รายการ
            </p>
          </div>
          <input type="text" placeholder="ค้นหา..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="border border-gray-400 rounded px-3 py-1.5 text-sm w-56
              focus:outline-none focus:ring-1 focus:ring-[#203690]" />
        </div>

        {/* ── DC TABLE ── */}
        {activeTab === 'dc' && (
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
              {filteredDC.length > 0 ? filteredDC.map((a, index) => (
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
                    <div className="relative">
                      <button
                        onClick={e => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setMenuPosition({ top: rect.bottom, left: rect.left });
                          setMenuIndex(menuIndex === index ? null : index);
                        }}
                        className="p-2 rounded hover:bg-gray-200">⋮</button>
                      {menuIndex === index && (
                        <div style={{ top: menuPosition.top, left: menuPosition.left }}
                          className="fixed w-44 bg-white border rounded-lg shadow-lg z-[9999]">
                          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => { router.push(`/ropa/${a.id}`); setMenuIndex(null); }}>
                            ดูรายละเอียด
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => { router.push(`/ropa/create?edit=${a.id}`); setMenuIndex(null); }}>
                            แก้ไข
                          </button>
                          {a.status === 'ACTIVE' && (
                            <button className="block w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-gray-100"
                              onClick={() => { router.push(`/dc/create-dp/${a.id}`); setMenuIndex(null); }}>
                              + สร้าง DP Form
                            </button>
                          )}
                          {a.status === 'REJECTED' && (
                            <button className="block w-full text-left px-4 py-2 text-sm text-[#203690] hover:bg-gray-100"
                              onClick={() => { router.push(`/ropa/create?edit=${a.id}`); setMenuIndex(null); }}>
                              แก้ไขและส่งใหม่
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* ── DP TABLE ── */}
        {activeTab === 'dp' && (
          <table className="w-full">
            <thead className="bg-gray-100 text-[11px] text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">ชื่อผู้ประมวลผล</th>
                <th className="px-4 py-2 text-left">DC Record ที่ผูกอยู่</th>
                <th className="px-4 py-2 text-left">วัตถุประสงค์</th>
                <th className="px-4 py-2 text-left">สถานะ</th>
                <th className="px-4 py-2 text-left">วันที่สร้าง</th>
                <th className="px-4 py-2 text-left">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {filteredDP.length > 0 ? filteredDP.map((d: DpRecord, index: number) => {
                const linked = mockActivities.find(a => a.id === d.activityId);
                const dpIndex = index + 1000; // offset ไม่ให้ชนกับ DC index
                return (
                  <tr key={d.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.processorName}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-700">{linked?.activityName ?? d.activityId}</p>
                        <p className="text-xs text-gray-400">{linked?.department}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{d.purpose}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{d.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={e => {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            setMenuPosition({ top: rect.bottom, left: rect.left });
                            setMenuIndex(menuIndex === dpIndex ? null : dpIndex);
                          }}
                          className="p-2 rounded hover:bg-gray-200">⋮</button>
                        {menuIndex === dpIndex && (
                          <div style={{ top: menuPosition.top, left: menuPosition.left }}
                            className="fixed w-44 bg-white border rounded-lg shadow-lg z-[9999]">
                            {d.status === 'REJECTED' && (
                              <button className="block w-full text-left px-4 py-2 text-sm text-[#203690] hover:bg-gray-100"
                                onClick={() => { router.push(`/dc/create-dp/${d.activityId}`); setMenuIndex(null); }}>
                                แก้ไขและส่งใหม่
                              </button>
                            )}
                            {d.status !== 'REJECTED' && (
                              <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={() => setMenuIndex(null)}>
                                ดูรายละเอียด
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* FLOATING BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button onClick={() => router.push('/ropa/create')}
          className="bg-[#203690] text-white w-14 h-14 flex items-center justify-center
            rounded-xl shadow-lg hover:bg-[#182a73] hover:shadow-xl transition duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white
          text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100
          transition whitespace-nowrap pointer-events-none">
          Create DC Form
        </div>
      </div>

      {menuIndex !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuIndex(null)} />
      )}
    </div>
  );
}