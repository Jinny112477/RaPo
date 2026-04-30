'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notifyError, notifySuccess } from '@/lib/notify';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type FormType = 'dc' | 'dp';

type DepartmentOption = {
  department_id: string;
  department_name: string;
};

type DCRopaDetail = {
  activity_id: string;
  activity_name?: string;
  activity_subject?: string;
  purpose?: string;
  approval_status?: string;
  denial_details?: string | null;
  consentless_data?: string | null;
  source?: { name?: string };
  legal_basis?: { name?: string };
  obtaining_data?: { name?: string };
  obtaining_method_detail?: { name?: string };
  policy?: {
    retention_period?: string;
    deletion_method?: string;
    data_type?: string;
  };
  security_measurement?: {
    organizational_measures?: string;
    technical_measures?: string;
    physical_measures?: string;
    access_control?: string;
    define_responsibility?: string;
    audit_trail?: string;
  };
  dpo_review?: {
    approval_status?: string;
    comment?: string | null;
    return_at?: string | null;
    user_id?: string;
  } | null;
};

type DpDetail = {
  request_id: string;
  activity_id: string;
  requested_by?: string;
  purpose?: string;
  scope?: string | null;
  duration?: string | null;
  processor_name?: string | null;
  processor_address?: string | null;
  approval_status?: string;
  created_at?: string;
  updated_at?: string | null;
  requester?: {
    name?: string;
    email?: string;
  };
  activity?: {
    activity_name?: string;
    activity_subject?: string;
    purpose?: string;
    legal_basis?: { name?: string };
    obtaining_data?: { name?: string };
    obtaining_method_detail?: { name?: string };
    policy?: { retention_period?: string };
  };
};

type DCDraftPayload = {
  companyName?: string;
  department?: string;
  activityName?: string;
  dataOwner?: string;
  recorderEmail?: string;
  recordDate?: string;
  dpcName?: string;
  purpose?: string;
  legalBasis?: string[];
  legalBasisNote?: string;
  dataSubjects?: string[];
  personalDataTypes?: string[];
  collectionMethods?: string[];
  otherDataNote?: string;
  retentionPeriod?: string;
  retentionValue?: string;
  retentionUnit?: string;
  retentionCriteria?: string;
  deletionMethods?: string[];
  retentionNote?: string;
  secOrg?: string;
  secTech?: string;
  secPhysical?: string;
  secAccess?: string;
  secResponsibility?: string;
  secAudit?: string;
};

const splitCsv = (value?: string | null) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseDraftPayload = (value?: string | null): DCDraftPayload | null => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const ReadText = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-gray-500">{label}</p>
    <input
      disabled
      value={value || '-'}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700"
      readOnly
    />
  </div>
);

const ReadArea = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-gray-500">{label}</p>
    <textarea
      disabled
      value={value || '-'}
      rows={3}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 resize-none"
      readOnly
    />
  </div>
);

const ReadChips = ({ label, values }: { label: string; values: string[] }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-gray-500">{label}</p>
    <input
      disabled
      value={values.length > 0 ? values.join(', ') : '-'}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700"
      readOnly
    />
  </div>
);

export default function DPOReviewDetailPage() {
  const params = useParams<{ formType: string; id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const formType = params.formType as FormType;
  const id = params.id;

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [dcDetail, setDcDetail] = useState<DCRopaDetail | null>(null);
  const [dpDetail, setDpDetail] = useState<DpDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const getDepartmentName = (departmentIdOrName?: string) => {
    if (!departmentIdOrName) return '-';
    const found = departments.find((department) => department.department_id === departmentIdOrName);
    return found?.department_name || departmentIdOrName;
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/departments`);
        const data = await res.json();
        if (!res.ok) return;
        setDepartments(data.data || []);
      } catch {
        // ignore optional mapping error
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id || (formType !== 'dc' && formType !== 'dp')) {
        notifyError('ไม่พบข้อมูลฟอร์มที่ต้องการ');
        router.push('/dpo/review');
        return;
      }

      try {
        setLoading(true);
        const endpoint = formType === 'dc' ? `${API_URL}/api/dpo/ropa/${id}` : `${API_URL}/api/access/${id}`;
        const res = await fetch(endpoint);
        const data = await res.json();

        if (!res.ok) {
          notifyError(data.detail || data.error || 'โหลดข้อมูลฟอร์มไม่สำเร็จ');
          router.push('/dpo/review');
          return;
        }

        if (formType === 'dc') {
          setDcDetail(data.data || null);
        } else {
          setDpDetail(data.data || null);
        }
      } catch {
        notifyError('โหลดข้อมูลฟอร์มไม่สำเร็จ');
        router.push('/dpo/review');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [formType, id, router]);

  const dcDraft = useMemo(() => parseDraftPayload(dcDetail?.consentless_data), [dcDetail?.consentless_data]);

  const handleApprove = async () => {
    try {
      setSaving(true);
      const endpoint = formType === 'dc'
        ? `${API_URL}/api/dpo/ropa/${id}/approve`
        : `${API_URL}/api/access/${id}/approve`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        notifyError(data.detail || data.error || 'อนุมัติไม่สำเร็จ');
        return;
      }

      notifySuccess('อนุมัติเรียบร้อยแล้ว');
      router.push('/dpo/review');
    } catch {
      notifyError('อนุมัติไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (formType === 'dc' && !reason.trim()) {
      notifyError('กรุณาระบุคอมเมนต์ก่อนปฏิเสธ');
      return;
    }

    try {
      setSaving(true);
      const endpoint = formType === 'dc'
        ? `${API_URL}/api/dpo/ropa/${id}/reject`
        : `${API_URL}/api/access/${id}/reject`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formType === 'dc' ? { reason, userId: user?.id } : { userId: user?.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        notifyError(data.detail || data.error || 'ปฏิเสธไม่สำเร็จ');
        return;
      }

      notifySuccess('ปฏิเสธเรียบร้อยแล้ว');
      router.push('/dpo/review');
    } catch {
      notifyError('ปฏิเสธไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-sm text-gray-500">กำลังโหลดรายละเอียดฟอร์ม...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-blue-600">{formType === 'dc' ? 'DC Form Review' : 'DP Form Review'}</p>
        <h1 className="text-xl font-bold text-gray-900 mt-1">
          {formType === 'dc'
            ? (dcDraft?.activityName || dcDetail?.activity_name || '-')
            : (dpDetail?.processor_name || '-')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {formType === 'dc'
            ? getDepartmentName(dcDraft?.department || dcDetail?.activity_subject)
            : `ผูกกับกิจกรรม: ${dpDetail?.activity?.activity_name || '-'}`}
        </p>
      </div>

      {formType === 'dc' && dcDetail && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-bold text-gray-800">ข้อมูลองค์กร / เจ้าของกิจกรรม</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ReadText label="ชื่อบริษัท / องค์กร" value={dcDraft?.companyName || dcDetail.source?.name || '-'} />
              <ReadText label="แผนก / ฝ่ายที่รับผิดชอบ" value={getDepartmentName(dcDraft?.department || dcDetail.activity_subject)} />
              <ReadText label="ลักษณะกิจกรรมการประมวลผล" value={dcDraft?.activityName || dcDetail.activity_name} />
              <ReadText label="ผู้รับผิดชอบ (DATA OWNER)" value={dcDraft?.dataOwner} />
              <ReadText label="อีเมลผู้ลงบันทึก" value={dcDraft?.recorderEmail} />
              <ReadText label="วันที่/เดือน/ปีที่บันทึก" value={dcDraft?.recordDate} />
              <ReadText label="เจ้าหน้าที่คุ้มครองข้อมูล (DPO)" value={dcDraft?.dpcName} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-bold text-gray-800">วัตถุประสงค์และฐานทางกฎหมาย</p>
            <ReadArea label="วัตถุประสงค์ของการประมวลผล" value={dcDraft?.purpose || dcDetail.purpose} />
            <ReadChips label="ฐานทางกฎหมาย" values={dcDraft?.legalBasis || splitCsv(dcDetail.legal_basis?.name)} />
            <ReadArea label="หมายเหตุเพิ่มเติม" value={dcDraft?.legalBasisNote} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-bold text-gray-800">ประเภทข้อมูลและการจัดเก็บ</p>
            <ReadChips label="กลุ่มเจ้าของข้อมูล" values={dcDraft?.dataSubjects || []} />
            <ReadChips label="ประเภทข้อมูลส่วนบุคคลที่เก็บ" values={dcDraft?.personalDataTypes || splitCsv(dcDetail.policy?.data_type)} />
            <ReadChips label="วิธีการเก็บรวบรวมข้อมูล" values={dcDraft?.collectionMethods || splitCsv(dcDetail.obtaining_method_detail?.name)} />
            <ReadArea label="ระบุข้อมูลเพิ่มเติม" value={dcDraft?.otherDataNote} />
            <ReadText label="ระยะเวลาเก็บรักษา" value={dcDraft?.retentionPeriod || dcDetail.policy?.retention_period} />
            <ReadChips label="วิธีการทำลายข้อมูลเมื่อครบกำหนด" values={dcDraft?.deletionMethods || splitCsv(dcDetail.policy?.deletion_method)} />
            <ReadArea label="หมายเหตุเพิ่มเติม" value={dcDraft?.retentionNote} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-bold text-gray-800">มาตรการรักษาความปลอดภัย</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ReadArea label="มาตรการเชิงองค์กร" value={dcDraft?.secOrg || dcDetail.security_measurement?.organizational_measures} />
              <ReadArea label="มาตรการเชิงเทคนิค" value={dcDraft?.secTech || dcDetail.security_measurement?.technical_measures} />
              <ReadArea label="มาตรการทางกายภาพ" value={dcDraft?.secPhysical || dcDetail.security_measurement?.physical_measures} />
              <ReadArea label="การควบคุมการเข้าถึงข้อมูล" value={dcDraft?.secAccess || dcDetail.security_measurement?.access_control} />
              <ReadArea label="การกำหนดหน้าที่ความรับผิดชอบ" value={dcDraft?.secResponsibility || dcDetail.security_measurement?.define_responsibility} />
              <ReadArea label="มาตรการตรวจสอบย้อนหลัง" value={dcDraft?.secAudit || dcDetail.security_measurement?.audit_trail} />
            </div>
          </div>

          {dcDetail.dpo_review?.comment && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 space-y-2">
              <p className="text-sm font-bold text-amber-900">คอมเมนต์ล่าสุดจาก DPO</p>
              <p className="text-sm text-amber-800 whitespace-pre-wrap">{dcDetail.dpo_review.comment}</p>
            </div>
          )}
        </>
      )}

      {formType === 'dp' && dpDetail && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-bold text-gray-800">ข้อมูลผู้ขอใช้งาน (DP)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ReadText label="ชื่อผู้ประมวลผล" value={dpDetail.processor_name} />
              <ReadText label="ที่อยู่ผู้ประมวลผล" value={dpDetail.processor_address} />
              <ReadText label="ผู้ร้องขอ" value={dpDetail.requester?.name || dpDetail.requester?.email || dpDetail.requested_by} />
              <ReadText label="สถานะคำขอ" value={dpDetail.approval_status} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-bold text-gray-800">รายละเอียดคำขอใช้งานข้อมูล</p>
            <ReadArea label="วัตถุประสงค์ที่ขอใช้งาน" value={dpDetail.purpose} />
            <ReadArea label="ขอบเขตการใช้งานข้อมูล" value={dpDetail.scope} />
            <ReadText label="ระยะเวลาที่ขอใช้" value={dpDetail.duration} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-bold text-gray-800">ข้อมูลกิจกรรมต้นทาง (DC)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ReadText label="ชื่อกิจกรรม" value={dpDetail.activity?.activity_name} />
              <ReadText label="แผนก" value={getDepartmentName(dpDetail.activity?.activity_subject)} />
              <ReadText label="ฐานกฎหมาย" value={dpDetail.activity?.legal_basis?.name} />
              <ReadText label="ข้อมูลส่วนบุคคล" value={dpDetail.activity?.obtaining_data?.name} />
              <ReadText label="วิธีการเก็บข้อมูล" value={dpDetail.activity?.obtaining_method_detail?.name} />
              <ReadText label="ระยะเวลาเก็บรักษา" value={dpDetail.activity?.policy?.retention_period} />
            </div>
            <ReadArea label="วัตถุประสงค์ของกิจกรรมต้นทาง" value={dpDetail.activity?.purpose} />
          </div>
        </>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={() => router.push('/dpo/review')}
            className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            กลับหน้า Review Queue
          </button>

          <div className="flex items-center gap-2">
            {!rejecting ? (
              <>
                <button
                  onClick={() => {
                    if (formType === 'dp') {
                      handleReject();
                      return;
                    }
                    setRejecting(true);
                  }}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  ปฏิเสธ
                </button>
                <button
                  onClick={handleApprove}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  อนุมัติ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setRejecting(false);
                    setReason('');
                  }}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleReject}
                  disabled={saving || !reason.trim()}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  ยืนยันปฏิเสธ
                </button>
              </>
            )}
          </div>
        </div>

        {rejecting && formType === 'dc' && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">คอมเมนต์สำหรับการปฏิเสธ <span className="text-red-500">*</span></p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="ระบุเหตุผลที่ปฏิเสธเพื่อส่งกลับให้ผู้กรอกฟอร์ม"
              className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg bg-red-50 resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
        )}
      </div>
    </div>
  );
}
