//หน้ารายละเอียด activity 
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRopa } from '@/lib/ropaContext';
import { useSearchParams } from 'next/navigation';


export default function RopaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getActivityById } = useRopa();

  const activity = getActivityById(String(id));

  if (!activity) {
    return <div>ไม่พบข้อมูล</div>;
  }
  //ทดสอบ
  console.log(activity);

  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isFullAccess = mode === 'full';

  // const formData = mapToFormData(activity);

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-2xl mx-auto px-4">

        {/*   HEADER ที่คุณต้องการ */}
        <div className="bg-white border border-black rounded-xl p-5 mb-4">
          <p className="text-xs text-gray-400">{activity.id}</p>
          <h1 className="text-xl font-bold">{activity.activityName}</h1>
          <p className="text-sm text-gray-500 mt-1">{activity.department}</p>
        </div>

        {/*  FORM (READ ONLY) */}
        <div className="space-y-4">

          {/* 1. ผู้ลงบันทึก */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="font-bold mb-2">1. ผู้ลงบันทึก</h2>

            <p><b>ชื่อ:</b> {activity.owner || '-'}</p>
            <p><b>วันที่บันทึก:</b> {activity.createdAt || '-'}</p>
          </div>

          {/* 2. กิจกรรม */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="font-bold mb-2">2. กิจกรรมการประมวลผล</h2>

            <p><b>Activity:</b> {activity.activityName}</p>
            <p><b>Department:</b> {activity.department}</p>
            <p><b>Purpose:</b> {activity.purpose}</p>
            <p><b>Legal Basis:</b> {activity.legalBasis}</p>

            <p><b>Data Subject:</b> {activity.dataSubject?.join(', ')}</p>

            <p><b>Personal Data:</b> {activity.personalData?.join(', ')}</p>

            <p><b>Processing:</b> {activity.processing?.join(', ')}</p>
          </div>

          {/* 3. มาตรการ */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="font-bold mb-2">3. มาตรการรักษาความปลอดภัย</h2>

            <p><b>Risk Level:</b> {activity.riskLevel}</p>

            {/* ถ้ามี securityMeasures ในอนาคต */}
            {activity.securityMeasures && (
              <>
                <p><b>Organizational:</b> {activity.securityMeasures.organizational}</p>
                <p><b>Technical:</b> {activity.securityMeasures.technical}</p>
                <p><b>Physical:</b> {activity.securityMeasures.physical}</p>
              </>
            )}
          </div>

          {/* 4. สรุป */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="font-bold mb-2">4. สรุป</h2>

            <p><b>Retention:</b> {activity.retentionPeriod}</p>
            <p><b>Status:</b> {activity.status}</p>
            <p><b>Last Updated:</b> {activity.updatedAt}</p>
          </div>

        </div>

        {isFullAccess && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
            <p className="text-sm font-bold mb-2">Full DC Data</p>

            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(activity, null, 2)}
            </pre>
          </div>
        )}

        {/* ACTION */}
        <div className="flex justify-end mt-6 gap-2">

          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded text-sm"
          >
            Back
          </button>

          {/* Create DP Form */}
          {activity.status === 'ACTIVE' && (
            <button
              onClick={() => router.push(`/dc/create-dp/${activity.id}`)}
              className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
            >
              Create DP Form
            </button>
          )}

        </div>
      </div>
    </div>
  );
}