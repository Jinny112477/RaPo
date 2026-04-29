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

    <div className="p-6">
      {activity.status === 'REJECTED' && (
        <span className="inline-block mb-3 text-xs font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
          Rejected Form (แก้ไขและส่งใหม่)
        </span>
      )}
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
  );
}