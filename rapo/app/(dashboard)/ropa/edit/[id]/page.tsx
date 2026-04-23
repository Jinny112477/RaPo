'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRopa } from '@/lib/ropaContext';
import RopaDCEditForm from '@/components/RopaDCEditForm';
import RopaDPEditForm from '@/components/RopaDPEditForm';

export default function RopaEditPage() {
  const params = useParams();
  const router = useRouter();
  const { activities } = useRopa();
  const activity = activities.find(a => a.id === params.id);

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">ไม่พบข้อมูลกิจกรรม</p>
          <button onClick={() => router.back()} className="mt-3 text-xs text-[#203690] hover:underline">← กลับ</button>
        </div>
      </div>
    );
  }

  if (activity.formType === 'processor') {
    return <RopaDPEditForm activity={activity} />;
  }
  return <RopaDCEditForm activity={activity} />;
}
