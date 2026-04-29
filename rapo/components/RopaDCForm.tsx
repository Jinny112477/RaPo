'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Info } from 'lucide-react';
import { notifyError } from '@/lib/notify';

// ─── Types ──────────────────────────────────────────────────────────────────

type FormType = 'controller';

interface RecorderInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
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

interface DepartmentOption {
  department_id: string;
  department_name: string;
}

type ApiFormResponse = {
  activity_id: string;
  activity_name?: string;
  activity_subject?: string;
  purpose?: string;
  consentless_data?: string | null;
  denial_details?: string | null;
  source?: { name?: string };
  legal_basis?: { name?: string };
  obtaining_data?: { name?: string };
  policy?: {
    retention_period?: string;
    deletion_method?: string;
    data_type?: string;
  };
  security_measurement?: {
    organizational_measures?: string;
    technical_measures?: string;
    physical_measures?: string;
    access_control?: string;
    define_responsibility?: string;
    audit_trail?: string;
  };
};

interface RopaFormProps {
  editActivityId?: string;
  onSubmit?: (data: Record<string, unknown>) => void;
  onSaveDraft?: (data: Record<string, unknown>) => void;
}

// ─── Constants from the first form ───────────────────────────────────────────

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

const EMPTY_RECORDER: RecorderInfo = { name: '', address: '', email: '', phone: '' };

function newSub(i: number): SubActivity {
  return {
    id: `s${Date.now()}${i}`,
    purpose: '',
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const splitCsv = (value?: string | null) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseDraftPayload = (value?: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const joinList = (items: string[]) => items.filter(Boolean).join(', ');

const parseRetentionDurationParts = (value?: string) => {
  const raw = String(value || '');
  const days = (raw.match(/(\d+)\s*วัน/)?.[1] || '').trim();
  const months = (raw.match(/(\d+)\s*เดือน/)?.[1] || '').trim();
  const years = (raw.match(/(\d+)\s*ปี/)?.[1] || '').trim();
  return { days, months, years };
};

const buildRetentionDuration = (days: string, months: string, years: string) => {
  const parts = [
    days ? `${days} วัน` : '',
    months ? `${months} เดือน` : '',
    years ? `${years} ปี` : '',
  ].filter(Boolean);
  return parts.join(' ');
};

const inp = 'w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200';
const txa = `${inp} resize-none`;
const sel = `${inp} cursor-pointer`;

function Field({ label, required, hint, children }: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
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

function MultiCheck({ options, selected, onChange, cols = 2 }: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  cols?: 2 | 3;
}) {
  const toggle = (o: string) =>
    onChange(selected.includes(o) ? selected.filter(s => s !== o) : [...selected, o]);

  return (
    <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {options.map(o => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm text-left transition-all ${on ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
          >
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
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}) {
  return (
    <div className="flex gap-2">
      {options.map(v => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${value === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({ step, title, sub }: { step: number; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

function SubCard({ sub, idx, onChange, onRemove, canRemove }: {
  sub: SubActivity;
  idx: number;
  onChange: (s: SubActivity) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [open, setOpen] = useState(true);
  const set = <K extends keyof SubActivity>(k: K, v: SubActivity[K]) => onChange({ ...sub, [k]: v });
  const retentionParts = useMemo(
    () => parseRetentionDurationParts(sub.retentionPeriod),
    [sub.retentionPeriod],
  );

  const setRetentionPart = (part: 'days' | 'months' | 'years', value: string) => {
    const sanitized = value.replace(/\D/g, '');
    const current = {
      days: retentionParts.days,
      months: retentionParts.months,
      years: retentionParts.years,
    };

    if (!sanitized) {
      current[part] = '';
    } else {
      const numeric = Number(sanitized);
      if (part === 'days') current.days = String(Math.min(numeric, 31));
      if (part === 'months') current.months = String(Math.min(numeric, 12));
      if (part === 'years') current.years = String(Math.min(numeric, 9999));
    }

    set('retentionPeriod', buildRetentionDuration(current.days, current.months, current.years));
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between px-5 py-3.5 cursor-pointer select-none transition-colors ${open ? 'bg-[#1a3a6b]' : 'bg-slate-50 hover:bg-slate-100'}`}
      >
        <div className="flex items-center gap-3">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${open ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'}`}>
            {idx + 1}
          </span>
          <div>
            <p className={`text-sm font-semibold ${open ? 'text-white' : 'text-slate-700'}`}>
                วัตถุประสงค์
            </p>
            {sub.purpose && (
              <p className={`text-xs mt-0.5 ${open ? 'text-blue-200' : 'text-slate-400'}`}>
                {sub.purpose.length > 50 ? `${sub.purpose.slice(0, 50)}…` : sub.purpose}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className={`p-1.5 rounded-lg transition-colors ${open ? 'text-white/60 hover:text-white hover:bg-white/15' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          )}
          <span className={open ? 'text-white/70' : 'text-slate-400'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {open && (
        <div className="p-5 space-y-5 bg-white">
          <Field label="วัตถุประสงค์ของการประมวลผล" required>
            <textarea rows={2} value={sub.purpose} onChange={e => set('purpose', e.target.value)} className={txa} placeholder="เช่น เพื่อสมัครสมาชิกและให้บริการลูกค้า" />
          </Field>

          <Field label="ข้อมูลส่วนบุคคลที่จัดเก็บ" required>
            <MultiCheck options={PERSONAL_DATA_EXAMPLES} selected={sub.personalDataItems} onChange={v => set('personalDataItems', v)} cols={3} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="หมวดหมู่ของข้อมูล" required>
              <MultiCheck options={DATA_CATEGORIES} selected={sub.dataCategory} onChange={v => set('dataCategory', v)} />
            </Field>
            <Field label="ประเภทของข้อมูล" required>
              <MultiCheck options={DATA_TYPES} selected={sub.dataType} onChange={v => set('dataType', v)} />
            </Field>
          </div>

          <Field label="วิธีการได้มาซึ่งข้อมูล" required>
            <MultiCheck options={COLLECTION_METHODS} selected={sub.collectionMethod} onChange={v => set('collectionMethod', v)} />
          </Field>

          <Field label="แหล่งที่ได้มาซึ่งข้อมูล" required>
            <div className="flex gap-3">
              {['จากเจ้าของข้อมูลโดยตรง', 'จากแหล่งอื่น'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('sourceFromOwner', v)}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${sub.sourceFromOwner === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>

          {sub.sourceFromOwner === 'จากแหล่งอื่น' && (
            <Field label="ระบุแหล่งที่มาอื่น" required>
              <input type="text" value={sub.sourceFromOther} onChange={e => set('sourceFromOther', e.target.value)} className={inp} placeholder="เช่น หน่วยงานภายนอก / API / คู่ค้า" />
            </Field>
          )}

          <Field label="ฐานในการประมวลผล" required>
            <MultiCheck options={LEGAL_BASES_TH} selected={sub.legalBasis} onChange={v => set('legalBasis', v)} />
          </Field>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-4">
            <span className="text-sm font-semibold text-amber-800">การขอความยินยอมของผู้เยาว์</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="อายุไม่เกิน 10 ปี" required>
                <textarea rows={2} value={sub.minorConsentUnder10} onChange={e => set('minorConsentUnder10', e.target.value)} className={txa} placeholder="เช่น ต้องได้รับความยินยอมจากผู้ปกครอง" />
              </Field>
              <Field label="อายุ 10–20 ปี" required>
                <textarea rows={2} value={sub.minorConsentAge10to20} onChange={e => set('minorConsentAge10to20', e.target.value)} className={txa} placeholder="เช่น ขอ consent จากเจ้าของข้อมูลและผู้ปกครองร่วม" />
              </Field>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <Field label="มีการส่งหรือโอนข้อมูลไปต่างประเทศหรือไม่" required>
              <YesNo value={sub.transferAbroad} onChange={v => set('transferAbroad', v)} />
            </Field>

            {sub.transferAbroad === 'มี' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="ประเทศปลายทาง" required>
                    <input type="text" value={sub.transferCountry} onChange={e => set('transferCountry', e.target.value)} className={inp} placeholder="เช่น Singapore / Japan" />
                  </Field>
                  <Field label="วิธีการโอนข้อมูล" required>
                    <input type="text" value={sub.transferMethod} onChange={e => set('transferMethod', e.target.value)} className={inp} placeholder="เช่น API / Secure File Transfer" />
                  </Field>
                </div>

                <Field label="เป็นการส่งข้อมูลในกลุ่มบริษัทในเครือหรือไม่" required>
                  <YesNo value={sub.transferAffiliate} onChange={v => set('transferAffiliate', v)} options={['ใช่', 'ไม่ใช่']} />
                </Field>

                {sub.transferAffiliate === 'ใช่' && (
                  <Field label="ชื่อบริษัทในเครือ" required>
                    <input type="text" value={sub.transferAffiliateCompany} onChange={e => set('transferAffiliateCompany', e.target.value)} className={inp} placeholder="เช่น ABC Global Co., Ltd." />
                  </Field>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="มาตรฐานการคุ้มครองข้อมูลของประเทศปลายทาง" required>
                    <input type="text" value={sub.transferStandard} onChange={e => set('transferStandard', e.target.value)} className={inp} placeholder="เช่น GDPR / SCC" />
                  </Field>
                  <Field label="ข้อยกเว้นตามมาตรา 28" required>
                    <select value={sub.transferException28} onChange={e => set('transferException28', e.target.value)} className={sel}>
                      <option value="">เลือกข้อยกเว้น...</option>
                      {TRANSFER_EXCEPTIONS.map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <Field label="รูปแบบการเก็บรักษาข้อมูล" required>
              <MultiCheck options={STORAGE_TYPES} selected={sub.storageType} onChange={v => set('storageType', v)} />
            </Field>
            <Field label="วิธีการเก็บรักษาข้อมูล" required>
              <textarea rows={2} value={sub.storageMethod} onChange={e => set('storageMethod', e.target.value)} className={txa} placeholder="เช่น จัดเก็บใน Cloud และระบบภายในองค์กร" />
            </Field>
            <Field label="ระยะเวลาการเก็บรักษาข้อมูล" required>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={31}
                    value={retentionParts.days}
                    onChange={e => setRetentionPart('days', e.target.value)}
                    className={inp}
                    placeholder="0"
                  />
                  <span className="text-sm text-slate-500 whitespace-nowrap">วัน</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={retentionParts.months}
                    onChange={e => setRetentionPart('months', e.target.value)}
                    className={inp}
                    placeholder="0"
                  />
                  <span className="text-sm text-slate-500 whitespace-nowrap">เดือน</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    value={retentionParts.years}
                    onChange={e => setRetentionPart('years', e.target.value)}
                    className={inp}
                    placeholder="0"
                  />
                  <span className="text-sm text-slate-500 whitespace-nowrap">ปี</span>
                </div>
              </div>
            </Field>
            <Field label="สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล" required>
              <textarea rows={2} value={sub.accessRights} onChange={e => set('accessRights', e.target.value)} className={txa} placeholder="เช่น จำกัดเฉพาะพนักงานที่ได้รับอนุญาต" />
            </Field>
            <Field label="วิธีการลบหรือทำลายข้อมูลเมื่อสิ้นสุดระยะเวลา" required>
              <textarea rows={2} value={sub.deletionMethod} onChange={e => set('deletionMethod', e.target.value)} className={txa} placeholder="เช่น ลบจากระบบและทำลายเอกสาร" />
            </Field>
          </div>

          <Field label="การใช้หรือเปิดเผยข้อมูลที่ได้รับยกเว้นไม่ต้องขอความยินยอม" required>
            <textarea rows={2} value={sub.exemptDisclosure} onChange={e => set('exemptDisclosure', e.target.value)} className={txa} placeholder="เช่น ใช้เพื่อปฏิบัติตามกฎหมาย" />
          </Field>

          <Field label="การปฏิเสธคำขอหรือคำคัดค้านการใช้สิทธิของเจ้าของข้อมูล" required>
            <textarea rows={2} value={sub.rightsDenial} onChange={e => set('rightsDenial', e.target.value)} className={txa} placeholder="เช่น ปฏิเสธเนื่องจากกระทบสิทธิผู้อื่น" />
          </Field>
        </div>
      )}
    </div>
  );
}

export default function RopaDCForm({ editActivityId, onSubmit, onSaveDraft }: RopaFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [editingActivityId, setEditingActivityId] = useState<string | undefined>(editActivityId);

  const [department, setDepartment] = useState('');
  const [rec, setRec] = useState<RecorderInfo>(EMPTY_RECORDER);
  const [ownerName, setOwnerName] = useState('');
  const [mainActivity, setMainActivity] = useState('');
  const [subs, setSubs] = useState<SubActivity[]>([newSub(0)]);
  const [secOrg, setSecOrg] = useState('');
  const [secTech, setSecTech] = useState('');
  const [secPhysical, setSecPhysical] = useState('');
  const [secAccess, setSecAccess] = useState('');
  const [secResponsibility, setSecResponsibility] = useState('');
  const [secAudit, setSecAudit] = useState('');

  const formType: FormType = 'controller';
  const firstSub = subs[0] || newSub(0);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/departments`);
        const data = await res.json();
        if (!res.ok) return;
        setDepartments(data.data || []);
      } catch (error) {
        console.error('FETCH DEPARTMENTS ERROR:', error);
      }
    };

    fetchDepartments();
  }, [API_URL]);

  useEffect(() => {
    const fetchExistingDraft = async () => {
      if (!editActivityId) return;

      try {
        const res = await fetch(`${API_URL}/api/form/${editActivityId}`);
        const response = await res.json();

        if (!res.ok) {
          const detail = Array.isArray(response.detail) ? response.detail.join('\n') : response.detail;
          notifyError(detail || response.error || 'โหลดแบบร่างไม่สำเร็จ');
          return;
        }

        const data = response.data as ApiFormResponse;
        const draftPayload = parseDraftPayload(data.consentless_data);
        const draftSub = draftPayload?.subs?.[0];

        setEditingActivityId(data.activity_id);
        setDepartment(draftPayload?.department || data.activity_subject || '');
        setRec(draftPayload?.rec || {
          name: draftPayload?.companyName || data.source?.name || '',
          address: draftPayload?.recorderAddress || '',
          email: draftPayload?.recorderEmail || '',
          phone: draftPayload?.recorderPhone || '',
        });
        setOwnerName(draftPayload?.ownerName || draftPayload?.dataOwner || '');
        setMainActivity(draftPayload?.mainActivity || draftPayload?.activityName || data.activity_name || '');
        setSubs(draftPayload?.subs?.length ? draftPayload.subs : [{
          ...newSub(0),
          purpose: draftSub?.purpose || draftPayload?.purpose || data.purpose || '',
          legalBasis: draftSub?.legalBasis || draftPayload?.legalBasis || splitCsv(data.legal_basis?.name),
          personalDataItems: draftSub?.personalDataItems || draftPayload?.personalDataItems || splitCsv(data.policy?.data_type),
          collectionMethod: draftSub?.collectionMethod || draftPayload?.collectionMethod || splitCsv(data.obtaining_data?.name),
          retentionPeriod: draftSub?.retentionPeriod || draftPayload?.retentionPeriod || data.policy?.retention_period || '',
          deletionMethod: draftSub?.deletionMethod || data.policy?.deletion_method || '',
        }]);
        setSecOrg(draftPayload?.secOrg || data.security_measurement?.organizational_measures || '');
        setSecTech(draftPayload?.secTech || data.security_measurement?.technical_measures || '');
        setSecPhysical(draftPayload?.secPhysical || data.security_measurement?.physical_measures || '');
        setSecAccess(draftPayload?.secAccess || data.security_measurement?.access_control || '');
        setSecResponsibility(draftPayload?.secResponsibility || data.security_measurement?.define_responsibility || '');
        setSecAudit(draftPayload?.secAudit || data.security_measurement?.audit_trail || '');
      } catch (error) {
        console.error(error);
        notifyError('โหลดแบบร่างไม่สำเร็จ');
      }
    };

    fetchExistingDraft();
  }, [API_URL, editActivityId]);

  const selectedDepartment = departments.find((d) => d.department_id === department)?.department_name || department || '—';

  const buildPayload = (extra?: Record<string, unknown>) => {
    const sub = subs[0] || newSub(0);
    const companyName = rec.name;
    const activityName = mainActivity;
    const purpose = sub.purpose;
    const retentionPeriod = sub.retentionPeriod;

    return {
      userId: user?.id,
      formType,
      departmentId: department,

      // Names expected by the backend used in the second form
      companyName,
      department,
      activityName,
      dataOwner: ownerName,
      recorderEmail: rec.email,
      recorderAddress: rec.address,
      recorderPhone: rec.phone,
      recordDate: new Date().toISOString().slice(0, 10),
      dpcName: '',
      purpose,
      legalBasis: sub.legalBasis,
      legalBasisNote: '',
      dataSubjects: sub.dataCategory,
      personalDataTypes: sub.personalDataItems,
      sensitiveData: sub.dataType.includes('ข้อมูลอ่อนไหว') ? sub.personalDataItems : [],
      collectionMethods: sub.collectionMethod,
      otherDataNote: sub.sourceFromOther,
      retentionValue: retentionPeriod,
      retentionUnit: 'รวม',
      retentionCriteria: '',
      deletionMethods: sub.deletionMethod ? [sub.deletionMethod] : [],
      retentionNote: '',
      retentionPeriod,
      secOrg,
      secTech,
      secPhysical,
      secAccess,
      secResponsibility,
      secAudit,

      // Full payload from the first form kept for draft/edit restoration
      rec,
      ownerName,
      mainActivity,
      subs,
      ...extra,
    };
  };

  const canNext = () => {
    if (step === 1) {
      return rec.name.trim() && department.trim() && rec.email.trim() && rec.phone.trim() && rec.address.trim();
    }

    if (step === 2) {
      return (
        mainActivity.trim() &&
        ownerName.trim() &&
        subs.every(s =>
          s.purpose.trim() &&
          s.personalDataItems.length > 0 &&
          s.dataCategory.length > 0 &&
          s.dataType.length > 0 &&
          s.collectionMethod.length > 0 &&
          s.sourceFromOwner.trim() &&
          (s.sourceFromOwner !== 'จากแหล่งอื่น' || s.sourceFromOther.trim()) &&
          s.legalBasis.length > 0 &&
          s.minorConsentUnder10.trim() &&
          s.minorConsentAge10to20.trim() &&
          s.transferAbroad.trim() &&
          (s.transferAbroad !== 'มี' || (
            s.transferCountry.trim() &&
            s.transferMethod.trim() &&
            s.transferAffiliate.trim() &&
            (s.transferAffiliate !== 'ใช่' || s.transferAffiliateCompany.trim()) &&
            s.transferStandard.trim() &&
            s.transferException28.trim()
          )) &&
          s.storageType.length > 0 &&
          s.storageMethod.trim() &&
          s.retentionPeriod.trim() &&
          s.accessRights.trim() &&
          s.deletionMethod.trim() &&
          s.exemptDisclosure.trim() &&
          s.rightsDenial.trim()
        )
      );
    }

    if (step === 3) {
      return (
        secOrg.trim() &&
        secTech.trim() &&
        secPhysical.trim() &&
        secAccess.trim() &&
        secResponsibility.trim() &&
        secAudit.trim()
      );
    }

    return true;
  };

  const handleSaveDraft = async () => {
    try {
      if (!user?.id) {
        notifyError('กรุณาเข้าสู่ระบบใหม่ก่อนบันทึกแบบร่าง');
        return;
      }

      const endpoint = editingActivityId ? `${API_URL}/api/form/${editingActivityId}` : `${API_URL}/api/form`;
      const method = editingActivityId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload({
          approval_status: 'draft',
          save_as_draft: true,
        })),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = Array.isArray(data.detail) ? data.detail.join('\n') : data.detail;
        notifyError(detail || data.error || 'บันทึกแบบร่างไม่สำเร็จ');
        return;
      }

      onSaveDraft?.({ ...buildPayload(), activity_id: data.activity_id || editingActivityId } as unknown as Record<string, unknown>);

      if (data.activity_id) {
        setEditingActivityId(data.activity_id);
      }

      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
      router.push('/dc/my-ropa?notice=draft-saved&form=dc');
    } catch (err) {
      notifyError((err as Error).message);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        notifyError('กรุณาเข้าสู่ระบบใหม่ก่อนส่งฟอร์ม');
        return;
      }

      const endpoint = editingActivityId ? `${API_URL}/api/form/${editingActivityId}` : `${API_URL}/api/form/submit`;
      const method = editingActivityId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });

      const data = await res.json();
      if (!res.ok) {
        console.log('CREATE FORM ERROR:', data);
        const detail = Array.isArray(data.detail) ? data.detail.join('\n') : data.detail;
        notifyError(detail || data.error || 'Create form failed');
        return;
      }

      onSubmit?.(buildPayload() as unknown as Record<string, unknown>);
      setSubmitted(true);
    } catch (err) {
      notifyError((err as Error).message);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSubmitted(false);
    setDepartment('');
    setRec(EMPTY_RECORDER);
    setOwnerName('');
    setMainActivity('');
    setSubs([newSub(0)]);
    setSecOrg('');
    setSecTech('');
    setSecPhysical('');
    setSecAccess('');
    setSecResponsibility('');
    setSecAudit('');
    setEditingActivityId(undefined);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">ส่งข้อมูลเรียบร้อยแล้ว</h3>
        <p className="text-sm text-slate-500 mb-3">กิจกรรมการประมวลผลถูกส่งเพื่อรอการตรวจสอบจาก DPO</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-700 font-medium mb-6">
          Data Controller · {mainActivity}
        </div>
        <br />
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => router.push('/dc/my-ropa')}
            className="px-6 py-2.5 bg-white border border-blue-200 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            ไปหน้า My Activity
          </button>
          <button onClick={resetForm} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            สร้างกิจกรรมใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 px-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-4 h-px bg-slate-200 z-0" />
          <div
            className="absolute left-0 top-4 h-px bg-blue-500 z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map(s => (
            <div key={s.id} className="flex flex-col items-center gap-1.5 z-10">
              <button
                onClick={() => s.id < step && setStep(s.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200 ${s.id < step ? 'bg-blue-600 border-blue-600 text-white cursor-pointer' : s.id === step ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-white border-slate-200 text-slate-400 cursor-default'}`}
              >
                {s.id < step ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg> : s.id}
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
          <span className="flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
            Data Controller Form
          </span>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <SectionHeader step={1} title="ส่วนที่ 1: รายละเอียดของผู้ลงบันทึก ROPA" sub="ข้อมูลผู้รับผิดชอบการบันทึกกิจกรรมนี้" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="ชื่อ-นามสกุล / ชื่อองค์กร" required>
              <input type="text" value={rec.name} onChange={e => setRec(r => ({ ...r, name: e.target.value }))} className={inp} />
            </Field>
            <Field label="แผนก / ฝ่ายที่รับผิดชอบ" required>
              <select value={department} onChange={e => setDepartment(e.target.value)} className={sel}>
                <option value="">เลือกแผนก</option>
                {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
              </select>
            </Field>
            <Field label="เบอร์โทรศัพท์" required>
              <input type="tel" value={rec.phone} onChange={e => setRec(r => ({ ...r, phone: e.target.value }))} className={inp} />
            </Field>
            <Field label="อีเมล" required>
              <input type="email" value={rec.email} onChange={e => setRec(r => ({ ...r, email: e.target.value }))} className={inp} />
            </Field>
          </div>
          <Field label="ที่อยู่" required>
            <textarea rows={2} value={rec.address} onChange={e => setRec(r => ({ ...r, address: e.target.value }))} className={txa} />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <SectionHeader step={2} title="ส่วนที่ 2: ตารางข้อมูลกิจกรรมการประมวลผล" sub="ระบุกิจกรรมหลักและวัตถุประสงค์" />

            <Field label="ชื่อเจ้าของข้อมูลส่วนบุคคล" required>
              <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} className={inp} />
            </Field>

            <Field label="กิจกรรมการประมวลผลหลัก" required>
              <input type="text" value={mainActivity} onChange={e => setMainActivity(e.target.value)} className={inp} />
            </Field>
          </div>

          {subs.map((s, i) => (
            <SubCard
              key={s.id}
              sub={s}
              idx={i}
              onChange={updated => setSubs(prev => prev.map((x, xi) => xi === i ? updated : x))}
              onRemove={() => setSubs(prev => prev.filter((_, xi) => xi !== i))}
              canRemove={false}
            />
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <SectionHeader step={3} title="ส่วนที่ 3: คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="มาตรการเชิงองค์กร (Organizational)" required>
              <textarea rows={4} value={secOrg} onChange={e => setSecOrg(e.target.value)} className={txa} />
            </Field>
            <Field label="มาตรการเชิงเทคนิค (Technical)" required>
              <textarea rows={4} value={secTech} onChange={e => setSecTech(e.target.value)} className={txa} />
            </Field>
            <Field label="มาตรการทางกายภาพ (Physical)" required>
              <textarea rows={4} value={secPhysical} onChange={e => setSecPhysical(e.target.value)} className={txa} />
            </Field>
            <Field label="การควบคุมการเข้าถึงข้อมูล (Access Control)" required>
              <textarea rows={4} value={secAccess} onChange={e => setSecAccess(e.target.value)} className={txa} />
            </Field>
            <Field label="การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน" required>
              <textarea rows={4} value={secResponsibility} onChange={e => setSecResponsibility(e.target.value)} className={txa} />
            </Field>
            <Field label="มาตรการตรวจสอบย้อนหลัง (Audit Trail)" required>
              <textarea rows={4} value={secAudit} onChange={e => setSecAudit(e.target.value)} className={txa} />
            </Field>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">สรุปข้อมูลก่อนส่ง</p>
            <p className="text-xs text-slate-400 mt-0.5">กรุณาตรวจสอบความถูกต้องก่อนส่ง DPO เพื่อรออนุมัติ</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">ผู้ลงบันทึก</p>
                <p className="text-sm font-semibold text-slate-800">{rec.name || '—'}</p>
                <p className="text-xs text-slate-500">{rec.email || '—'} · {rec.phone || '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">แผนก</p>
                <p className="text-sm font-semibold text-slate-800">{selectedDepartment}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-500 mb-1 font-medium">กิจกรรมการประมวลผลหลัก</p>
              <p className="text-base font-bold text-blue-800">{mainActivity || '—'}</p>
              <p className="text-xs text-blue-600 mt-1">เจ้าของข้อมูล: {ownerName || '—'}</p>
            </div>

            {subs.map((s, i) => (
              <div key={s.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <p className="text-sm font-bold text-slate-800">วัตถุประสงค์</p>
                <p className="text-sm text-slate-700">{s.purpose || '—'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <p><span className="font-semibold">ข้อมูลที่จัดเก็บ:</span> {joinList(s.personalDataItems) || '—'}</p>
                  <p><span className="font-semibold">หมวดหมู่:</span> {joinList(s.dataCategory) || '—'}</p>
                  <p><span className="font-semibold">ประเภท:</span> {joinList(s.dataType) || '—'}</p>
                  <p><span className="font-semibold">วิธีได้มา:</span> {joinList(s.collectionMethod) || '—'}</p>
                  <p><span className="font-semibold">ฐานประมวลผล:</span> {joinList(s.legalBasis) || '—'}</p>
                  <p><span className="font-semibold">ระยะเวลาเก็บ:</span> {s.retentionPeriod || '—'}</p>
                </div>
              </div>
            ))}

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold flex items-center gap-1 mb-0.5"><Info className="w-4 h-4" /> หมายเหตุ</span>
              เมื่อส่งแล้ว สถานะจะเปลี่ยนเป็น &ldquo;รอการตรวจสอบ&rdquo; และ DPO จะต้องตรวจสอบและอนุมัติก่อนจึงจะมีสถานะ Active
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          {draftSaved ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg><span className="text-emerald-600">บันทึกแบบร่างแล้ว</span></>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>บันทึกแบบร่าง</>
          )}
        </button>

        <div className="flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              ย้อนกลับ
            </button>
          )}

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={() => canNext() && setStep(s => s + 1)}
              disabled={!canNext()}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ถัดไป
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              ยืนยันและส่ง
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
