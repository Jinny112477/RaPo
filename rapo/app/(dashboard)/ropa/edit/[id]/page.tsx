'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRopa } from '@/lib/ropaContext';
import RopaDCForm from '@/components/RopaDCForm';

export default function EditRopaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { activities, updateActivity } = useRopa();

  // 🔥 สำคัญ: id เป็น string
  const activity = activities.find(a => String(a.id) === String(id));

  if (!activity) {
    return <div className="p-6">ไม่พบข้อมูล</div>;
  }

  const handleSubmit = (data: any) => {
    updateActivity(id as string, data);

    // กลับไปหน้า view
    router.push(`/ropa/${id}`);
  };

  return (

    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        {activity.status === 'REJECTED' && (
          <span className="inline-block mb-3 text-xs font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
            Rejected Form (แก้ไขและส่งใหม่)
          </span>
        )}

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-4
  flex items-start justify-between gap-4 shadow-sm">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{activity.id}</p>
            <h1 className="text-xl font-bold text-slate-800">
              {activity.activityName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activity.department}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
    ${activity.status === 'REJECTED'
                  ? 'bg-red-100 text-red-700'
                  : activity.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
            >
              {activity.status}
            </span>
            <span className="text-[11px] text-slate-400">
              Data Controller Form
            </span>
          </div>
        </div>



        {activity.status === 'REJECTED' && activity.rejectionReason && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-600 mb-1">
              เหตุผลที่ DPO ปฏิเสธ
            </p>
            <p className="text-sm text-red-700">
              {activity.rejectionReason}
            </p>
          </div>
        )}
        <RopaDCForm
          initialData={activity}
          readOnly={false}   //แก้ได้
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}