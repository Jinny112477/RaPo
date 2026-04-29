//แก้ไขข้อมูล ROPA แต่ละ record
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRopa } from '@/lib/ropaContext';
import RopaDCForm from '@/components/RopaDCForm';
// import RopaDCEditForm from '@/components/RopaDCEditForm';
// import RopaDPEditForm from '@/components/RopaDPEditForm';

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
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER เหมือนหน้า /ropa/[id] */}
      <div className="bg-white border border-black rounded-xl p-5 mb-4 max-w-2xl mx-auto">
        <p className="text-xs text-gray-400">{activity.id}</p>
        <h1 className="text-xl font-bold">{activity.activityName}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {activity.department}
        </p>
      </div>

      {/* FORM */}
      <div className="max-w-2xl mx-auto">
        <RopaDCForm
          key={activity.id}                //   สำคัญ กัน state ค้าง
          initialData={activity}          //   ใช้ข้อมูลเดิม
          readOnly={false}                //   แก้ได้
        />
      </div>

      {/* ปุ่ม */}
      <div className="flex justify-end mt-6 max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded"
        >
          กลับ
        </button>
      </div>
    </div>
  );

  // if (activity.formType === 'processor') {
  //   return <RopaDPEditForm activity={activity} />;
  // }
  // return <RopaDCEditForm activity={activity} />;
}
