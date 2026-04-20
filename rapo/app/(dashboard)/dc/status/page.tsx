'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { mockActivities } from '@/lib/mockData';

export default function RopaStatusPage() {
  const { user } = useAuth();
  const router = useRouter();

  const myActivities = mockActivities.filter(a => a.owner === user?.name);

  const pending  = myActivities.filter(a => a.status === 'REVIEW');
  const approved = myActivities.filter(a => a.status === 'ACTIVE');
  const rejected = myActivities.filter(a => a.status === 'REJECTED');

  const Section = ({ title, color, bg, border, items, emptyText, showEdit }: {
    title: string; color: string; bg: string; border: string;
    items: typeof myActivities; emptyText: string; showEdit?: boolean;
  }) => (
    <div className={`rounded-xl border ${border} overflow-hidden`}>
      <div className={`${bg} px-5 py-3 flex items-center justify-between`}>
        <p className={`text-sm font-semibold ${color}`}>{title}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white ${color}`}>
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-gray-400 bg-white">{emptyText}</div>
      ) : (
        <div className="divide-y bg-white">
          {items.map(a => (
            <div key={a.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition">
              <div>
                <p className="text-sm font-medium text-gray-800">{a.activityName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.department} · อัปเดต {a.updatedAt}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => router.push(`/ropa/${a.id}`)}
                  className="text-xs text-blue-600 hover:underline">ดูรายละเอียด</button>
                {showEdit && (
                  <button onClick={() => router.push(`/ropa/create?edit=${a.id}`)}
                    className="text-xs text-white bg-[#203690] px-2 py-1 rounded hover:bg-[#182a73] transition">
                    แก้ไขและส่งใหม่
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-5">

      <div className="bg-white border border-black px-5 py-4 rounded-md">
        <p className="text-xs font-semibold text-gray-700 mb-1">สถานะ ROPA</p>
        <p className="text-[11px] text-gray-500">ติดตามสถานะ ROPA ที่ส่งให้ DPO — {user?.name}</p>
      </div>

      {/* รอ DPO ตรวจ */}
      <Section
        title="⏳ รอ DPO ตรวจสอบ"
        color="text-yellow-700"
        bg="bg-yellow-50"
        border="border-yellow-200"
        items={pending}
        emptyText="ไม่มี ROPA ที่รอตรวจสอบ"
      />

      {/* DPO อนุมัติแล้ว */}
      <Section
        title="✅ DPO อนุมัติแล้ว"
        color="text-green-700"
        bg="bg-green-50"
        border="border-green-200"
        items={approved}
        emptyText="ยังไม่มี ROPA ที่ได้รับการอนุมัติ"
      />

      {/* DPO ปฏิเสธ */}
      <Section
        title="❌ DPO ปฏิเสธ — ต้องแก้ไขและส่งใหม่"
        color="text-red-700"
        bg="bg-red-50"
        border="border-red-200"
        items={rejected}
        emptyText="ไม่มี ROPA ที่ถูกปฏิเสธ"
        showEdit
      />

    </div>
  );
}