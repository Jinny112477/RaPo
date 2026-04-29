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
      <RopaDCForm
        initialData={activity}
        readOnly={false}   // 👈 แก้ได้
        onSubmit={handleSubmit}
      />
    </div>
  );
}