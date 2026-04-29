'use client';

import { useEffect, useState } from 'react';
import { Clock8, AlertCircle, SearchAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRopa } from '@/lib/ropaContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const ACCESS_DRAFT_PREFIX = '__ACCESS_DRAFT__:';

// ─── Types ──────────────────────────────────────────────────────────────────

interface RecorderInfo {
  name: string; address: string; email: string; phone: string;
}

interface SubActivity {
  id: string;
  purpose: string;
  scope: string;
  personalDataItems: string[];
  dataCategory: string[];
  dataType: string[];
  collectionMethod: string[];
  sourceFromOwner: string;
  sourceFromOther: string;
  legalBasis: string[];
  // NOTE: DP form has NO minor consent (เฉพาะ DC)
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
  // NOTE: DP form has NO exemptDisclosure / rightsDenial (เฉพาะ DC)
}

// ─── Constants ──────────────────────────────────────────────────────────────

const PERSONAL_DATA_ITEMS = [
  'ชื่อ-นามสกุล', 'ที่อยู่', 'เบอร์โทรศัพท์', 'อีเมล', 'เลขบัตรประชาชน',
  'วันเดือนปีเกิด', 'ภาพถ่าย', 'ภาพเคลื่อนไหว/วิดีโอ', 'คลิปสัมภาษณ์',
  'ข้อมูลทางการเงิน', 'ข้อมูลสุขภาพ', 'ข้อมูลชีวภาพ', 'IP Address', 'Cookie',
];
const DATA_CATEGORIES = ['ข้อมูลลูกค้า', 'ข้อมูลคู่ค้า', 'ข้อมูลผู้ติดต่อ', 'ข้อมูลพนักงาน'];
const DATA_TYPES = ['ข้อมูลทั่วไป', 'ข้อมูลอ่อนไหว'];
const COLLECTION_METHODS = ['Soft File (ไฟล์อิเล็กทรอนิกส์)', 'Hard Copy (เอกสารกระดาษ)'];
const LEGAL_BASES = [
  'ฐานความยินยอม (Consent)',
  'ฐานสัญญา (Contract)',
  'ฐานหน้าที่ตามกฎหมาย (Legal Obligation)',
  'ฐานประโยชน์สำคัญต่อชีวิต (Vital Interest)',
  'ฐานภารกิจสาธารณะ (Public Task)',
  'ฐานประโยชน์โดยชอบด้วยกฎหมาย (Legitimate Interest)',
];
const STORAGE_TYPES = ['Soft File (ไฟล์อิเล็กทรอนิกส์)', 'Hard Copy (เอกสารกระดาษ)'];
const TRANSFER_EXCEPTIONS = [
  'ปฏิบัติตามกฎหมาย', 'ความยินยอม', 'ปฏิบัติตามสัญญา',
  'ป้องกันอันตรายต่อชีวิต', 'ประโยชน์สาธารณะที่สำคัญ',
];

const STEPS = [
  { id: 1, label: 'ผู้ลงบันทึก', sub: 'รายละเอียดผู้รับผิดชอบการบันทึก' },
  { id: 2, label: 'กิจกรรม', sub: 'กิจกรรมประมวลผลและวัตถุประสงค์ย่อย' },
  { id: 3, label: 'มาตรการ', sub: 'มาตรการรักษาความมั่นคงปลอดภัย' },
  { id: 4, label: 'สรุป', sub: 'ตรวจสอบและส่ง' },
];

// ─── UI Helpers ──────────────────────────────────────────────────────────────

const inp = 'w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200';
const txa = `${inp} resize-none`;
const sel = `${inp} cursor-pointer`;

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function SectionBox({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-slate-700">{title}</span>
      </div>
      {children}
    </div>
  );
}

function StepHeader({ stepNum, title, sub }: { stepNum: number; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
        {stepNum}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

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
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm text-left transition-all ${on
              ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
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
          className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${value === v
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}>
          {v}
        </button>
      ))}
    </div>
  );
}

function newSub(i: number): SubActivity {
  return {
    id: `s${Date.now()}${i}`,
    purpose: '',
    scope: '',
    personalDataItems: [],
    dataCategory: [],
    dataType: [],
    collectionMethod: [],
    sourceFromOwner: '',
    sourceFromOther: '',
    legalBasis: [],
    minorConsentUnder10: '',
    minorConsentAge10to20: '',
    transferAbroad: 'ไม่มี',
    transferCountry: '',
    transferAffiliate: 'ไม่ใช่',
    transferAffiliateCompany: '',
    transferMethod: '',
    transferStandard: '',
    transferException28: '',
    storageType: [],
    storageMethod: '',
    retentionPeriod: '',
    accessRights: '',
    deletionMethod: '',
    exemptDisclosure: '',
    rightsDenial: '',
  };
}

// ─── Sub-activity Accordion ──────────────────────────────────────────────────

function SubCard({ sub, idx, onChange, onRemove, canRemove }: {
  sub: SubActivity; idx: number;
  onChange: (s: SubActivity) => void; onRemove: () => void; canRemove: boolean;
}) {
  const [open, setOpen] = useState(true);
  const set = <K extends keyof SubActivity>(k: K, v: SubActivity[K]) => onChange({ ...sub, [k]: v });

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Accordion header */}
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
                {sub.purpose.length > 55 ? sub.purpose.slice(0, 55) + '…' : sub.purpose}
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

          {/* วัตถุประสงค์ */}
          <Field label="วัตถุประสงค์ของการประมวลผล" required>
            <textarea rows={2} value={sub.purpose} onChange={e => set('purpose', e.target.value)}
              placeholder="เช่น เพื่อซื้อ เช่า แลกเปลี่ยนสินค้า/บริการ" className={txa} />
          </Field>

          <Field label="ขอบเขตการใช้งานข้อมูล" required>
            <textarea
              rows={3}
              value={sub.scope}
              onChange={e => set('scope', e.target.value)}
              placeholder="เช่น ใช้เฉพาะชื่อ-นามสกุลและอีเมล เพื่อดำเนินการตามวัตถุประสงค์ที่ระบุ"
              className={txa}
            />
          </Field>

          {/* 2. ข้อมูลที่จัดเก็บ */}
          <Field label="ข้อมูลส่วนบุคคลที่จัดเก็บ" required >
            <MultiCheck options={PERSONAL_DATA_EXAMPLES} selected={sub.personalDataItems} onChange={v => set('personalDataItems', v)} cols={3} />
          </Field>

          {/* หมวดหมู่ + ประเภท */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="หมวดหมู่ของข้อมูล" required>
              <MultiCheck options={DATA_CATEGORIES} selected={sub.dataCategory} onChange={v => set('dataCategory', v)} />
            </Field>
            <Field label="ประเภทของข้อมูล" required>
              <MultiCheck options={DATA_TYPES} selected={sub.dataType} onChange={v => set('dataType', v)} />
            </Field>
          </div>

          {/* วิธีการได้มา */}
          <Field label="วิธีการได้มาซึ่งข้อมูล" required>
            <MultiCheck options={COLLECTION_METHODS} selected={sub.collectionMethod} onChange={v => set('collectionMethod', v)} />
          </Field>

          {/* แหล่งที่มา */}
          <SectionBox
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
            title="แหล่งที่ได้มาซึ่งข้อมูล"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="จากผู้ควบคุมข้อมูลส่วนบุคคลโดยตรง">
                <input type="text" value={sub.sourceFromOwner} onChange={e => set('sourceFromOwner', e.target.value)}
                  placeholder="เช่น เอกสารสัญญา, ใบสมัคร" className={inp} />
              </Field>
              <Field label="จากแหล่งอื่น">
                <input type="text" value={sub.sourceFromOther} onChange={e => set('sourceFromOther', e.target.value)}
                  placeholder="เช่น บุคคลที่สาม, API" className={inp} />
              </Field>
            </div>
          </SectionBox>

          {/* ฐานการประมวลผล */}
          <Field label="ฐานในการประมวลผล (Legal Basis)" required>
            <MultiCheck options={LEGAL_BASES} selected={sub.legalBasis} onChange={v => set('legalBasis', v)} />
          </Field>

          {/* การโอนต่างประเทศ */}
          <SectionBox
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
            title="การส่งหรือโอนข้อมูลไปยังต่างประเทศ"
          >
            <Field label="มีการส่งหรือโอนข้อมูลไปต่างประเทศหรือไม่">
              <YesNo value={sub.transferAbroad} onChange={v => set('transferAbroad', v)} />
            </Field>
            {sub.transferAbroad === 'มี' && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="ประเทศปลายทาง" required>
                    <input type="text" value={sub.transferCountry} onChange={e => set('transferCountry', e.target.value)} className={inp} />
                  </Field>
                  <Field label="วิธีการโอนข้อมูล">
                    <input type="text" value={sub.transferMethod} onChange={e => set('transferMethod', e.target.value)}
                      placeholder="เช่น โอนทางอิเล็กทรอนิกส์" className={inp} />
                  </Field>
                </div>
                <Field label="เป็นการส่งข้อมูลในกลุ่มบริษัทในเครือหรือไม่">
                  <YesNo value={sub.transferAffiliate} onChange={v => set('transferAffiliate', v)} options={['ใช่', 'ไม่ใช่']} />
                </Field>
                {sub.transferAffiliate === 'ใช่' && (
                  <Field label="ชื่อบริษัทในเครือ">
                    <input type="text" value={sub.transferAffiliateCompany} onChange={e => set('transferAffiliateCompany', e.target.value)} className={inp} />
                  </Field>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="มาตรฐานการคุ้มครองข้อมูลของประเทศปลายทาง">
                    <input type="text" value={sub.transferStandard} onChange={e => set('transferStandard', e.target.value)} className={inp} />
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
          </SectionBox>

          {/* นโยบายเก็บรักษา */}
          <SectionBox
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>}
            title="นโยบายการเก็บรักษาข้อมูลส่วนบุคคล"
          >
            <Field label="ประเภทของข้อมูลที่จัดเก็บ">
              <MultiCheck options={STORAGE_TYPES} selected={sub.storageType} onChange={v => set('storageType', v)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="วิธีการเก็บรักษาข้อมูล">
                <textarea rows={2} value={sub.storageMethod} onChange={e => set('storageMethod', e.target.value)}
                  placeholder="เช่น เข้ารหัส, ใส่แฟ้ม" className={txa} />
              </Field>
              <Field label="ระยะเวลาการเก็บรักษาข้อมูล" required>
                <input type="text" value={sub.retentionPeriod} onChange={e => set('retentionPeriod', e.target.value)}
                  placeholder="เช่น 2 ปี, 5 ปี" className={inp} />
              </Field>
            </div>
            <Field label="สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล">
              <textarea rows={2} value={sub.accessRights} onChange={e => set('accessRights', e.target.value)}
                placeholder="ระบุเงื่อนไขการใช้สิทธิและวิธีการ" className={txa} />
            </Field>
            <Field label="วิธีการลบหรือทำลายข้อมูลเมื่อสิ้นสุดระยะเวลา">
              <textarea rows={2} value={sub.deletionMethod} onChange={e => set('deletionMethod', e.target.value)}
                placeholder="เช่น เครื่องทำลายเอกสาร, Secure Delete" className={txa} />
            </Field>
          </SectionBox>

        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface RopaFormProps {
  activityId?: string
  editRequestId?: string;
  onSubmit?: (data: Record<string, unknown>) => void;
  onSaveDraft?: (data: Record<string, unknown>) => void;
}

type AccessRequestDetail = {
  request_id: string;
  purpose?: string | null;
  scope?: string | null;
  duration?: string | null;
  processor_name?: string | null;
  processor_address?: string | null;
  activity?: {
    activity_name?: string | null;
  };
};

const parseAccessDraftPayload = (value?: string | null) => {
  if (!value?.startsWith(ACCESS_DRAFT_PREFIX)) return null;

  try {
    return JSON.parse(value.slice(ACCESS_DRAFT_PREFIX.length));
  } catch {
    return null;
  }
};

export default function RopaDPForm({ activityId, editRequestId, onSubmit, onSaveDraft }: RopaFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [requestId, setRequestId] = useState<string | undefined>(editRequestId);
  const TOTAL = STEPS.length;

  // Step 1 — recorder
  const [rec, setRec] = useState<RecorderInfo>({ name: '', address: '', email: '', phone: '' });

  // Step 2 — activity info
  const [processorName, setProcessorName] = useState('');
  const [ctrlAddress, setCtrlAddress] = useState('');
  const [mainActivity, setMainActivity] = useState('');
  const [subs, setSubs] = useState<SubActivity[]>([newSub(0)]);

  // Step 3 — security
  const [secOrg, setSecOrg] = useState('');
  const [secTech, setSecTech] = useState('');
  const [secPhysical, setSecPhysical] = useState('');
  const [secAccess, setSecAccess] = useState('');
  const [secUser, setSecUser] = useState('');
  const [secAudit, setSecAudit] = useState('');

  useEffect(() => {
    const fetchExistingRequest = async () => {
      if (!editRequestId) return;

      try {
        const res = await fetch(`${API_URL}/api/access/${editRequestId}`);
        const response = await res.json();

        if (!res.ok) {
          const detail = Array.isArray(response.detail)
            ? response.detail.join('\n')
            : response.detail;
          alert(detail || response.error || 'โหลด DP Form ไม่สำเร็จ');
          return;
        }

        const request = response.data as AccessRequestDetail;
        const draftPayload = parseAccessDraftPayload(request.duration);
        setRequestId(request.request_id);
        setRec(draftPayload?.rec || { name: '', address: '', email: '', phone: '' });
        setProcessorName(draftPayload?.processorName || request.processor_name || '');
        setCtrlAddress(draftPayload?.ctrlAddress || request.processor_address || '');
        setMainActivity(draftPayload?.mainActivity || request.activity?.activity_name || '');
        setSubs(draftPayload?.subs || (() => {
          const current = newSub(0);
          return [{
            ...current,
            purpose: request.purpose || '',
            scope: request.scope || '',
            retentionPeriod: request.duration?.startsWith(ACCESS_DRAFT_PREFIX) ? '' : request.duration || '',
          }];
        })());
        setSecOrg(draftPayload?.secOrg || '');
        setSecTech(draftPayload?.secTech || '');
        setSecPhysical(draftPayload?.secPhysical || '');
        setSecAccess(draftPayload?.secAccess || '');
        setSecUser(draftPayload?.secUser || '');
        setSecAudit(draftPayload?.secAudit || '');
      } catch (error) {
        console.error(error);
        alert('โหลด DP Form ไม่สำเร็จ');
      }
    };

    fetchExistingRequest();
  }, [editRequestId]);

  const isCtrl = formType === 'controller';

  const canNext = () => {
    if (step === 1) {
      return (
        rec.name.trim() !== '' &&
        rec.phone.trim() !== '' &&
        rec.address.trim() !== '' &&
        rec.email.trim() !== ''
      );
    }

    if (step === 2) {
      return (
        mainActivity.trim() !== '' &&
        processorName.trim() !== '' &&
        ctrlAddress.trim() !== '' &&
        subs.every(s =>
          s.purpose.trim() !== '' &&
          s.scope.trim() !== '' &&
          s.personalDataItems.length > 0 &&
          s.dataCategory.length > 0 &&
          s.dataType.length > 0 &&
          s.collectionMethod.length > 0 &&
          s.sourceFromOwner.trim() !== '' &&
          s.legalBasis.length > 0 &&
          s.retentionPeriod.trim() !== ''
        )
      );
    }

    return true;
  };
  const next = () => {
    if (canNext()) setStep(s => Math.min(STEPS.length, s + 1));
  };
  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleSaveDraft = async () => {
    try {
      if (!user?.id) {
        alert('กรุณาเข้าสู่ระบบใหม่ก่อนบันทึกแบบร่าง');
        return;
      }

      if (!activityId) {
        alert('ไม่พบ ROPA ที่ต้องการขอใช้งาน');
        return;
      }

      const firstSub = subs[0] || newSub(0);

      const res = await fetch(`${API_URL}/api/access/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          activity_id: activityId,
          requested_by: user.id,
          purpose: firstSub.purpose,
          scope: firstSub.scope,
          duration: firstSub.retentionPeriod || '',
          draft_payload: JSON.stringify({
            rec,
            processorName,
            ctrlAddress,
            mainActivity,
            subs,
            secOrg,
            secTech,
            secPhysical,
            secAccess,
            secUser,
            secAudit,
          }),
          processor_name: processorName,
          processor_address: ctrlAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = Array.isArray(data.detail)
          ? data.detail.join('\n')
          : data.detail;

        alert(detail || data.error || 'บันทึกแบบร่างไม่สำเร็จ');
        return;
      }

      const savedRequestId = data.data?.request_id;
      if (savedRequestId) {
        setRequestId(savedRequestId);
      }

      onSaveDraft?.({
        request_id: savedRequestId,
        formType,
        mainActivity,
      });

      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch (error) {
      console.error(error);
      alert('บันทึกแบบร่างไม่สำเร็จ');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        alert('กรุณาเข้าสู่ระบบใหม่ก่อนส่งฟอร์ม');
        return;
      }

      if (!activityId) {
        alert('ไม่พบ ROPA ที่ต้องการขอใช้งาน');
        return;
      }

      const firstSub = subs[0];

      if (!firstSub?.purpose?.trim()) {
        alert('กรุณากรอกวัตถุประสงค์');
        return;
      }

      if (!firstSub?.scope?.trim()) {
        alert('กรุณากรอกขอบเขตการใช้งานข้อมูล');
        return;
      }

      const res = await fetch(`${API_URL}/api/access/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_id: activityId,
          requested_by: user.id,
          purpose: firstSub.purpose,
          scope: firstSub.scope,
          duration: firstSub.retentionPeriod || '',
          processor_name: processorName,
          processor_address: ctrlAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log('CREATE DP FORM ERROR:', data);

        const detail = Array.isArray(data.detail)
          ? data.detail.join('\n')
          : data.detail;

        alert(detail || data.error || 'ส่ง DP Form ไม่สำเร็จ');
        return;
      }

      onSubmit?.({
        request_id: data.data?.request_id,
        activity_id: activityId,
        formType,
        mainActivity,
        subs,
      });

      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert('ส่ง DP Form ไม่สำเร็จ');
    }
  };

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">ส่งข้อมูลเรียบร้อยแล้ว</h3>
        <p className="text-sm text-slate-500 mb-2">กิจกรรมถูกส่งเพื่อรอการตรวจสอบจาก DPO</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-sm text-emerald-700 font-medium mb-6">
          Data Processor Form · {mainActivity}
        </div>
        <br />
        <button onClick={() => {
          setStep(1); setSubmitted(false);
          setRec({ name: '', address: '', email: '', phone: '' });
          setMainActivity(''); setSubs([newSub(0)]);
          setProcessorName(''); setCtrlAddress('');
        }} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          สร้างกิจกรรมใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Progress bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-4 h-px bg-slate-200 z-0" />
          <div className="absolute left-0 top-4 h-px bg-emerald-500 z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / (TOTAL - 1)) * 100}%` }} />
          {STEPS.map(s => (
            <div key={s.id} className="flex flex-col items-center gap-1.5 z-10">
              <button onClick={() => s.id < step && setStep(s.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${s.id < step
                  ? 'bg-emerald-600 border-emerald-600 text-white cursor-pointer hover:bg-emerald-700'
                  : s.id === step
                    ? 'bg-white border-emerald-600 text-emerald-600 shadow-md'
                    : 'bg-white border-slate-200 text-slate-400 cursor-default'}`}>
                {s.id < step
                  ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                  : s.id}
              </button>
              <span className={`text-[10px] font-medium text-center leading-tight hidden sm:block ${s.id === step ? 'text-emerald-600' : s.id < step ? 'text-slate-500' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">ส่วนที่ {step} / {TOTAL} · {STEPS[step - 1].sub}</p>
          <span className="flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
            Data Processor Form
          </span>
        </div>
      </div>

      {/* ── Step 1: ผู้ลงบันทึก ── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <StepHeader stepNum={1} title="รายละเอียดของผู้ลงบันทึก ROPA" sub="ข้อมูลผู้รับผิดชอบการบันทึกกิจกรรมนี้" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ชื่อ-นามสกุล / ชื่อองค์กร" required>
              <input type="text" value={rec.name} onChange={e => setRec(r => ({ ...r, name: e.target.value }))}
                placeholder="ชื่อผู้ลงบันทึก" className={inp} />
            </Field>
            <Field label="เบอร์โทรศัพท์">
              <input type="tel" value={rec.phone} onChange={e => setRec(r => ({ ...r, phone: e.target.value }))}
                placeholder="02-xxx-xxxx" className={inp} />
            </Field>
          </div>
          <Field label="ที่อยู่">
            <textarea rows={2} value={rec.address} onChange={e => setRec(r => ({ ...r, address: e.target.value }))}
              placeholder="ที่อยู่องค์กร" className={txa} />
          </Field>
          <Field label="อีเมล" required>
            <input type="email" value={rec.email} onChange={e => setRec(r => ({ ...r, email: e.target.value }))}
              placeholder="email@company.com" className={inp} />
          </Field>
        </div>
      )}

      {/* ── Step 2: กิจกรรมการประมวลผล ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <StepHeader stepNum={2} title="ตารางข้อมูลกิจกรรมการประมวลผล" sub="ระบุกิจกรรมหลักและวัตถุประสงค์ย่อยทั้งหมด" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="ชื่อผู้ประมวลผลข้อมูลส่วนบุคคล" required>
                <input type="text" value={processorName} onChange={e => setProcessorName(e.target.value)}
                  placeholder="ชื่อบริษัท / องค์กรผู้ประมวลผล" className={inp} />
              </Field>
              <Field label="ที่อยู่ผู้ควบคุมข้อมูลส่วนบุคคล (ผู้ว่าจ้าง)" required>
                <input type="text" value={ctrlAddress} onChange={e => setCtrlAddress(e.target.value)}
                  placeholder="ที่อยู่ผู้ว่าจ้าง / ผู้ควบคุมข้อมูล" className={inp} />
              </Field>
            </div>
            <Field label="กิจกรรมการประมวลผลหลัก" required>
              <input type="text" value={mainActivity} onChange={e => setMainActivity(e.target.value)}
                placeholder="เช่น เพื่อการปฏิบัติตามสัญญาระหว่างคู่ค้า" className={inp} />
            </Field>
          </div>

          {subs.map((s, i) => (
            <SubCard key={s.id} sub={s} idx={i}
              onChange={updated => setSubs(prev => prev.map((x, xi) => xi === i ? updated : x))}
              onRemove={() => setSubs(prev => prev.filter((_, xi) => xi !== i))}
              canRemove={subs.length > 1} />
          ))}

          <button type="button" onClick={() => setSubs(prev => [...prev, newSub(prev.length)])}
            className="w-full flex items-center justify-center gap-2.5 py-4 border-2 border-dashed border-emerald-300 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            เพิ่มวัตถุประสงค์ย่อย
          </button>
        </div>
      )}

      {/* ── Step 3: มาตรการความปลอดภัย ── */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <StepHeader stepNum={3} title="คำอธิบายมาตรการรักษาความมั่นคงปลอดภัย" sub="มาตรการเชิงองค์กร เทคนิค และกายภาพ" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="มาตรการเชิงองค์กร (Organizational)">
              <textarea rows={4} value={secOrg} onChange={e => setSecOrg(e.target.value)}
                placeholder="นโยบาย, การอบรม, PDPA committee..." className={txa} />
            </Field>
            <Field label="มาตรการเชิงเทคนิค (Technical)">
              <textarea rows={4} value={secTech} onChange={e => setSecTech(e.target.value)}
                placeholder="Encryption, Firewall, 2FA..." className={txa} />
            </Field>
            <Field label="มาตรการทางกายภาพ (Physical)">
              <textarea rows={4} value={secPhysical} onChange={e => setSecPhysical(e.target.value)}
                placeholder="ระบบล็อค, CCTV, บัตรผ่าน..." className={txa} />
            </Field>
            <Field label="การควบคุมการเข้าถึงข้อมูล (Access Control)">
              <textarea rows={4} value={secAccess} onChange={e => setSecAccess(e.target.value)}
                placeholder="Role-based access, Audit log..." className={txa} />
            </Field>
            <Field label="การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน">
              <textarea rows={4} value={secUser} onChange={e => setSecUser(e.target.value)}
                placeholder="กำหนด role, สิทธิ์การใช้งาน..." className={txa} />
            </Field>
            <Field label="มาตรการตรวจสอบย้อนหลัง (Audit Trail)">
              <textarea rows={4} value={secAudit} onChange={e => setSecAudit(e.target.value)}
                placeholder="Audit log, การทบทวนสิทธิ์ประจำปี..." className={txa} />
            </Field>
          </div>
        </div>
      )}

      {/* ── Step 4: สรุป ── */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">สรุปข้อมูลก่อนส่ง</p>
            <p className="text-xs text-slate-400 mt-0.5">กรุณาตรวจสอบความถูกต้องก่อนส่งให้ DPO อนุมัติ</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">ผู้ลงบันทึก</p>
                <p className="text-sm font-semibold text-slate-800">{rec.name || '—'}</p>
                <p className="text-xs text-slate-500">{rec.email} · {rec.phone}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">ผู้ประมวลผล</p>
                <p className="text-sm font-semibold text-slate-800">{processorName || '—'}</p>
                <p className="text-xs text-slate-500 truncate">{ctrlAddress || '—'}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-xs text-emerald-600 mb-0.5 font-medium">กิจกรรมการประมวลผลหลัก</p>
              <p className="text-base font-bold text-emerald-800">{mainActivity || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                วัตถุประสงค์ย่อย ({subs.length} รายการ)
              </p>
              <div className="space-y-2">
                {subs.map((s, i) => (
                  <div key={s.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">{s.purpose || '(ยังไม่ระบุวัตถุประสงค์)'}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {s.legalBasis.map(l => (
                          <span key={l} className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600">{l}</span>
                        ))}
                        {s.retentionPeriod && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700">
                            <Clock8 className="w-3 h-3" />{s.retentionPeriod}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${s.transferAbroad === 'มี' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                          {s.transferAbroad === 'มี' ? `🌐 → ${s.transferCountry}` : '✓ ไม่โอนต่างประเทศ'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
              <span className="font-semibold flex items-center gap-1">
                <SearchAlert className="w-4 h-4 text-amber-600" />
                หมายเหตุ:
              </span> เมื่อส่งแล้ว สถานะจะเปลี่ยนเป็น &ldquo;รอการตรวจสอบ (REVIEW)&rdquo;
              และ DPO จะต้องตรวจสอบและอนุมัติก่อนจึงจะมีสถานะ ACTIVE
            </div>
          </div>
      )}

          {/* ── Footer nav ── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center justify-between gap-3">
            <button type="button" onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              {draftSaved
            ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg><span className="text-emerald-600">บันทึกแบบร่างแล้ว</span></>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>บันทึกแบบร่าง</>}
            </button>
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                  ย้อนกลับ
                </button>
              )}
  {
    step < STEPS.length ? (
      <button
        type="button"
        onClick={next}
        disabled={!canNext()}
        className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ถัดไป →
      </button>
    ) : (
    <button
      type="button"
      onClick={handleSubmit}
      className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      ส่งเพื่อรอการตรวจสอบ
        </button>
      )}
    </div>
      </div >
    </div >
  );
  }