//หน้าactivity ทั้งหมดในระบบ
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mapApiRopaToActivity } from '@/lib/mapRopa';
import { notifyError } from '@/lib/notify';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type DepartmentOption = {
  department_id: string;
  department_name: string;
};
import { useRopa } from '@/lib/ropaContext';

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <p className="text-xs text-gray-400 mb-2">{label}</p>
    <p className="text-sm text-gray-700">{value || '-'}</p>
  </div>
);

const ActivityModal = ({ activityId, activityName, onClose }: { activityId: string; activityName: string; onClose: () => void }) => {
  const router = useRouter();
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/form/${activityId}`);
        const json = await res.json();
        if (res.ok && json.data) {
          const raw = json.data;
          let parsed: any = {};
          try { parsed = JSON.parse(raw.consentless_data || '{}'); } catch { parsed = {}; }
          const sub = parsed.subs?.[0] || {};
          const ownerCandidate = String(parsed.ownerName || parsed.dataOwner || '').trim();
          let ownerDisplay = ownerCandidate;

          try {
            const shouldResolve =
              !ownerDisplay ||
              UUID_REGEX.test(ownerDisplay) ||
              ownerDisplay === String(raw.activity_subject || '').trim();

            if (shouldResolve) {
              const [usersRes, departmentsRes] = await Promise.all([
                fetch(`${API_URL}/api/users`),
                fetch(`${API_URL}/api/departments`),
              ]);

              const usersJson = usersRes.ok ? await usersRes.json() : [];
              const departmentsJson = departmentsRes.ok ? await departmentsRes.json() : [];
              const users = Array.isArray(usersJson) ? usersJson : usersJson?.data || [];
              const departments = Array.isArray(departmentsJson) ? departmentsJson : departmentsJson?.data || [];

              if (ownerDisplay && UUID_REGEX.test(ownerDisplay)) {
                const ownerUser = users.find((u: any) => u?.user_id === ownerDisplay);
                ownerDisplay = ownerUser?.name || '';
              }

              const looksLikeDepartment = departments.some(
                (d: any) => d?.department_id === ownerDisplay || d?.department_name === ownerDisplay,
              );

              if (!ownerDisplay || looksLikeDepartment) {
                const creator = users.find((u: any) => u?.user_id === raw.user_id);
                ownerDisplay = creator?.name || '';
              }
            }
          } catch (resolveErr) {
            console.error(resolveErr);
          }

          ownerDisplay = ownerDisplay || '-';

          setDetail({
            personalDataItems: Array.isArray(sub.personalDataItems) ? sub.personalDataItems.join(', ') : (raw.policy?.data_type || raw.obtaining_data?.name || '-'),
            purpose: sub.purpose || raw.purpose || parsed.purpose || '-',
            dataOwner: ownerDisplay,
            retentionPeriod: sub.retentionPeriod || raw.policy?.retention_period || '-',
            accessRights: sub.accessRights || '-',
            exemptDisclosure: sub.exemptDisclosure || '-',
            rightsDenial: sub.rightsDenial || '-',
            secMeasures: [
              parsed.secOrg || raw.security_measurement?.organizational_measures,
              parsed.secTech || raw.security_measurement?.technical_measures,
              parsed.secPhysical || raw.security_measurement?.physical_measures,
            ].filter(Boolean).join(', ') || '-',
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDetail(false);
      }
    };
    load();
  }, [activityId]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{activityName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {loadingDetail ? (
            <p className="text-sm text-gray-400 text-center py-10">กำลังโหลด...</p>
          ) : detail ? (
            <>
              <Field label="ข้อมูลส่วนบุคคลที่เก็บรวบรวม" value={detail.personalDataItems} />
              <Field label="วัตถุประสงค์" value={detail.purpose} />
              <Field label="เจ้าของข้อมูล (Data Owner)" value={detail.dataOwner} />
              <Field label="ระยะเวลาการเก็บรักษา" value={detail.retentionPeriod} />
              <Field label="สิทธิ์การเข้าถึงข้อมูล" value={detail.accessRights} />
              <Field label="การยกเว้นการเปิดเผยข้อมูล" value={detail.exemptDisclosure} />
              <Field label="เหตุผลการปฏิเสธสิทธิ์" value={detail.rightsDenial} />
              <Field label="มาตรการความปลอดภัย" value={detail.secMeasures} />
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">ไม่พบข้อมูล</p>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-end">
          <button
            onClick={() => router.push(`/dc/create-dp/${activityId}`)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            ขอใช้งานข้อมูล (DP Form)
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { } = useRopa();
  const { role, isLoading } = useAuth();
  const router = useRouter();

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const isDataOwner = !isLoading && role;

  const getDepartmentName = (departmentIdOrName?: string) => {
    if (!departmentIdOrName) return '-';
    const found = departments.find((department) => department.department_id === departmentIdOrName);
    return found?.department_name || departmentIdOrName;
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/form`);
      const data = await res.json();

      if (!res.ok) {
        console.log('FETCH DASHBOARD ERROR:', data);
        notifyError(data.detail || data.error || 'โหลดข้อมูลไม่สำเร็จ');
        return;
      }

      const mapped = (data.data || []).map(mapApiRopaToActivity);
      setActivities(mapped);
    } catch (error) {
      console.error(error);
      notifyError('โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  // const deleteActivity = async (id: string) => {
  //   if (!confirm('ต้องการลบรายการนี้ใช่ไหม?')) return;

  //   try {
  //     const res = await fetch(`${API_URL}/api/form/${id}`, {
  //       method: 'DELETE',
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       console.log('DELETE FORM ERROR:', data);
  //       notifyError(data.detail || data.error || 'ลบข้อมูลไม่สำเร็จ');
  //       return;
  //     }

  //     setActivities(prev => prev.filter(a => a.id !== id));
  //   } catch (error) {
  //     console.error(error);
  //     notifyError('ลบข้อมูลไม่สำเร็จ');
  //   }
  // };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/departments`);
        const data = await res.json();

        if (!res.ok) return;
        setDepartments(data.data || []);
      } catch (error) {
        console.error('FETCH DEPARTMENTS ERROR:', error);
      }
    };

    fetchDepartments();
  }, []);

  const filtered = useMemo(() => {
    return activities
      .filter(a => a.status === 'ACTIVE')
      .filter(a => {
        const matchSearch =
          a.activityName?.toLowerCase().includes(search.toLowerCase());

        const departmentName = getDepartmentName(a.department);

        const matchDept =
          deptFilter === 'ALL' ||
          a.department === deptFilter ||
          departmentName === deptFilter;

        return matchSearch && matchDept;
      });
  }, [activities, search, deptFilter, getDepartmentName]);

  // const statusBadge = (status: string) => {
  //   if (status === 'ACTIVE') return 'bg-green-100 text-green-700';
  //   if (status === 'REVIEW') return 'bg-yellow-100 text-yellow-700';
  //   if (status === 'DRAFT') return 'bg-gray-100 text-gray-600';
  //   if (status === 'REJECTED') return 'bg-red-100 text-red-700';
  //   if (status === 'ARCHIVED') return 'bg-slate-100 text-slate-500';
  //   return 'bg-gray-100 text-gray-600';
  // };

  const riskBadge = (risk: string) => {
    if (risk === 'LOW') return 'bg-green-50 text-green-700';
    if (risk === 'MEDIUM') return 'bg-yellow-50 text-yellow-700';
    if (risk === 'HIGH') return 'bg-orange-50 text-orange-700';
    if (risk === 'CRITICAL') return 'bg-red-50 text-red-700';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Activity</h1>
        <p className="text-sm text-gray-500 mt-1">กิจกรรมทั้งหมดในระบบ</p>
      </div>

      <div className="bg-white border border-black rounded-md overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <div>
            <p className="text-sm font-semibold text-gray-700">กิจกรรมล่าสุด</p>
            <p className="text-xs text-gray-400">{filtered.length} รายการ</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="border border-gray-400 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#203690]"
            >
              <option value="ALL">ทุกแผนก</option>
              {departments.map((department) => (
                <option key={department.department_id} value={department.department_id}>
                  {department.department_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="ค้นหากิจกรรม..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-400 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#203690]"
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-100 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">ชื่อกิจกรรม</th>
              <th className="px-4 py-2 text-left">แผนก</th>
              <th className="px-4 py-2 text-left">ฐานกฎหมาย</th>
              <th className="px-4 py-2 text-left">ความเสี่ยง</th>
              <th className="px-4 py-2 text-left">อัปเดตล่าสุด</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filtered.length > 0 ? (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelectedActivity(a)}
                  className="border-t hover:bg-gray-100 transition cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{a.activityName}</td>
                  <td className="px-4 py-3 text-gray-500">{getDepartmentName(a.department)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.legalBasis}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskBadge(a.riskLevel)}`}>
                      {a.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs flex items-center justify-between">
                    <span>{a.updatedAt}</span>
                    {isDataOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dp-form?activityId=${a.id}`);
                        }}
                        className="ml-2 px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition"
                        title="Request DP Form"
                      >
                        Request DP
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
  <td colSpan={7} className="text-center py-10 text-gray-400">
    {loading ? 'กำลังโหลดข้อมูล...' : 'ไม่พบข้อมูลกิจกรรม'}
    </td>
  </tr>
            )
}
          </tbody >
        </table >
      </div >

      {(role === 'Admin' || isDataOwner) && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <button
            onClick={() => router.push('/ropa/create')}
            className="bg-[#203690] text-white w-14 h-14 flex items-center justify-center rounded-xl shadow-lg hover:bg-[#182a73] hover:shadow-xl transition duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            Create DC Form
          </div>
        </div>
      )}

      {selectedActivity && (
        <ActivityModal
          activityId={selectedActivity.id}
          activityName={selectedActivity.activityName}
          onClose={() => setSelectedActivity(null)}
        />
      )}

    </div>
  )
}