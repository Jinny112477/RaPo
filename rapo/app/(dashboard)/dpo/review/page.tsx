'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRopa } from '@/lib/ropaContext';
import { StatusBadge, RiskBadge } from '@/components/StatusBadge';
import { Activity, DpRecord } from '@/types';
import { notifyError } from '@/lib/notify';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cn334-team07-ropa-2026.onrender.com';

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

type ApiRopa = {
  activity_id: string;
  user_id: string;
  activity_name: string;
  activity_subject: string;
  purpose: string;
  approval_status: string;
  created_at: string;
  updated_at: string | null;
  source?: {
    name?: string;
  };
  legal_basis?: {
    name?: string;
  };
  obtaining_data?: {
    name?: string;
  };
  obtaining_method_detail?: {
    name?: string;
  };
  policy?: {
    retention_period?: string;
  };
};

type DepartmentOption = {
  department_id: string;
  department_name: string;
};

const isToday = (value?: string | null) => {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return date.toDateString() === today.toDateString();
};

const formatRetentionPeriod = (value?: string | null) => {
  const raw = String(value || '').trim();
  if (!raw) return '-';

  const [retentionValue = '', retentionUnit = ''] = raw
    .split(' - ')
    .map((item) => item.trim());

  if (/(ปี|เดือน|วัน)/.test(retentionValue)) return retentionValue;
  if (retentionValue && /^(ปี|เดือน|วัน)$/.test(retentionUnit)) return `${retentionValue} ${retentionUnit}`;
  return raw;
};

const mapApiRopaToActivity = (item: ApiRopa): Activity => {
  const status =
    item.approval_status === 'approved'
      ? 'ACTIVE'
      : item.approval_status === 'rejected'
        ? 'REJECTED'
        : 'REVIEW';

  return {
    id: item.activity_id,
    activityName: item.activity_name || '-',
    department: item.activity_subject || item.source?.name || '-',
    owner: item.source?.name || '-',
    status,
    riskLevel: 'LOW',
    legalBasis: item.legal_basis?.name || '-',
    retentionPeriod: formatRetentionPeriod(item.policy?.retention_period),
    dataSubject: [item.source?.name || '-'],
    personalData: [item.obtaining_data?.name || '-'],
    processing: [item.obtaining_method_detail?.name || '-'],
    purpose: item.purpose || '-',
    updatedAt: item.updated_at
      ? new Date(item.updated_at).toLocaleDateString('th-TH')
      : new Date(item.created_at).toLocaleDateString('th-TH'),
  } as Activity;
};

// ─── Modal ดู DC ────────────────────────────────────────────────────────────────
function DCModal({ activity, onClose, onApprove, onReject, getDepartmentName }: {
  activity: Activity;
  onClose: () => void;
  onApprove: (id: string) => void | Promise<void>;
  onReject: (id: string, reason: string) => void | Promise<void>;
  getDepartmentName: (departmentIdOrName?: string) => string;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <div>
            <p className="text-xs font-semibold text-blue-600 mb-0.5">DC Form</p>
            <h2 className="text-base font-bold text-gray-800">{activity.activityName}</h2>
            <p className="text-xs text-gray-500">
              {getDepartmentName(activity.department)}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100">
            <XIcon />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={activity.status} size="md" />
            <RiskBadge level={activity.riskLevel} size="md" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'ฐานกฎหมาย', value: activity.legalBasis },
              { label: 'ระยะเวลาเก็บ', value: activity.retentionPeriod },
              { label: 'เจ้าของข้อมูล', value: activity.dataSubject.join(', ') },
              { label: 'ข้อมูลส่วนบุคคล', value: activity.personalData.join(', ') },
              { label: 'การประมวลผล', value: activity.processing.join(', ') },
              { label: 'อัปเดตล่าสุด', value: activity.updatedAt },
            ].map(f => (
              <div key={f.label} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                <p className="text-sm font-medium text-gray-700">{f.value}</p>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">วัตถุประสงค์</p>
            <p className="text-sm text-gray-700">{activity.purpose}</p>
          </div>

          {rejecting && (
            <div>
              <label className="text-sm font-medium text-gray-700">เหตุผลที่ปฏิเสธ <span className="text-red-500">*</span></label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                rows={3} placeholder="ระบุเหตุผล..."
                className="w-full mt-1 px-3 py-2 text-sm border border-red-200 rounded-lg bg-red-50 resize-none focus:outline-none focus:ring-1 focus:ring-red-400" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">ปิด</button>
          <div className="flex gap-2">
            {!rejecting ? (
              <>
                <button onClick={() => setRejecting(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                  <XIcon /> ปฏิเสธ
                </button>
                <button onClick={() => onApprove(activity.id)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                  <CheckIcon /> อนุมัติ
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setRejecting(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">ยกเลิก</button>
                <button onClick={() => reason.trim() && onReject(activity.id, reason)}
                  disabled={!reason.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                  <XIcon /> ยืนยันปฏิเสธ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DPModal({ dp, onClose, onApprove, onReject, getDepartmentName }: {
  dp: DpRecordUI;
  onClose: () => void;
  onApprove: (id: string) => void | Promise<void>;
  onReject: (id: string, reason: string) => void | Promise<void>;
  getDepartmentName: (departmentIdOrName?: string) => string;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <div>
            <p className="text-xs font-semibold text-emerald-600 mb-0.5">DP Form</p>
            <h2 className="text-base font-bold text-gray-800">{dp.processorName}</h2>
            <p className="text-xs text-gray-500">
              ผูกกับ {dp.activityName || 'ไม่พบชื่อกิจกรรม'}
            </p>
          </div>

          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100">
            <XIcon />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 mb-1">DC Record ที่ผูกอยู่</p>
            <p className="text-sm font-medium text-gray-800">{dp.activityName}</p>
            <p className="text-xs text-gray-500">{getDepartmentName(dp.activitySubject)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'ชื่อผู้ประมวลผล', value: dp.processorName },
              { label: 'ที่อยู่ผู้ประมวลผล', value: dp.processorAddress },
              { label: 'วันที่สร้าง', value: dp.createdAt },
              { label: 'สร้างโดย', value: dp.createdBy },
              { label: 'สถานะ', value: dp.status },
              { label: 'ฐานกฎหมายของ DC', value: dp.dcLegalBasis },
              { label: 'ข้อมูลส่วนบุคคล', value: dp.dcPersonalData },
              { label: 'วิธีเก็บข้อมูล', value: dp.dcMethod },
              { label: 'ระยะเวลาจัดเก็บ DC', value: dp.dcRetention },
            ].map(f => (
              <div key={f.label} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                <p className="text-sm font-medium text-gray-700">{f.value || '-'}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">วัตถุประสงค์ที่ DP ขอใช้</p>
            <p className="text-sm text-gray-700">{dp.purpose}</p>
          </div>

          {dp.scope && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">ขอบเขตการใช้งาน</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{dp.scope}</p>
            </div>
          )}

          {dp.duration && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">ระยะเวลาที่ขอใช้</p>
              <p className="text-sm text-gray-700">{dp.duration}</p>
            </div>
          )}

          {rejecting && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                เหตุผลที่ปฏิเสธ <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="ระบุเหตุผล..."
                className="w-full mt-1 px-3 py-2 text-sm border border-red-200 rounded-lg bg-red-50 resize-none focus:outline-none focus:ring-1 focus:ring-red-400"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">
            ปิด
          </button>

          <div className="flex gap-2">
            {!rejecting ? (
              <>
                <button
                  onClick={() => setRejecting(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                >
                  <XIcon /> ปฏิเสธ
                </button>

                <button
                  onClick={() => onApprove(dp.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                >
                  <CheckIcon /> อนุมัติ
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setRejecting(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">
                  ยกเลิก
                </button>

                <button
                  onClick={() => reason.trim() && onReject(dp.id, reason)}
                  disabled={!reason.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <XIcon /> ยืนยันปฏิเสธ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type ApiAccessRequest = {
  request_id: string;
  activity_id: string;
  requested_by: string;
  requester?: {
    user_id?: string;
    name?: string;
    email?: string;
  };
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

  dcLegalBasis?: string;
  dcPersonalData?: string;
  dcMethod?: string;
  dcRetention?: string;

  scope?: string | null;
  duration?: string | null;
};

const mapAccessToDpRecord = (item: ApiAccessRequest): DpRecordUI => {
  return {
    id: item.request_id,
    activityId: item.activity_id,

    processorName:
      item.processor_name ||
      item.activity?.activity_subject ||
      "ไม่ระบุผู้ประมวลผล",

    processorAddress: item.processor_address || "-",

    purpose: item.purpose || "-",

    status:
      item.approval_status === "approved"
        ? "APPROVED"
        : item.approval_status === "rejected"
          ? "REJECTED"
          : "PENDING",

    createdBy:
      item.requester?.name ||
      item.requester?.email ||
      item.requested_by,

    createdAt: item.updated_at || item.created_at
      ? new Date(item.updated_at || item.created_at).toLocaleDateString("th-TH")
      : "-",

    activityName: item.activity?.activity_name || "-",
    activitySubject: item.activity?.activity_subject || "-",
    scope: item.scope,
    duration: item.duration,
  } as DpRecordUI;
};

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function DPOReviewPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dc' | 'dp'>('dc');

  const { activities } = useRopa();

  const [dcQueue, setDcQueue] = useState<Activity[]>([]);
  const [dcLoading, setDcLoading] = useState(false);
  const [dcProcessed, setDcProcessed] = useState<{ id: string; action: 'approved' | 'rejected' }[]>([]);
  const [viewingDC, setViewingDC] = useState<Activity | null>(null);
  const [allDcRows, setAllDcRows] = useState<ApiRopa[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const [dpQueue, setDpQueue] = useState<DpRecordUI[]>([]);
  const [dpLoading, setDpLoading] = useState(false);
  const [dpProcessed, setDpProcessed] = useState<{ id: string; action: 'approved' | 'rejected' }[]>([]);
  const [viewingDP, setViewingDP] = useState<DpRecordUI | null>(null);
  const [allDpRows, setAllDpRows] = useState<ApiAccessRequest[]>([]);

  const getDepartmentName = (departmentIdOrName?: string) => {
    if (!departmentIdOrName) return '-';

    const found = departments.find((department) => department.department_id === departmentIdOrName);
    return found?.department_name || departmentIdOrName;
  };

  const fetchPendingRopa = async () => {
    try {
      setDcLoading(true);

      const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/dpo/ropa/pending`);
      const data = await res.json();

      if (!res.ok) {
        console.log('FETCH DPO ROPA ERROR:', data);
        notifyError(data.detail || data.error || 'โหลดรายการ ROPA ไม่สำเร็จ');
        return;
      }

      const mapped = (data.data || []).map(mapApiRopaToActivity);
      setDcQueue(mapped);
    } catch (error) {
      console.error(error);
      notifyError('โหลดรายการ ROPA ไม่สำเร็จ');
    } finally {
      setDcLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRopa();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/departments`);
        const data = await res.json();

        if (!res.ok) {
          console.log('FETCH DEPARTMENTS ERROR:', data);
          return;
        }

        setDepartments(data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDepartments();
  }, []);

  const fetchAllRopa = async () => {
    try {
      const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/dpo/ropa`);
      const data = await res.json();

      if (!res.ok) {
        console.log('FETCH ALL DPO ROPA ERROR:', data);
        return;
      }

      setAllDcRows(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllRopa();
  }, []);

  const fetchPendingDPForms = async () => {
    try {
      setDpLoading(true);

      const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/access/pending`);
      const data = await res.json();

      if (!res.ok) {
        console.log('FETCH DP PENDING ERROR:', data);
        notifyError(data.detail || data.error || 'โหลด DP Form ไม่สำเร็จ');
        return;
      }

      const mapped = (data.data || []).map(mapAccessToDpRecord);
      setDpQueue(mapped);
    } catch (error) {
      console.error(error);
      notifyError('โหลด DP Form ไม่สำเร็จ');
    } finally {
      setDpLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDPForms();
  }, []);

  const fetchAllDPForms = async () => {
    try {
      const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/access`);
      const data = await res.json();

      if (!res.ok) {
        console.log('FETCH ALL DP ERROR:', data);
        return;
      }

      setAllDpRows(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllDPForms();
  }, []);

  const approvedTodayCount = useMemo(() => {
    const dcApproved = allDcRows.filter((item) => item.approval_status === 'approved' && isToday(item.updated_at || item.created_at)).length;
    const dpApproved = allDpRows.filter((item) => item.approval_status === 'approved' && isToday(item.updated_at || item.created_at)).length;

    return dcApproved + dpApproved;
  }, [allDcRows, allDpRows]);

  const rejectedTodayCount = useMemo(() => {
    const dcRejected = allDcRows.filter((item) => item.approval_status === 'rejected' && isToday(item.updated_at || item.created_at)).length;
    const dpRejected = allDpRows.filter((item) => item.approval_status === 'rejected' && isToday(item.updated_at || item.created_at)).length;

    return dcRejected + dpRejected;
  }, [allDcRows, allDpRows]);

  const handleDCApprove = async (id: string) => {
    try {
      const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/dpo/ropa/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log('APPROVE ROPA ERROR:', data);
        notifyError(data.detail || data.error || 'อนุมัติไม่สำเร็จ');
        return;
      }

      setDcQueue(q => q.filter(a => a.id !== id));
      setDcProcessed(p => [...p, { id, action: 'approved' }]);
      setAllDcRows((rows) => rows.map((item) => item.activity_id === id ? { ...item, approval_status: 'approved', updated_at: new Date().toISOString() } : item));
      setViewingDC(null);
    } catch (error) {
      console.error(error);
      notifyError('อนุมัติไม่สำเร็จ');
    }
  };

  const handleDCReject = async (id: string, reason: string) => {
    try {
      const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/dpo/ropa/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log('REJECT ROPA ERROR:', data);
        notifyError(data.detail || data.error || 'ปฏิเสธไม่สำเร็จ');
        return;
      }

      setDcQueue(q => q.filter(a => a.id !== id));
      setDcProcessed(p => [...p, { id, action: 'rejected' }]);
      setAllDcRows((rows) => rows.map((item) => item.activity_id === id ? { ...item, approval_status: 'rejected', updated_at: new Date().toISOString() } : item));
      setViewingDC(null);
    } catch (error) {
      console.error(error);
      notifyError('ปฏิเสธไม่สำเร็จ');
    }
  };

  const handleDPApprove = async (id: string) => {
    try {
      const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/access/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log('APPROVE DP ERROR:', data);
        notifyError(data.detail || data.error || 'อนุมัติ DP Form ไม่สำเร็จ');
        return;
      }

      setDpQueue(q => q.filter(d => d.id !== id));
      setDpProcessed(p => [...p, { id, action: 'approved' }]);
      setAllDpRows((rows) => rows.map((item) => item.request_id === id ? { ...item, approval_status: 'approved', updated_at: new Date().toISOString() } : item));
      setViewingDP(null);
    } catch (error) {
      console.error(error);
      notifyError('อนุมัติ DP Form ไม่สำเร็จ');
    }
  };

  const handleDPReject = async (id: string, reason: string) => {
    try {
      const res = await fetch(`https://cn334-team07-ropa-2026.onrender.com/api/access/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log('REJECT DP ERROR:', data);
        notifyError(data.detail || data.error || 'ปฏิเสธ DP Form ไม่สำเร็จ');
        return;
      }

      setDpQueue(q => q.filter(d => d.id !== id));
      setDpProcessed(p => [...p, { id, action: 'rejected' }]);
      setAllDpRows((rows) => rows.map((item) => item.request_id === id ? { ...item, approval_status: 'rejected', updated_at: new Date().toISOString() } : item));
      setViewingDP(null);
    } catch (error) {
      console.error(error);
      notifyError('ปฏิเสธ DP Form ไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Approval Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          ตรวจสอบและอนุมัติ ROPA Form ของ DC และ DP
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Form DC รออนุมัติ', value: dcQueue.length, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
          { label: 'Form DP รออนุมัติ', value: dpQueue.length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'อนุมัติวันนี้', value: approvedTodayCount, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'ปฏิเสธวันนี้', value: rejectedTodayCount, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.bg} p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('dc')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all
            ${activeTab === 'dc'
              ? 'bg-[#203690] text-white border-[#203690]'
              : 'bg-white text-gray-600 border-gray-300 hover:border-[#203690]'}`}>
          DC Form
          {dcQueue.length > 0 && (
            <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full">
              {dcQueue.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('dp')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all
            ${activeTab === 'dp'
              ? 'bg-[#203690] text-white border-[#203690]'
              : 'bg-white text-gray-600 border-gray-300 hover:border-[#203690]'}`}>
          DP Form
          {dpQueue.length > 0 && (
            <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full">
              {dpQueue.length}
            </span>
          )}
        </button>
      </div>

      {/* DC TAB */}
      {activeTab === 'dc' && (
        <div className="bg-white border border-black rounded-md overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">DC Form รออนุมัติ ({dcQueue.length})</p>
            {dcQueue.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-yellow-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                รอดำเนินการ
              </span>
            )}
          </div>
          {dcLoading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              กำลังโหลดรายการ ROPA...
            </div>
          ) : dcQueue.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              ไม่มี DC Form ที่รออนุมัติ
            </div>
          ) : (
            <div className="divide-y">
              {dcQueue.map(act => (
                <div key={act.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">DC Form</span>
                      <RiskBadge level={act.riskLevel} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{act.activityName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{getDepartmentName(act.department)} · {act.owner} · {act.updatedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => router.push(`/dpo/review/dc/${act.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
                      <EyeIcon /> ดู
                    </button>
                    <button onClick={() => handleDCApprove(act.id)}
                      className="p-2 rounded-lg text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100" title="อนุมัติ">
                      <CheckIcon />
                    </button>
                    <button onClick={() => router.push(`/dpo/review/dc/${act.id}`)}
                      className="p-2 rounded-lg text-red-500 bg-red-50 border border-red-200 hover:bg-red-100" title="ปฏิเสธ">
                      <XIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recently processed DC */}
          {dcProcessed.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="px-5 py-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase">ดำเนินการแล้ว</p>
              </div>
              {dcProcessed.map(({ id, action }) => {
                const act = activities.find(a => a.id === id); // ใช้ activities จาก Context
                if (!act) return null;
                return (
                  <div key={id} className="flex items-center gap-3 px-5 py-3 border-t">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${action === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                      {action === 'approved' ? <CheckIcon /> : <XIcon />}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{act.activityName}</p>
                      <p className="text-xs text-gray-400">{getDepartmentName(act.department)}</p>
                    </div>
                    <span className={`text-xs font-semibold ${action === 'approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {action === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DP TAB */}
      {activeTab === 'dp' && (
        <div className="bg-white border border-black rounded-md overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">DP Form รออนุมัติ ({dpQueue.length})</p>
            {dpQueue.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-yellow-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                รอดำเนินการ
              </span>
            )}
          </div>
          {dpLoading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              กำลังโหลด DP Form...
            </div>
          ) : dpQueue.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              ไม่มี DP Form ที่รออนุมัติ
            </div>
          ) : (
            <div className="divide-y">
              {dpQueue.map(dp => {
                return (
                  <div key={dp.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">DP Form</span>
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                          ผูกกับ {dp.activityName || 'ไม่พบชื่อกิจกรรม'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{dp.processorName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {dp.purpose} · สร้างโดย {dp.createdBy} · {dp.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => router.push(`/dpo/review/dp/${dp.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
                        <EyeIcon /> ดู
                      </button>
                      <button onClick={() => handleDPApprove(dp.id)}
                        className="p-2 rounded-lg text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100" title="อนุมัติ">
                        <CheckIcon />
                      </button>
                      <button onClick={() => router.push(`/dpo/review/dp/${dp.id}`)}
                        className="p-2 rounded-lg text-red-500 bg-red-50 border border-red-200 hover:bg-red-100" title="ปฏิเสธ">
                        <XIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {dpProcessed.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="px-5 py-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase">ดำเนินการแล้ว</p>
              </div>

              {dpProcessed.map(({ id, action }) => (
                <div key={id} className="flex items-center gap-3 px-5 py-3 border-t">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${action === 'approved'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-red-100 text-red-500'
                    }`}>
                    {action === 'approved' ? <CheckIcon /> : <XIcon />}
                  </span>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">DP Form</p>
                    <p className="text-xs text-gray-400">{id}</p>
                  </div>

                  <span className={`text-xs font-semibold ${action === 'approved' ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                    {action === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {viewingDC && (
        <DCModal activity={viewingDC} onClose={() => setViewingDC(null)}
          onApprove={handleDCApprove} onReject={handleDCReject} getDepartmentName={getDepartmentName} />
      )}
      {viewingDP && (
        <DPModal dp={viewingDP} onClose={() => setViewingDP(null)}
          onApprove={handleDPApprove} onReject={handleDPReject} getDepartmentName={getDepartmentName} />
      )}
    </div>
  );
}