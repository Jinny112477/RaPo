//หน้าactivity ทั้งหมดในระบบ
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRopa } from '@/lib/ropaContext';
import { Plus } from "lucide-react";

const Field = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <p className="text-xs text-gray-400 mb-2">{label}</p>
    <p className="text-sm text-gray-700">{value || '-'}</p>
  </div>
);

const ActivityModal = ({ data, onClose }: { data: any; onClose: () => void }) => {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{data.activityName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          <Field label="Personal Data Collected" value={Array.isArray(data.personalData) ? data.personalData.join(', ') : data.personalData} />
          <Field label="Purpose" value={data.purpose} />
          <Field label="Data Controller" value={data.owner} />
          <Field label="Retention Period" value={data.retentionPeriod} />
          <Field label="Access Rights" value={data.accessRights} />
          <Field label="Data Disclosure" value={data.disclosure} />
          <Field label="Objection / Refusal" value={data.objection} />
          <Field label="Security Measures" value={data.securityMeasure} />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-end">
          
          <button
            onClick={() => router.push(`/dp-form?activityId=${data.id}`)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Request DP Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { deleteActivity } = useRopa()
  const { activities } = useRopa();
  const { user, role } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const filtered = activities
    .filter(a => a.status === 'ACTIVE')
    .filter(a => {
      const matchSearch =
        a.activityName?.toLowerCase().includes(search.toLowerCase());

      const matchDept =
        deptFilter === 'ALL' || a.department === deptFilter;

      return matchSearch && matchDept;
    });


  const statusBadge = (status: string) => {
    if (status === 'ACTIVE') return 'bg-green-100 text-green-700';
    if (status === 'REVIEW') return 'bg-yellow-100 text-yellow-700';
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* OVERVIEW BOX */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          All Activity
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          กิจกรรมทั้งหมดในระบบ
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-black rounded-md overflow-hidden">

        {/* HEADER + SEARCH */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          {/* ฝั่งซ้าย: หัวข้อ */}
          <div>
            <p className="text-sm font-semibold text-gray-700">กิจกรรมล่าสุด</p>
            <p className="text-xs text-gray-400">{filtered.length} รายการ</p>
          </div>

          {/* ฝั่งขวา: Filter และ Search มัดรวมกัน */}
          <div className="flex items-center gap-3">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="border border-gray-400 rounded px-3 py-1.5 text-sm
            focus:outline-none focus:ring-1 focus:ring-[#203690]"
            >
              <option value="ALL">ทุกแผนก</option>
              {/* แก้ value ให้ตรงกับข้อมูล department ใน mockActivities */}
              <option value="ฝ่ายทรัพยากรบุคคล">ฝ่ายทรัพยากรบุคคล (HR)</option>
              <option value="ฝ่ายการตลาด">ฝ่ายการตลาด (Marketing)</option>
              <option value="ฝ่ายไอที">ฝ่ายไอที (IT)</option>
            </select>

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
                  <td className="px-4 py-3 text-gray-500">{a.department}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.legalBasis}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskBadge(a.riskLevel)}`}>
                      {a.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs flex items-center justify-between">
                    <span>{a.updatedAt}</span>
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
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
              rounded-xl shadow-lg hover:bg-[#182a73]
              hover:shadow-xl transition duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>

          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white
            text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100
            transition whitespace-nowrap">
            Create DC Form
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {selectedActivity && (
        <ActivityModal
          data={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}

    </div>
  );
}