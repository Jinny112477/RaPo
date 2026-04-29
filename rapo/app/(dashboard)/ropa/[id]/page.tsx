'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRopa } from '@/lib/ropaContext';

const STEPS = [
  { id: 1, label: 'ผู้บันทึก' },
  { id: 2, label: 'กิจกรรม' },
  { id: 3, label: 'ความปลอดภัย' },
  { id: 4, label: 'สรุป' },
];

// Field แสดงผลแบบ read-only ให้หน้าตาเหมือน input
function ReadField({ label, value }: { label: string; value?: string | string[] }) {
  const display = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <div className="min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200
        rounded-lg text-sm text-slate-800 whitespace-pre-wrap">
        {display || <span className="text-slate-400">-</span>}
      </div>
    </div>
  );
}

// Badge สถานะ
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    REVIEW: 'bg-yellow-100 text-yellow-700',
    DRAFT: 'bg-gray-100 text-gray-500',
    REJECTED: 'bg-red-100 text-red-700',
    ARCHIVED: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

export default function RopaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getActivityById } = useRopa();
  const activity = getActivityById(String(id));

  // step state ไว้ navigate ระหว่าง section
  const [step, setStep] = useState(1);
  const TOTAL = STEPS.length;

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">ไม่พบข้อมูล Activity</p>
      </div>
    );
  }

  const sub = activity.subActivities?.[0];
  const sec = activity.securityMeasures;

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-2xl mx-auto px-4 space-y-5">

        {/* ── Header card ── */}
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-4
          flex items-start justify-between gap-4 shadow-sm">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{activity.id}</p>
            <h1 className="text-xl font-bold text-slate-800">{activity.activityName}</h1>
            <p className="text-sm text-slate-500 mt-1">{activity.department}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={activity.status} />
            <span className="text-[11px] text-slate-400">Data Controller Form</span>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-px bg-slate-200 z-0" />
            <div
              className="absolute left-0 top-4 h-px bg-blue-500 z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / (TOTAL - 1)) * 100}%` }}
            />
            {STEPS.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-2 z-10">
                <button
                  onClick={() => setStep(s.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center
                    text-xs font-bold border-2 transition-all duration-200
                    ${s.id < step ? 'bg-blue-600 border-blue-600 text-white cursor-pointer'
                      : s.id === step ? 'bg-white border-blue-600 text-blue-600 shadow-md'
                        : 'bg-white border-slate-300 text-slate-400 cursor-pointer'}`}
                >
                  {s.id < step
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    : s.id}
                </button>
                <span className={`text-[11px] font-medium ${s.id === step ? 'text-blue-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {STEPS[step - 1].label}
              </h2>
              <p className="text-xs text-slate-500">ส่วนที่ {step} / {TOTAL} · อ่านได้อย่างเดียว</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs rounded-full font-medium">
              View Only
            </span>
          </div>
        </div>

        {/* ── STEP 1: ผู้บันทึก ── */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs
                flex items-center justify-center font-bold">1</span>
              <h3 className="font-semibold text-slate-700">รายละเอียดของผู้ลงบันทึก ROPA</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ReadField label="ชื่อ-นามสกุล / ชื่อองค์กร *" value={activity.recorder?.name ?? activity.owner} />
              <ReadField label="เบอร์โทรศัพท์ *" value={activity.recorder?.phone} />
            </div>
            <ReadField label="ที่อยู่ *" value={activity.recorder?.address} />
            <ReadField label="อีเมล *" value={activity.recorder?.email} />
            {activity.dataOwnerName && (
              <ReadField label="Data Controller Name" value={activity.dataOwnerName} />
            )}
            {activity.controllerAddress && (
              <ReadField label="ที่อยู่ Controller" value={activity.controllerAddress} />
            )}
          </div>
        )}

        {/* ── STEP 2: กิจกรรม ── */}
        {step === 2 && (
          <div className="space-y-4">

            {/* Header card */}
            <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center
          text-sm font-bold text-blue-600">2</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    ส่วนที่ 2: ตารางข้อมูลกิจกรรมการประมวลผล
                  </p>
                  <p className="text-xs text-slate-400">ระบุกิจกรรมหลักและวัตถุประสงค์ย่อยทั้งหมด</p>
                </div>
              </div>

              <ReadField label="ชื่อเจ้าของข้อมูลส่วนบุคคล" value={activity.dataOwnerName} />
              <ReadField label="กิจกรรมการประมวลผลหลัก" value={activity.activityName} />
            </div>

            {/* Sub-activity card */}
            {(activity.subActivities?.length ? activity.subActivities : [null]).map((sub, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                {/* Sub header */}
                <div className="bg-slate-800 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white text-slate-800 text-xs
              font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm font-semibold text-white">วัตถุประสงค์ที่ {i + 1}</span>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-4">

                  <ReadField label="วัตถุประสงค์ของการประมวลผล" value={sub?.purpose ?? activity.purpose} />
                  <ReadField label="ข้อมูลส่วนบุคคลที่จัดเก็บ" value={sub?.personalDataItems ?? activity.personalData} />

                  <div className="grid grid-cols-2 gap-4">
                    <ReadField label="หมวดหมู่ของข้อมูล" value={sub?.dataCategory} />
                    <ReadField label="ประเภทของข้อมูล" value={sub?.dataType} />
                  </div>

                  <ReadField label="วิธีการได้มาซึ่งข้อมูล" value={sub?.collectionMethod} />

                  {/* แหล่งที่มา */}
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">แหล่งที่ได้มาซึ่งข้อมูล</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['จากเจ้าของข้อมูลโดยตรง', 'จากแหล่งอื่น'].map(v => {
                        const active = v === 'จากเจ้าของข้อมูลโดยตรง'
                          ? sub?.sourceFromOwner === 'จากเจ้าของข้อมูลโดยตรง'
                          : sub?.sourceFromOther === 'จากแหล่งอื่น';
                        return (
                          <div key={v} className={`px-4 py-2.5 rounded-lg border text-sm text-center
                    ${active
                              ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                              : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                            {v}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <ReadField label="ฐานในการประมวลผล" value={sub?.legalBasis ?? [activity.legalBasis]} />

                  {/* ความยินยอมผู้เยาว์ */}
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">การขอความยินยอมของผู้เยาว์</p>
                    <div className="grid grid-cols-2 gap-4">
                      <ReadField label="อายุไม่เกิน 10 ปี" value={sub?.minorConsentUnder10} />
                      <ReadField label="อายุ 10–20 ปี" value={sub?.minorConsentAge10to20} />
                    </div>
                  </div>

                  {/* การโอนต่างประเทศ */}
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      การส่งหรือโอนข้อมูลไปยังต่างประเทศ
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {['มี', 'ไม่มี'].map(v => (
                        <div key={v} className={`px-4 py-2.5 rounded-lg border text-sm text-center
                  ${sub?.transferAbroad === v
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                          {v}
                        </div>
                      ))}
                    </div>
                    {sub?.transferAbroad === 'มี' && (
                      <div className="space-y-3 pl-2 border-l-2 border-blue-200">
                        <ReadField label="ประเทศปลายทาง" value={sub?.transferCountry} />
                        <ReadField label="วิธีการโอนข้อมูล" value={sub?.transferMethod} />
                        <ReadField label="ชื่อบริษัทในเครือ" value={sub?.transferAffiliateCompany} />
                        <ReadField label="มาตรฐานการคุ้มครองข้อมูลของประเทศปลายทาง" value={sub?.transferStandard} />
                        <ReadField label="ข้อยกเว้นตามมาตรา 28" value={sub?.transferException28} />
                      </div>
                    )}
                  </div>

                  <ReadField label="วิธีการเก็บรักษาข้อมูล" value={sub?.storageMethod} />
                  <ReadField label="ระยะเวลาการเก็บรักษาข้อมูล" value={sub?.retentionPeriod ?? activity.retentionPeriod} />
                  <ReadField label="สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล" value={sub?.accessRights} />
                  <ReadField label="วิธีการลบหรือทำลายข้อมูลเมื่อสิ้นสุดระยะเวลา" value={sub?.deletionMethod} />
                  <ReadField label="การใช้หรือเปิดเผยข้อมูลที่ได้รับยกเว้นไม่ต้องขอความยินยอม" value={sub?.exemptDisclosure} />
                  <ReadField label="การปฏิเสธคำขอหรือคำคัดค้านการใช้สิทธิของเจ้าของข้อมูล" value={sub?.rightsDenial} />

                </div>
              </div>
            ))}
          </div>
        )}
        {/* ── STEP 3: ความปลอดภัย ── */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center
        text-sm font-bold text-blue-600">3</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  ส่วนที่ 3: มาตรการรักษาความมั่นคงปลอดภัย
                </p>
              </div>
            </div>

            <ReadField label="มาตรการเชิงองค์กร (Organizational)" value={sec?.organizational} />
            <ReadField label="มาตรการเชิงเทคนิค (Technical)" value={sec?.technical} />
            <ReadField label="มาตรการทางกายภาพ (Physical)" value={sec?.physical} />
            <ReadField label="การควบคุมการเข้าถึงข้อมูล (Access Control)" value={sec?.accessControl} />
            <ReadField label="การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน" value={sec?.userResponsibility} />
            <ReadField label="มาตรการตรวจสอบย้อนหลัง (Audit Trail)" value={sec?.auditTrail} />
          </div>
        )}

        {/* ── STEP 4: สรุป ── */}
        {step === 4 && (
          <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs
                flex items-center justify-center font-bold">4</span>
              <h3 className="font-semibold text-slate-700">สรุปข้อมูล</h3>
            </div>
            <ReadField label="สถานะ" value={activity.status} />
            <ReadField label="ระยะเวลาเก็บรักษา" value={activity.retentionPeriod} />
            <ReadField label="วันที่สร้าง" value={activity.createdAt} />
            <ReadField label="อัปเดตล่าสุด" value={activity.updatedAt} />
            {activity.reviewedBy && (
              <ReadField label="ตรวจสอบโดย" value={activity.reviewedBy} />
            )}
            {activity.rejectionReason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-semibold text-red-600 mb-1">เหตุผลที่ปฏิเสธ</p>
                <p className="text-sm text-red-700">{activity.rejectionReason}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Footer: prev / next / actions ── */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm
          flex items-center justify-between gap-3">

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200
              rounded-lg hover:bg-slate-50 transition-colors"
          >
            ← กลับ
          </button>

          <div className="flex items-center gap-2">

            {/* Create DP Form */}
            {/* {activity.status === 'ACTIVE' && (
              <button
                onClick={() => router.push(`/dc/create-dp/${activity.id}`)}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600
                  rounded-lg hover:bg-emerald-700 transition-colors"
              >
                + Create DP Form
              </button>
            )} */}

            {/* Prev */}
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200
                  rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← ย้อนกลับ
              </button>
            )}

            {/* Next */}
            {step < TOTAL && (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600
                  rounded-lg hover:bg-blue-700 transition-colors"
              >
                ถัดไป →
              </button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}