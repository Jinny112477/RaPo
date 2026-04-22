'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// ลบ mockActivities ออก และ import useRopa มาแทน
import { useRopa } from '@/lib/ropaContext';

const LEGAL_BASIS_OPTIONS = [
  'ความยินยอม (Consent)',
  'การปฏิบัติตามสัญญา (Contract)',
  'ประโยชน์โดยชอบด้วยกฎหมาย (Legitimate Interest)',
  'การปฏิบัติตามกฎหมาย (Legal Obligation)',
  'ประโยชน์สาธารณะ (Public Task)',
  'ประโยชน์สำคัญต่อชีวิต (Vital Interest)',
];

const DATA_SUBJECT_OPTIONS = [
  'พนักงาน / ลูกจ้าง', 'ผู้สมัครงาน',
  'ลูกค้า / ผู้ใช้บริการ', 'คู่ค้า / ผู้จัดจำหน่าย', 'อื่นๆ',
];

const PERSONAL_DATA_OPTIONS = [
  'ข้อมูลระบุตัวตน (ชื่อ, อีเมล, เบอร์โทร)',
  'ข้อมูลทางการเงิน',
  'ข้อมูลสุขภาพ',
  'ข้อมูลชีวภาพ',
  'ข้อมูลพฤติกรรม / การใช้งาน',
  'ข้อมูลอ่อนไหวอื่นๆ',
];

const PROCESSING_OPTIONS = [
  'การเก็บรวบรวม', 'การจัดเก็บ',
  'การใช้', 'การเปิดเผย', 'การลบ',
];

const RETENTION_PERIODS = ['1 ปี', '3 ปี', '5 ปี', '7 ปี', '10 ปี'];

const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#203690] bg-white';
const txa = `${inp} resize-none`;

function CheckItem({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange}
        className="w-4 h-4 accent-[#203690]" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default function RopaEditPage() {
  const params = useParams();
  const router = useRouter();
  
  // เรียกใช้ activities และ updateActivity จาก Context
  const { activities, updateActivity } = useRopa();
  
  // ค้นหาข้อมูล original จาก Context แทน
  const original = activities.find(a => a.id === params.id);

  const [form, setForm] = useState({
    activityName: original?.activityName ?? '',
    department: original?.department ?? '',
    purpose: original?.purpose ?? '',
    legalBasis: original?.legalBasis ?? '',
    dataSubject: original?.dataSubject ?? [],
    personalData: original?.personalData ?? [],
    processing: original?.processing ?? [],
    retentionPeriod: original?.retentionPeriod ?? '',
    riskLevel: original?.riskLevel ?? 'LOW',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!original) return (
    <div className="p-6 text-center text-gray-500">ไม่พบข้อมูล</div>
  );

  const isRejected = original.status === 'REJECTED';

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const toggleArr = (key: 'dataSubject' | 'personalData' | 'processing', val: string) => {
    const arr = form[key];
    set(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl border p-12 text-center max-w-sm">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-2">ส่งให้ DPO ตรวจสอบแล้ว</h3>
          <p className="text-sm text-gray-500 mb-6">กิจกรรมถูกส่งเพื่อรอการอนุมัติ</p>
          <button onClick={() => router.push('/dc/my-ropa')}
            className="px-5 py-2 bg-[#203690] text-white text-sm font-semibold rounded-lg hover:bg-[#182a73] transition">
            กลับหน้า My ROPA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()}
          className="text-xs text-gray-500 hover:text-gray-700">← กลับ</button>
        <span className="text-gray-300">/</span>
        <p className="text-xs text-gray-500">
          {isRejected ? 'แก้ไขและส่งใหม่' : 'แก้ไขร่าง'}
        </p>
      </div>

      <div className="max-w-3xl space-y-4">

        {/* Rejection reason banner */}
        {isRejected && original.rejectionReason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs font-semibold text-red-700 mb-1">❌ เหตุผลที่ DPO ปฏิเสธ</p>
            <p className="text-sm text-red-600">{original.rejectionReason}</p>
            <p className="text-xs text-red-400 mt-2">กรุณาแก้ไขตามเหตุผลข้างต้น แล้วกดส่งให้ DPO ตรวจสอบอีกครั้ง</p>
          </div>
        )}

        {/* Section 1 */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-800 text-white px-5 py-3">
            <p className="text-sm font-semibold">1. ข้อมูลทั่วไป</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ชื่อกิจกรรม <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.activityName}
                  onChange={e => set('activityName', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">แผนก</label>
                <input type="text" value={form.department}
                  onChange={e => set('department', e.target.value)} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                วัตถุประสงค์ <span className="text-red-500">*</span>
              </label>
              <textarea rows={3} value={form.purpose}
                onChange={e => set('purpose', e.target.value)} className={txa} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ฐานกฎหมาย</label>
                <select value={form.legalBasis}
                  onChange={e => set('legalBasis', e.target.value)} className={inp}>
                  <option value="">เลือกฐานกฎหมาย...</option>
                  {LEGAL_BASIS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ระยะเวลาเก็บรักษา</label>
                <select value={form.retentionPeriod}
                  onChange={e => set('retentionPeriod', e.target.value)} className={inp}>
                  <option value="">เลือก...</option>
                  {RETENTION_PERIODS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Data Subject */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-800 text-white px-5 py-3">
            <p className="text-sm font-semibold">2. กลุ่มเจ้าของข้อมูล</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DATA_SUBJECT_OPTIONS.map(o => (
                <CheckItem key={o} label={o}
                  checked={form.dataSubject.includes(o)}
                  onChange={() => toggleArr('dataSubject', o)} />
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Personal Data */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-800 text-white px-5 py-3">
            <p className="text-sm font-semibold">3. ประเภทข้อมูลส่วนบุคคล</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PERSONAL_DATA_OPTIONS.map(o => (
                <CheckItem key={o} label={o}
                  checked={form.personalData.includes(o)}
                  onChange={() => toggleArr('personalData', o)} />
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Processing */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-800 text-white px-5 py-3">
            <p className="text-sm font-semibold">4. การประมวลผล</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROCESSING_OPTIONS.map(o => (
                <CheckItem key={o} label={o}
                  checked={form.processing.includes(o)}
                  onChange={() => toggleArr('processing', o)} />
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Risk */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-800 text-white px-5 py-3">
            <p className="text-sm font-semibold">5. ระดับความเสี่ยง</p>
          </div>
          <div className="p-5">
            <div className="flex gap-3">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(level => (
                <button key={level} type="button"
                  onClick={() => set('riskLevel', level as typeof form.riskLevel)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all
                    ${form.riskLevel === level
                      ? level === 'LOW' ? 'border-green-500 bg-green-50 text-green-700'
                      : level === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : level === 'HIGH' ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pb-6">
          <button onClick={() => router.back()}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            ยกเลิก
          </button>
          <div className="flex gap-2">
            {/* บันทึกร่าง เฉพาะ DRAFT (อัปเดตสถานะเป็น DRAFT ผ่าน Context) */}
            {!isRejected && (
              <button
                onClick={() => {
                  updateActivity(original.id, { ...form, status: 'DRAFT' });
                  router.push('/dc/my-ropa');
                }}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                บันทึกร่าง
              </button>
            )}
            
            {/* ส่งให้ DPO (อัปเดตสถานะเป็น REVIEW ผ่าน Context) */}
            <button
              onClick={() => {
                updateActivity(original.id, {
                  ...form,
                  status: 'REVIEW',
                  updatedAt: new Date().toISOString().split('T')[0],
                });
                setSubmitted(true);
              }}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition
                ${isRejected
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#203690] hover:bg-[#182a73]'}`}>
              {isRejected ? 'ส่งให้ DPO ตรวจสอบอีกครั้ง' : 'ส่งให้ DPO ตรวจสอบ'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}