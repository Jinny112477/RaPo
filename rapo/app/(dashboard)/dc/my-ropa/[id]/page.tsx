'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRopa } from '@/lib/ropaContext';
import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';

function ReadField({ label, value }: { label: string; value?: string | string[] }) {
  const display = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <div className="min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 whitespace-pre-wrap">
        {display || <span className="text-slate-400">-</span>}
      </div>
    </div>
  );
}

export default function MyRopaDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { activities, deleteActivity } = useRopa();
  const { user } = useAuth();

  const activity = useMemo(
    () => activities.find((a) => a.id === id),
    [activities, id]
  );

  if (!activity) {
    return <div className="p-6">ไม่พบข้อมูล</div>;
  }

  const canEdit = activity.status === 'DRAFT' || activity.status === 'REJECTED';
  const canCreateDP = activity.status === 'ACTIVE';

  const handleDelete = () => {
    const confirmDelete = confirm('ต้องการลบรายการนี้ใช่หรือไม่?');
    if (!confirmDelete) return;

    deleteActivity(activity.id);
    router.back();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* 🔴 Rejection Banner */}
      {activity.status === 'REJECTED' && activity.rejectionReason && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <div className="font-semibold">รายการถูกปฏิเสธ</div>
          <div className="text-sm mt-1">{activity.rejectionReason}</div>
        </div>
      )}

      {/* STEP 1 */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Step 1: ผู้บันทึกข้อมูล</h2>
        <ReadField label="ชื่อผู้บันทึก" value={activity.owner} />
        <ReadField label="แผนก" value={activity.department} />
      </div>

      {/* STEP 2 */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Step 2: รายละเอียดกิจกรรม</h2>
        <ReadField label="ชื่อกิจกรรม" value={activity.activityName} />
        <ReadField label="วัตถุประสงค์" value={activity.purpose} />
        <ReadField label="ฐานกฎหมาย" value={activity.legalBasis} />
        <ReadField label="สถานะ" value={activity.status} />
      </div>

      {/* STEP 3 */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Step 3: มาตรการความปลอดภัย</h2>
        <ReadField
          label="มาตรการ"
          value={
            activity.securityMeasures
              ? Object.entries(activity.securityMeasures)
                .filter(([_, v]) => v)
                .map(([k]) => k)
                .join(", ")
              : "-"
          }
        />
      </div>

      {/* FOOTER */}
      <div className="flex justify-between pt-6 border-t">

        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-lg"
        >
          กลับ
        </button>

        <div className="flex gap-3">

          {canEdit && (
            <>
              <button
                onClick={() => router.push(`/ropa/edit/${activity.id}`)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
              >
                แก้ไข
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                ลบ
              </button>
            </>
          )}

          {canCreateDP && (
            <button
              onClick={() => router.push(`/dc/create-dp/${activity.id}`)}
              className="px-4 py-2 bg-[#203690] text-white rounded-lg"
            >
              + Create DP Form
            </button>
          )}

        </div>
      </div>
    </div>
  );
}