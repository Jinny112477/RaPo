'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RopaDCForm from '@/components/RopaDCForm';
import { notifyError, notifySuccess } from '@/lib/notify';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function EditRopaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [activityName, setActivityName] = useState('');
  const [status, setStatus] = useState('');
  const [dpoComment, setDpoComment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load activity info + DPO comment
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        // Load activity basic info
        const res = await fetch(`${API_URL}/api/form/${id}`);
        const json = await res.json();
        if (res.ok && json.data) {
          setActivityName(json.data.activity_name || '');
          setStatus(json.data.approval_status || '');
        }

        // Load DPO comment
        const dpoRes = await fetch(`${API_URL}/api/dpo/ropa/${id}`);
        const dpoJson = await dpoRes.json();
        if (dpoRes.ok && dpoJson.data?.dpo_review?.comment) {
          setDpoComment(dpoJson.data.dpo_review.comment);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = () => {
    notifySuccess('ส่งแบบฟอร์มเรียบร้อยแล้ว รอ DPO ตรวจสอบ');
    router.push('/dc/my-ropa');
  };

  const handleSaveDraft = () => {
    notifySuccess('บันทึกแบบร่างเรียบร้อยแล้ว');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-slate-500 text-sm">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-5xl mx-auto px-4 space-y-4">

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 flex items-start justify-between gap-4 shadow-sm">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{id}</p>
            <h1 className="text-xl font-bold text-slate-800">{activityName || 'แก้ไขแบบฟอร์ม'}</h1>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {status === 'rejected' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                ถูกปฏิเสธ — แก้ไขและส่งใหม่
              </span>
            )}
            <span className="text-[11px] text-slate-400">Data Controller Form</span>
          </div>
        </div>

        {/* DPO Comment */}
        {dpoComment && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-600 mb-1">ความคิดเห็นจาก DPO</p>
            <p className="text-sm text-red-700 whitespace-pre-wrap">{dpoComment}</p>
          </div>
        )}

        {/* Form (loads data internally via editActivityId) */}
        <RopaDCForm
          editActivityId={id}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
        />
      </div>
    </div>
  );
}
