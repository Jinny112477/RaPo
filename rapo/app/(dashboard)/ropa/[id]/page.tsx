'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRopa } from '@/lib/ropaContext';
import RopaDCForm from '@/components/RopaDCForm';


export default function RopaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getActivityById } = useRopa();

  const activity = getActivityById(String(id));

  // console.log("ID from URL:", id);
  // console.log("ALL activities:", activities);
  // console.log("FOUND:", activity);

  if (!activity) {
    return <div>ไม่พบข้อมูล</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-2xl mx-auto px-4">

        {/*   HEADER ที่คุณต้องการ */}
        <div className="bg-white border border-black rounded-xl p-5 mb-4">
          <p className="text-xs text-gray-400">{activity.id}</p>
          <h1 className="text-xl font-bold">{activity.activityName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activity.department}
          </p>
        </div>

        {/*   FORM (READ ONLY) */}
        <RopaDCForm
          initialData={activity}
          readOnly={true}
        />

        {/* ACTION */}
        <div className="flex justify-end mt-6 gap-2">

          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded text-sm"
          >
            Back
          </button>

          {/* 🔥 NEW: Create DP Form */}
          {activity.status === 'ACTIVE' && (
            <button
              onClick={() => router.push(`/dc/create-dp/${activity.id}`)}
              className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
            >
              Create DP Form
            </button>
          )}

        </div>

        {/* ACTION */}
        {/* <div className="flex justify-end mt-6">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            back to My activity
          </button>
        </div> */}
      </div>
    </div>
  );
}