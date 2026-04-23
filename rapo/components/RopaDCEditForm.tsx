'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock8 } from 'lucide-react';
import { SearchAlert } from 'lucide-react';
import { useRopa } from '@/lib/ropaContext';

// ─── Types ─────────────────────────────────────────────────────────────────────

type FormType = 'controller' | 'processor' | null;

interface RecorderInfo {
  name: string; address: string; email: string; phone: string;
}

interface SubActivity {
  id: string;
  purpose: string;
  personalDataItems: string[];
  dataCategory: string[];
  dataType: string[];
  collectionMethod: string[];
  sourceFromOwner: string;
  sourceFromOther: string;
  legalBasis: string[];
  minorConsentUnder10: string;
  minorConsentAge10to20: string;
  transferAbroad: string;
  transferCountry: string;
  transferAffiliate: string;
  transferAffiliateCompany: string;
  transferMethod: string;
  transferStandard: string;
  transferException28: string;
  storageType: string[];
  storageMethod: string;
  retentionPeriod: string;
  accessRights: string;
  deletionMethod: string;
  exemptDisclosure: string;
  rightsDenial: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const DATA_CATEGORIES = ['ข้อมูลลูกค้า', 'ข้อมูลคู่ค้า', 'ข้อมูลผู้ติดต่อ', 'ข้อมูลพนักงาน'];
const DATA_TYPES = ['ข้อมูลทั่วไป', 'ข้อมูลอ่อนไหว'];
const COLLECTION_METHODS = ['Soft File (ไฟล์อิเล็กทรอนิกส์)', 'Hard Copy (เอกสารกระดาษ)'];
const LEGAL_BASES_TH = [
  'ฐานความยินยอม (Consent)',
  'ฐานสัญญา (Contract)',
  'ฐานหน้าที่ตามกฎหมาย (Legal Obligation)',
  'ฐานประโยชน์สำคัญต่อชีวิต (Vital Interest)',
  'ฐานภารกิจสาธารณะ (Public Task)',
  'ฐานประโยชน์โดยชอบด้วยกฎหมาย (Legitimate Interest)',
];
const PERSONAL_DATA_EXAMPLES = [
  'ชื่อ-นามสกุล', 'ที่อยู่', 'เบอร์โทรศัพท์', 'อีเมล', 'เลขบัตรประชาชน',
  'วันเดือนปีเกิด', 'ภาพถ่าย', 'ภาพเคลื่อนไหว/วิดีโอ', 'คลิปสัมภาษณ์',
  'ข้อมูลทางการเงิน', 'ข้อมูลสุขภาพ', 'ข้อมูลชีวภาพ', 'IP Address', 'Cookie',
];
const STORAGE_TYPES = ['Soft File (ไฟล์อิเล็กทรอนิกส์)', 'Hard Copy (เอกสารกระดาษ)'];
const TRANSFER_EXCEPTIONS = [
  'ปฏิบัติตามกฎหมาย', 'ความยินยอม', 'ปฏิบัติตามสัญญา',
  'ประโยชน์สาธารณะ', 'ประโยชน์สำคัญต่อชีวิต', 'ข้อยกเว้นอื่นๆ',
];

const STEPS = [
  { id: 1, label: 'ผู้ลงบันทึก', short: 'ผู้บันทึก' },
  { id: 2, label: 'กิจกรรมการประมวลผล', short: 'กิจกรรม' },
  { id: 3, label: 'มาตรการรักษาความปลอดภัย', short: 'ความปลอดภัย' },
  { id: 4, label: 'สรุปและส่ง', short: 'สรุป' },
];

// ─── Small helper components ───────────────────────────────────────────────────

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inp = 'w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200';
const txa = `${inp} resize-none`;
const sel = `${inp} cursor-pointer`;

function MultiCheck({ options, selected, onChange, cols = 2 }: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void; cols?: 2 | 3;
}) {
  const toggle = (o: string) =>
    onChange(selected.includes(o) ? selected.filter(s => s !== o) : [...selected, o]);
  return (
    <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {options.map(o => {
        const on = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm text-left transition-all ${on ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
            <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${on ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
              {on && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
            </span>
            <span className="leading-snug">{o}</span>
          </button>
        );
      })}
    </div>
  );
}

function YesNo({ value, onChange, options = ['มี', 'ไม่มี'] }: {
  value: string; onChange: (v: string) => void; options?: string[];
}) {
  return (
    <div className="flex gap-2">
      {options.map(v => (
        <button key={v} type="button" onClick={() => onChange(v)}
          className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${value === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}>
          {v}
        </button>
      ))}
    </div>
  );
}

function newSub(i: number): SubActivity {
  return {
    id: `s${Date.now()}${i}`,
    purpose: '', personalDataItems: [], dataCategory: [], dataType: [],
    collectionMethod: [], sourceFromOwner: '', sourceFromOther: '',
    legalBasis: [], minorConsentUnder10: '', minorConsentAge10to20: '',
    transferAbroad: 'ไม่มี', transferCountry: '', transferAffiliate: 'ไม่ใช่',
    transferAffiliateCompany: '', transferMethod: '', transferStandard: '',
    transferException28: '', storageType: [], storageMethod: '',
    retentionPeriod: '', accessRights: '', deletionMethod: '',
    exemptDisclosure: '', rightsDenial: '',
  };
}

// ─── Sub-activity accordion ────────────────────────────────────────────────────

function SubCard({ sub, idx, isCtrl, onChange, onRemove, canRemove }: {
  sub: SubActivity; idx: number; isCtrl: boolean;
  onChange: (s: SubActivity) => void; onRemove: () => void; canRemove: boolean;
}) {
  const [open, setOpen] = useState(true);
  const set = <K extends keyof SubActivity>(k: K, v: SubActivity[K]) => onChange({ ...sub, [k]: v });

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between px-5 py-3.5 cursor-pointer select-none transition-colors ${open ? 'bg-[#1a3a6b]' : 'bg-slate-50 hover:bg-slate-100'}`}>
        <div className="flex items-center gap-3">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${open ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'}`}>
            {idx + 1}
          </span>
          <div>
            <p className={`text-sm font-semibold ${open ? 'text-white' : 'text-slate-700'}`}>
              วัตถุประสงค์ที่ {idx + 1}
            </p>
            {sub.purpose && (
              <p className={`text-xs mt-0.5 ${open ? 'text-blue-200' : 'text-slate-400'}`}>
                {sub.purpose.length > 50 ? sub.purpose.slice(0, 50) + '…' : sub.purpose}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button type="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className={`p-1.5 rounded-lg transition-colors ${open ? 'text-white/60 hover:text-white hover:bg-white/15' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          )}
          <span className={open ? 'text-white/70' : 'text-slate-400'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {open && (
        <div className="p-5 space-y-5 bg-white">

          {/* 1. วัตถุประสงค์ */}
          <Field label="วัตถุประสงค์ของการประมวลผล" required>
            <textarea rows={2} value={sub.purpose} onChange={e => set('purpose', e.target.value)}
              className={txa} />
          </Field>

          {/* 2. ข้อมูลที่จัดเก็บ */}
          <Field label="ข้อมูลส่วนบุคคลที่จัดเก็บ" required >
            <MultiCheck options={PERSONAL_DATA_EXAMPLES} selected={sub.personalDataItems} onChange={v => set('personalDataItems', v)} cols={3} />
          </Field>

          {/* 3-4. หมวดหมู่ + ประเภท */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="หมวดหมู่ของข้อมูล" required>
              <MultiCheck options={DATA_CATEGORIES} selected={sub.dataCategory} onChange={v => set('dataCategory', v)} />
            </Field>
            <Field label="ประเภทของข้อมูล" required>
              <MultiCheck options={DATA_TYPES} selected={sub.dataType} onChange={v => set('dataType', v)} />
            </Field>
          </div>

          {/* 5. วิธีการได้มา */}
          <Field label="วิธีการได้มาซึ่งข้อมูล" required>
            <MultiCheck options={COLLECTION_METHODS} selected={sub.collectionMethod} onChange={v => set('collectionMethod', v)} />
          </Field>

          {/* 6. แหล่งที่มา */}
          <Field label="แหล่งที่ได้มาซึ่งข้อมูล" required>
            <div className="flex gap-3">
              {['จากเจ้าของข้อมูลโดยตรง', 'จากแหล่งอื่น'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('sourceFromOwner', v)}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all
                  ${sub.sourceFromOwner === v
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>

          {/* 7. ฐานการประมวลผล */}
          <Field label="ฐานในการประมวลผล" required>
            <MultiCheck options={LEGAL_BASES_TH} selected={sub.legalBasis} onChange={v => set('legalBasis', v)} />
          </Field>

          {/* 8. ผู้เยาว์ (Controller เท่านั้น) */}
          {isCtrl && (
            <div className="p-4 rounded-xl border border-amber-200 bg-50 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-800">การขอความยินยอมของผู้เยาว์</span>
                {/* <span className="text-xs text-amber-500">(เฉพาะ Data Controller)</span> */}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="อายุไม่เกิน 10 ปี" >
                  <textarea rows={2} value={sub.minorConsentUnder10}
                    onChange={e => set('minorConsentUnder10', e.target.value)}
                    className={txa} />
                </Field>
                <Field label="อายุ 10–20 ปี" >
                  <textarea rows={2} value={sub.minorConsentAge10to20}
                    onChange={e => set('minorConsentAge10to20', e.target.value)}
                    className={txa} />
                </Field>
              </div>
            </div>
          )}

          {/* 9. การโอนข้อมูลต่างประเทศ */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">การส่งหรือโอนข้อมูลไปยังต่างประเทศ</span>
            </div>
            <Field label="มีการส่งหรือโอนข้อมูลไปต่างประเทศหรือไม่">
              <YesNo value={sub.transferAbroad} onChange={v => set('transferAbroad', v)} />
            </Field>

            {sub.transferAbroad === 'มี' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="ประเทศปลายทาง" required>
                    <input type="text" value={sub.transferCountry} onChange={e => set('transferCountry', e.target.value)}
                      className={inp} />
                  </Field>
                  <Field label="วิธีการโอนข้อมูล">
                    <input type="text" value={sub.transferMethod} onChange={e => set('transferMethod', e.target.value)}
                      className={inp} />
                  </Field>
                </div>
                <Field label="เป็นการส่งข้อมูลในกลุ่มบริษัทในเครือหรือไม่">
                  <YesNo value={sub.transferAffiliate} onChange={v => set('transferAffiliate', v)} options={['ใช่', 'ไม่ใช่']} />
                </Field>
                {sub.transferAffiliate === 'ใช่' && (
                  <Field label="ชื่อบริษัทในเครือ">
                    <input type="text" value={sub.transferAffiliateCompany} onChange={e => set('transferAffiliateCompany', e.target.value)}
                      className={inp} />
                  </Field>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="มาตรฐานการคุ้มครองข้อมูลของประเทศปลายทาง">
                    <input type="text" value={sub.transferStandard} onChange={e => set('transferStandard', e.target.value)}
                      className={inp} />
                  </Field>
                  <Field label="ข้อยกเว้นตามมาตรา 28">
                    <select value={sub.transferException28} onChange={e => set('transferException28', e.target.value)} className={sel}>
                      <option value="">เลือกข้อยกเว้น...</option>
                      {TRANSFER_EXCEPTIONS.map(x => <option key={x}>{x}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* 10. นโยบายการเก็บรักษา */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">นโยบายการเก็บรักษาข้อมูลส่วนบุคคล</span>
            </div>
            <Field label="ประเภทของข้อมูลที่จัดเก็บ">
              <MultiCheck options={STORAGE_TYPES} selected={sub.storageType} onChange={v => set('storageType', v)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="วิธีการเก็บรักษาข้อมูล">
                <textarea rows={2} value={sub.storageMethod} onChange={e => set('storageMethod', e.target.value)}
                  className={txa} />
              </Field>
              <Field label="ระยะเวลาการเก็บรักษาข้อมูล" required>
                <input type="text" value={sub.retentionPeriod} onChange={e => set('retentionPeriod', e.target.value)}
                  className={inp} />
              </Field>
            </div>
            <Field label="สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล"
            >
              <textarea rows={2} value={sub.accessRights} onChange={e => set('accessRights', e.target.value)}
                className={txa} />
            </Field>
            <Field label="วิธีการลบหรือทำลายข้อมูลเมื่อสิ้นสุดระยะเวลา">
              <textarea rows={2} value={sub.deletionMethod} onChange={e => set('deletionMethod', e.target.value)}
                className={txa} />
            </Field>
          </div>

          {/* 11-12. Controller-only fields */}
          {isCtrl && (
            <div className="space-y-4">
              <div className="border-t border-dashed border-slate-200 pt-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">เฉพาะ Data Controller</span>
              </div>
              <Field label="การใช้หรือเปิดเผยข้อมูลที่ได้รับยกเว้นไม่ต้องขอความยินยอม"
              >
                <textarea rows={2} value={sub.exemptDisclosure} onChange={e => set('exemptDisclosure', e.target.value)}
                  className={txa} />
              </Field>
              <Field label="การปฏิเสธคำขอหรือคำคัดค้านการใช้สิทธิของเจ้าของข้อมูล"
              >
                <textarea rows={2} value={sub.rightsDenial} onChange={e => set('rightsDenial', e.target.value)}
                  className={txa} />
              </Field>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

import { Activity } from '@/types';

interface RopaDCEditFormProps {
  activity: Activity;
}

export default function RopaDCEditForm({ activity }: RopaDCEditFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formType] = useState<FormType>('controller');
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Pre-fill from existing activity
  const [rec, setRec] = useState<RecorderInfo>(
    activity.recorder ?? { name: '', address: '', email: '', phone: '' }
  );
  const [ownerName, setOwnerName] = useState(activity.dataOwnerName ?? activity.department ?? '');
  const [processorName, setProcessorName] = useState('');
  const [ctrlAddress, setCtrlAddress] = useState('');
  const [mainActivity, setMainActivity] = useState(activity.activityName ?? '');
  const [subs, setSubs] = useState<SubActivity[]>(
    activity.subActivities && activity.subActivities.length > 0
      ? activity.subActivities
      : [{ ...newSub(0), purpose: activity.purpose ?? '' }]
  );

  const sec = activity.securityMeasures;
  const [secOrg, setSecOrg] = useState(sec?.organizational ?? '');
  const [secTech, setSecTech] = useState(sec?.technical ?? '');
  const [secPhysical, setSecPhysical] = useState(sec?.physical ?? '');
  const [secAccess, setSecAccess] = useState(sec?.accessControl ?? '');
  const [secUser, setSecUser] = useState(sec?.userResponsibility ?? '');
  const [secAudit, setSecAudit] = useState(sec?.auditTrail ?? '');

  const isCtrl = formType === 'controller';

  const canNext = () => {
    if (step === 1) return rec.name.trim() !== '' && rec.email.trim() !== '';
    if (step === 2) return mainActivity.trim() !== '' && subs.every(s => s.purpose.trim() !== '');
    return true;
  };

  const next = () => { if (canNext()) setStep(s => Math.min(4, s + 1)); };
  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleSaveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  const { updateActivity } = useRopa();

  const handleSubmit = () => {
    updateActivity(activity.id, {
      formType: 'controller',
      recorder: rec,
      department: ownerName,
      activityName: mainActivity,
      dataOwnerName: ownerName,
      subActivities: subs,
      securityMeasures: {
        organizational: secOrg,
        technical: secTech,
        physical: secPhysical,
        accessControl: secAccess,
        userResponsibility: secUser,
        auditTrail: secAudit,
      },
      purpose: subs[0]?.purpose ?? '',
      legalBasis: subs[0]?.legalBasis?.join(', ') ?? '',
      dataSubject: subs[0]?.dataCategory ?? [],
      personalData: subs[0]?.personalDataItems ?? [],
      processing: subs[0]?.collectionMethod ?? [],
      retentionPeriod: subs[0]?.retentionPeriod ?? '',
      status: 'REVIEW',
      updatedAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  // Success screen
  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">แก้ไขและส่งข้อมูลเรียบร้อยแล้ว</h3>
        <p className="text-sm text-slate-500 mb-3">กิจกรรมถูกส่งเพื่อรอการตรวจสอบจาก DPO</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-700 font-medium mb-6">
          Data Controller · {mainActivity}
        </div>
        <br />
        <button onClick={() => router.push('/dc/my-ropa')}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          กลับหน้า My ROPA
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-4 h-px bg-slate-200 z-0" />
          <div className="absolute left-0 top-4 h-px bg-blue-500 z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 4) * 100}%` }} />
          {STEPS.map(s => (
            <div key={s.id} className="flex flex-col items-center gap-1.5 z-10">
              <button onClick={() => s.id < step && setStep(s.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200 ${s.id < step ? 'bg-blue-600 border-blue-600 text-white cursor-pointer' :
                  s.id === step ? 'bg-white border-blue-600 text-blue-600 shadow-md' :
                    'bg-white border-slate-200 text-slate-400 cursor-default'}`}>
                {s.id < step
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                  : s.id}
              </button>
              <span className={`text-xs font-medium hidden md:block whitespace-nowrap ${s.id === step ? 'text-blue-600' : s.id < step ? 'text-slate-500' : 'text-slate-400'}`}>
                {s.short}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{STEPS[step - 1].label}</h2>
            <p className="text-xs text-slate-400">ส่วนที่ {step} / {STEPS.length}</p>
          </div>
          {formType && (
            <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full border ${isCtrl ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {isCtrl ? 'Data Controller Form' : 'Data Processor Form'}
            </span>
          )}
        </div>
      </div>

      {/* ─ Step 2: ผู้ลงบันทึก ─ */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">1</div>
            <div>
              <p className="text-sm font-semibold text-slate-800">ส่วนที่ 1: รายละเอียดของผู้ลงบันทึก ROPA</p>
              <p className="text-xs text-slate-400">ข้อมูลผู้รับผิดชอบการบันทึกกิจกรรมนี้</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="ชื่อ-นามสกุล / ชื่อองค์กร" required>
              <input type="text" value={rec.name} onChange={e => setRec(r => ({ ...r, name: e.target.value }))}
                className={inp} />
            </Field>
            <Field label="เบอร์โทรศัพท์" required>
              <input type="tel" value={rec.phone} onChange={e => setRec(r => ({ ...r, phone: e.target.value }))}
                className={inp} />
            </Field>
          </div>
          <Field label="ที่อยู่" required >
            <textarea rows={2} value={rec.address} onChange={e => setRec(r => ({ ...r, address: e.target.value }))}
              className={txa} />
          </Field>
          <Field label="อีเมล" required>
            <input type="email" value={rec.email} onChange={e => setRec(r => ({ ...r, email: e.target.value }))}
              className={inp} />
          </Field>
        </div>
      )}

      {/* ─ Step 3: กิจกรรมการประมวลผล ─ */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">2</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">ส่วนที่ 2: ตารางข้อมูลกิจกรรมการประมวลผล</p>
                <p className="text-xs text-slate-400">ระบุกิจกรรมหลักและวัตถุประสงค์ย่อยทั้งหมด</p>
              </div>
            </div>

            {isCtrl ? (
              <Field label="ชื่อเจ้าของข้อมูลส่วนบุคคล" required >
                <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  className={inp} />
              </Field>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="ชื่อผู้ประมวลผลข้อมูลส่วนบุคคล" required >
                  <input type="text" value={processorName} onChange={e => setProcessorName(e.target.value)}
                    className={inp} />
                </Field>
                <Field label="ที่อยู่ผู้ควบคุมข้อมูลส่วนบุคคล (ผู้ว่าจ้าง)" required >
                  <input type="text" value={ctrlAddress} onChange={e => setCtrlAddress(e.target.value)}
                    className={inp} />
                </Field>
              </div>
            )}

            <Field label="กิจกรรมการประมวลผลหลัก" required >
              <input type="text" value={mainActivity} onChange={e => setMainActivity(e.target.value)}
                className={inp} />
            </Field>

          </div>

          {/* Sub-activity cards */}
          {subs.map((s, i) => (
            <SubCard key={s.id} sub={s} idx={i} isCtrl={isCtrl}
              onChange={updated => setSubs(prev => prev.map((x, xi) => xi === i ? updated : x))}
              onRemove={() => setSubs(prev => prev.filter((_, xi) => xi !== i))}
              canRemove={subs.length > 1} />
          ))}

          {/* Add button */}
          <button type="button" onClick={() => setSubs(prev => [...prev, newSub(prev.length)])}
            className="w-full flex items-center justify-center gap-2.5 py-4 border-2 border-dashed border-blue-300 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            เพิ่มวัตถุประสงค์ย่อย
          </button>
        </div>
      )}

      {/* ─ Step 4: มาตรการรักษาความปลอดภัย ─ */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">3</div>
            <div>
              <p className="text-sm font-semibold text-slate-800">ส่วนที่ 3: คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="มาตรการเชิงองค์กร (Organizational)" >
              <textarea rows={4} value={secOrg} onChange={e => setSecOrg(e.target.value)}
                className={txa} />
            </Field>
            <Field label="มาตรการเชิงเทคนิค (Technical)" >
              <textarea rows={4} value={secTech} onChange={e => setSecTech(e.target.value)}
                className={txa} />
            </Field>
            <Field label="มาตรการทางกายภาพ (Physical)" >
              <textarea rows={4} value={secPhysical} onChange={e => setSecPhysical(e.target.value)}
                className={txa} />
            </Field>
            <Field label="การควบคุมการเข้าถึงข้อมูล (Access Control)" >
              <textarea rows={4} value={secAccess} onChange={e => setSecAccess(e.target.value)}
                className={txa} />
            </Field>
            <Field label="การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน" >
              <textarea rows={4} value={secUser} onChange={e => setSecUser(e.target.value)}
                className={txa} />
            </Field>
            <Field label="มาตรการตรวจสอบย้อนหลัง (Audit Trail)" >
              <textarea rows={4} value={secAudit} onChange={e => setSecAudit(e.target.value)}
                className={txa} />
            </Field>
          </div>
        </div>
      )}

      {/* ─ Step 5: สรุป ─ */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">สรุปข้อมูลก่อนส่ง</p>
            <p className="text-xs text-slate-400 mt-0.5">กรุณาตรวจสอบความถูกต้องก่อนส่ง DPO เพื่อรออนุมัติ</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">ประเภทฟอร์ม</p>
                <span className={`text-sm font-bold ${isCtrl ? 'text-blue-700' : 'text-emerald-700'}`}>
                  {isCtrl ? 'Data Controller (ผู้ควบคุมข้อมูล)' : 'Data Processor (ผู้ประมวลผลข้อมูล)'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">ผู้ลงบันทึก</p>
                <p className="text-sm font-semibold text-slate-800">{rec.name || '—'}</p>
                <p className="text-xs text-slate-500">{rec.email} · {rec.phone}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-500 mb-1 font-medium">กิจกรรมการประมวลผลหลัก</p>
              <p className="text-base font-bold text-blue-800">{mainActivity || '—'}</p>
              <p className="text-xs text-blue-600 mt-1">
                {isCtrl ? `เจ้าของข้อมูล: ${ownerName || '—'}` : `ผู้ประมวลผล: ${processorName || '—'} · ผู้ว่าจ้าง: ${ctrlAddress || '—'}`}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                วัตถุประสงค์ย่อย ({subs.length} รายการ)
              </p>
              <div className="space-y-2">
                {subs.map((s, i) => (
                  <div key={s.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">{s.purpose || '(ยังไม่ระบุวัตถุประสงค์)'}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {s.legalBasis.map(l => (
                          <span key={l} className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600">{l}</span>
                        ))}
                        {s.retentionPeriod && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700">
                            <Clock8 className="w-3.5 h-3.5" />
                            {s.retentionPeriod}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${s.transferAbroad === 'มี' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                          {s.transferAbroad === 'มี' ? `🌐 โอนข้อมูล → ${s.transferCountry}` : '✓ ไม่โอนต่างประเทศ'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold flex items-center gap-1">
                <SearchAlert className="w-4 h-4 text-amber-600" />
                หมายเหตุ:
              </span> เมื่อส่งแล้ว สถานะจะเปลี่ยนเป็น &ldquo;รอการตรวจสอบ (REVIEW)&rdquo;
              และ DPO จะต้องตรวจสอบและอนุมัติก่อนจึงจะมีสถานะ ACTIVE
            </div>
          </div>
        </div>
      )}

      {/* ─ Footer ─ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button type="button" onClick={handleSaveDraft}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          {draftSaved
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg><span className="text-emerald-600">บันทึกร่างแล้ว!</span></>
            : 'save draft'}
        </button>
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button type="button" onClick={prev}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              ← ย้อนกลับ
            </button>
          )}
          {step < 4 ? (
            <button type="button" onClick={next} disabled={!canNext()}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ถัดไป →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              ส่งเพื่อรอการตรวจสอบ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
