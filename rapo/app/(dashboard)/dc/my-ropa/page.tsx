'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
// 1. ตรวจสอบให้แน่ใจว่า import useRopa มาแล้ว
import { useRopa } from '@/lib/ropaContext'
import { DpRecord } from '@/types';
import { mapApiRopaToActivity } from '@/lib/mapRopa';
import { MessageSquareWarning } from 'lucide-react';
import { notifyError } from '@/lib/notify';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cn334-team07-ropa-2026.onrender.com';

type ApiAccessRequest = {
  request_id: string;
  activity_id: string;
  requested_by: string;
  purpose: string;
  scope?: string | null;
  duration?: string | null;
  processor_name?: string | null;
  processor_address?: string | null;
  approval_status: string;
  created_at: string;
  updated_at?: string | null;
  activity?: {
    activity_id: string;
    activity_name?: string;
    activity_subject?: string;
  };
};

type DpRecordUI = DpRecord & {
  activityName?: string;
  activitySubject?: string;
  processorAddress?: string | null;
  scope?: string | null;
  duration?: string | null;
  rejectionReason?: string | null;
};

type DepartmentOption = {
  department_id: string;
  department_name: string;
};

const mapAccessToDpRecord = (item: ApiAccessRequest): DpRecordUI => {
  return {
    id: item.request_id,
    activityId: item.activity_id,

    processorName:
      item.processor_name ||
      'ไม่ระบุผู้ประมวลผล',

    processorAddress: item.processor_address || '-',

    purpose: item.purpose || '-',

    status:
      item.approval_status === 'approved'
        ? 'APPROVED'
        : item.approval_status === 'draft'
          ? 'DRAFT'
        : item.approval_status === 'rejected'
          ? 'REJECTED'
          : 'PENDING',

    createdBy: item.requested_by,

    createdAt: item.updated_at || item.created_at
      ? new Date(item.updated_at || item.created_at).toLocaleDateString('th-TH')
      : '-',

    activityName: item.activity?.activity_name || '-',
    activitySubject: item.activity?.activity_subject || '-',
    scope: item.scope,
    duration: item.duration,
  } as DpRecordUI;
};

export default function MyRopaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activities, setActivities] = useState<any[]>([]);
  const [loadingDC, setLoadingDC] = useState(false);
  const [activeTab, setActiveTab] = useState<'dc' | 'dp'>('dc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [myDP, setMyDP] = useState<DpRecordUI[]>([]);
  const [dpLoading, setDpLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const getDepartmentName = (departmentIdOrName?: string) => {
    if (!departmentIdOrName) return '-';

    const found = departments.find((department) => department.department_id === departmentIdOrName);
    return found?.department_name || departmentIdOrName;
  };

  const fetchMyActivities = async () => {
    try {
      if (!user?.id) return;

      setLoadingDC(true);

      const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/form?user_id=${user.id}`);
      const data = await res.json();

      if (!res.ok) {
        console.log('FETCH MY RECORD ERROR:', data);
        notifyError(data.detail || data.error || 'โหลด My Record ไม่สำเร็จ');
        return;
      }

      const mapped = (data.data || []).map(mapApiRopaToActivity);
      setActivities(mapped);
    } catch (error) {
      console.error(error);
      notifyError('โหลด My Record ไม่สำเร็จ');
    } finally {
      setLoadingDC(false);
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/form/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        console.log('DELETE MY RECORD ERROR:', data);
        notifyError(data.detail || data.error || 'ลบข้อมูลไม่สำเร็จ');
        return;
      }

      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error(error);
      notifyError('ลบข้อมูลไม่สำเร็จ');
    }
  };

  useEffect(() => {
    fetchMyActivities();
  }, [user?.id]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/departments`);
        const data = await res.json();

        if (!res.ok) return;
        setDepartments(data.data || []);
      } catch (error) {
        console.error('FETCH DEPARTMENTS ERROR:', error);
      }
    };

    fetchDepartments();
  }, []);

  const myDC = activities;

  const filteredDC = useMemo(() => {
    return myDC.filter(a => {
      const matchSearch = a.activityName?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [myDC, search, statusFilter]);

  const fetchMyDPForms = async () => {
    try {
      if (!user?.id) return;

      setDpLoading(true);

      const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/access/my-requests?user_id=${user.id}`);
      const data = await res.json();

      console.log('MY DP RESPONSE:', data);

      if (!res.ok) {
        notifyError(data.detail || data.error || 'โหลด DP Form ไม่สำเร็จ');
        return;
      }

      const mapped = (data.data || []).map(mapAccessToDpRecord);
      setMyDP(mapped);
    } catch (error) {
      console.error(error);
      notifyError('โหลด DP Form ไม่สำเร็จ');
    } finally {
      setDpLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDPForms();
  }, [user?.id]);

  useEffect(() => {
    const noticeType = searchParams.get('notice');
    const form = searchParams.get('form');

    if (noticeType !== 'draft-saved') return;

    if (form === 'dp') {
      setActiveTab('dp');
      setNotice('บันทึกแบบร่าง DP Form สำเร็จแล้ว');
    } else {
      setActiveTab('dc');
      setNotice('บันทึกแบบร่าง DC Form สำเร็จแล้ว');
    }

    const timer = setTimeout(() => setNotice(null), 3500);
    router.replace('/dc/my-ropa');

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  const filteredDP = myDP.filter((d: DpRecordUI) => {
    const matchSearch =
      d.processorName?.toLowerCase().includes(search.toLowerCase()) ||
      d.activityName?.toLowerCase().includes(search.toLowerCase()) ||
      d.purpose?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // ── Stats ────────────────────────────────────────────────────────────────────
  const dcStats = [
    { key: 'ALL', title: 'Total', value: myDC.length, color: 'text-gray-900' },
    { key: 'ACTIVE', title: 'Approved', value: myDC.filter(a => a.status === 'ACTIVE').length, color: 'text-green-600' },
    { key: 'REVIEW', title: 'Pending', value: myDC.filter(a => a.status === 'REVIEW').length, color: 'text-yellow-600' },
    { key: 'REJECTED', title: 'Rejected', value: myDC.filter(a => a.status === 'REJECTED').length, color: 'text-red-600' },
    { key: 'DRAFT', title: 'Draft', value: myDC.filter(a => a.status === 'DRAFT').length, color: 'text-gray-500' },
  ];

  const dpStats = [
    { key: 'ALL', title: 'Total', value: myDP.length, color: 'text-gray-900' },
    { key: 'APPROVED', title: 'Approved', value: myDP.filter(d => d.status === 'APPROVED').length, color: 'text-green-600' },
    { key: 'PENDING', title: 'Pending', value: myDP.filter(d => d.status === 'PENDING').length, color: 'text-yellow-600' },
    { key: 'REJECTED', title: 'Rejected', value: myDP.filter(d => d.status === 'REJECTED').length, color: 'text-red-600' },
    { key: 'DRAFT', title: 'Draft', value: myDP.filter(d => d.status === 'DRAFT').length, color: 'text-gray-500' },
  ];

  const activeStats = activeTab === 'dc' ? dcStats : dpStats;

  // ── Badges ───────────────────────────────────────────────────────────────────
  const statusBadge = (status: string) => {
    if (status === 'ACTIVE' || status === 'APPROVED') return 'bg-green-100 text-green-700';
    if (status === 'REVIEW' || status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
    if (status === 'DRAFT') return 'bg-gray-100 text-gray-600';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    if (status === 'ARCHIVED') return 'bg-slate-100 text-slate-500';
    return 'bg-gray-100 text-gray-600';
  };

  const riskBadge = (risk: string) => {
    if (risk === 'LOW') return 'bg-green-50 text-green-700';
    if (risk === 'MEDIUM') return 'bg-yellow-50 text-yellow-700';
    if (risk === 'HIGH') return 'bg-orange-50 text-orange-700';
    if (risk === 'CRITICAL') return 'bg-red-50 text-red-700';
    return '';
  };

  // reset filter เมื่อเปลี่ยน tab
  const handleTabChange = (tab: 'dc' | 'dp') => {
    setActiveTab(tab);
    setStatusFilter('ALL');
    setSearch('');
  };

  const [openMenu, setOpenMenu] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Activity</h1>
        <p className="text-sm text-gray-500 mt-1">กิจกรรมที่คุณ {user?.name} สร้าง</p>
      </div>

      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-800">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            ปิด
          </button>
        </div>
      )}

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
        {activeStats.map((s: { key: string; title: string; value: number; color: string }) => (
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
              {filteredDC.length > 0 ? filteredDC.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => router.push(`/ropa/${a.id}`)}
                  className="border-t hover:bg-blue-50 transition cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{a.activityName}</td>
                  <td className="px-4 py-3 text-gray-500">{getDepartmentName(a.department)}</td>
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
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2 flex-wrap">

                      {/* DRAFT — ปุ่มEdit */}
                      {a.status === 'DRAFT' && (
                        <button
                          onClick={() => router.push(`/ropa/create?edit=${a.id}`)}
                          className="text-xs text-gray-600 border border-gray-300 px-2.5 py-1 rounded hover:bg-gray-50 transition">
                          Edit
                        </button>
                      )}

                      {/* REJECTED — ปุ่มสไตล์เดียวกับ + DP Form */}
                      {a.status === 'REJECTED' && (
                        <button
                          onClick={() => router.push(`/ropa/edit/${a.id}`)}
                          className="text-xs text-red-600 border border-red-300 px-2.5 py-1 rounded hover:bg-red-50 transition">
                          Edit
                        </button>
                      )}

                      {/* ACTIVE — ปุ่ม Create DP Form */}
                      {/* {a.status === 'ACTIVE' && (
                        <button
                          onClick={() => router.push(`/dc/create-dp/${a.id}`)}
                          className="text-xs text-emerald-600 border border-emerald-300 px-2.5 py-1 rounded hover:bg-emerald-50 transition">
                          Create DP Form
                        </button>
                      )} */}

                      {/* 5. เพิ่มปุ่มลบ (เฉพาะ DRAFT และ REJECTED) */}
                      {(a.status === 'DRAFT' || a.status === 'REJECTED') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`ลบ "${a.activityName}" ใช่ไหม?`)) deleteActivity(a.id)
                          }}
                          className="text-xs text-red-400 border border-red-200 px-2.5 py-1 rounded hover:bg-red-50 transition">
                          ลบ
                        </button>
                      )}

                    </div>

                    {/* แสดงเหตุผล reject */}
                    {a.status === 'REJECTED' && a.rejectionReason && (
                      <div
                        className="mt-2 text-xs text-red-500 max-w-[160px] flex items-center gap-1"
                        title={a.rejectionReason}
                      >
                        <MessageSquareWarning className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{a.rejectionReason}</span>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    {loadingDC ? 'กำลังโหลดข้อมูล...' : 'ไม่พบข้อมูล'}
                  </td>
                </tr>
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
                <th className="px-4 py-2 text-left">อัปเดตล่าสุด</th>
                <th className="px-4 py-2 text-left">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {filteredDP.length > 0 ? filteredDP.map((d: DpRecordUI) => {
                const linked = activities.find(a => a.id === d.activityId);
                const activityName = linked?.activityName || d.activityName || '-';
                const activityDept = getDepartmentName(linked?.department || d.activitySubject || '-');

                return (
                  <tr key={d.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.processorName}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-700">{activityName}</p>
                        <p className="text-xs text-gray-400">{activityDept}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{d.purpose}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{d.createdAt}</td>

                    {/* จุดที่เปลี่ยนโค้ดสำหรับจัดการ DP */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-2 flex-wrap">

                        {/* DRAFT — ปุ่มEdit */}
                        {d.status === 'DRAFT' && (
                          <button
                            onClick={() => router.push(`/dc/create-dp/${d.activityId}?edit=${d.id}`)}
                            className="text-xs text-gray-600 border border-gray-300 px-2.5 py-1 rounded hover:bg-gray-50 transition">
                            Edit
                          </button>
                        )}

                        {/* REJECTED — ปุ่มสไตล์เดียวกับ + DP Form */}
                        {d.status === 'REJECTED' && (
                          <button
                            onClick={() => router.push(`/dc/create-dp/${d.activityId}?edit=${d.id}`)}
                            className="text-xs text-red-600 border border-red-300 px-2.5 py-1 rounded hover:bg-red-50 transition">
                            Edit
                          </button>
                        )}

                        {(d.status === 'DRAFT' || d.status === 'PENDING' || d.status === 'REJECTED') && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();

                              if (!confirm(`ลบ DP Form ของ "${d.processorName}" ใช่ไหม?`)) return;

                              try {
                                const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/access/${d.id}`, {
                                  method: 'DELETE',
                                });

                                const data = await res.json();

                                if (!res.ok) {
                                  notifyError(data.detail || data.error || 'ลบ DP Form ไม่สำเร็จ');
                                  return;
                                }

                                setMyDP(prev => prev.filter(item => item.id !== d.id));
                              } catch (error) {
                                console.error(error);
                                notifyError('ลบ DP Form ไม่สำเร็จ');
                              }
                            }}
                            className="text-xs text-red-400 border border-red-200 px-2.5 py-1 rounded hover:bg-red-50 transition"
                          >
                            ลบ
                          </button>
                        )}

                      </div>

                      {/* เพิ่มการแสดงเหตุผล reject สำหรับ DP เหมือนของ DC */}
                      {d.status === 'REJECTED' && d.rejectionReason && (
                        <div
                          className="mt-2 text-xs text-red-500 max-w-[160px] flex items-center gap-1"
                          title={d.rejectionReason}
                        >
                          <MessageSquareWarning className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{d.rejectionReason}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    {dpLoading ? 'กำลังโหลดข้อมูล...' : 'ไม่พบข้อมูล'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* FLOATING BUTTON */}
      {/* <div className="fixed bottom-6 right-6 z-50 group">
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
          Create Activity
        </div>
      </div> */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="bg-[#203690] text-white w-14 h-14 flex items-center justify-center
  rounded-xl shadow-lg hover:bg-[#182a73] transition text-2xl"
        >
          +
        </button>
        <div className="absolute right-16 top-1/2 -translate-y-1/2
  bg-black text-white text-sm px-3 py-1 rounded-md
  opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          Create Menu
        </div>
      </div>

    </div>
  );
}