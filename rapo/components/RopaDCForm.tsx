'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 – ข้อมูลองค์กร
  companyName: string;
  department: string;
  activityName: string;
  dataOwner: string;
  recorderEmail: string;
  recordDate: string;
  dpcName: string;
  // Step 2 – วัตถุประสงค์และฐานทางกฎหมาย
  purpose: string;
  legalBasis: string[];
  legalBasisNote: string;
  // Step 3 – ประเภทข้อมูลและเจ้าของข้อมูล
  dataSubjects: string[];
  personalDataTypes: string[];
  sensitiveData: string[];
  collectionMethods: string[];
  otherDataNote: string;
  // Step 4 – ระยะเวลาเก็บรักษา
  retentionValue: string;
  retentionUnit: string;
  retentionCriteria: string;
  deletionMethods: string[];
  retentionNote: string;
  // Step 5 – มาตรการรักษาความปลอดภัย
  secOrg: string;
  secTech: string;
  secPhysical: string;
  secAccess: string;
}

const INIT: FormData = {
  companyName: '', department: '', activityName: '', dataOwner: '',
  recorderEmail: '', recordDate: '', dpcName: '',
  purpose: '', legalBasis: [], legalBasisNote: '',
  dataSubjects: [], personalDataTypes: [], sensitiveData: [],
  collectionMethods: [], otherDataNote: '',
  retentionValue: '', retentionUnit: 'ปี', retentionCriteria: '',
  deletionMethods: [], retentionNote: '',
  secOrg: '', secTech: '', secPhysical: '', secAccess: '',
};

// ─── Constants ──────────────────────────────────────────────────────────────

const LEGAL_BASES = [
  'ความยินยอม (Consent)',
  'การปฏิบัติตามสัญญา (Contract)',
  'ประโยชน์โดยชอบด้วยกฎหมาย (Legitimate Interest)',
  'การปฏิบัติหน้าที่ตามกฎหมาย (Legal Obligation)',
  'ภารกิจสาธารณะ (Public Task)',
  'ประโยชน์สำคัญต่อชีวิต (Vital Interest)',
];
const DATA_SUBJECTS = ['พนักงาน / ลูกจ้าง', 'ผู้สมัครงาน', 'ลูกค้า / ผู้ใช้บริการ', 'คู่ค้า / ผู้จัดจำหน่าย', 'อื่นๆ'];
const PERSONAL_DATA_TYPES = [
  'ข้อมูลระบุตัวตน (ชื่อ, อีเมล, เบอร์โทร)',
  'ข้อมูลทางการเงิน (เงินเดือน, บัญชีธนาคาร)',
  'ข้อมูลสุขภาพ',
  'ข้อมูลชีวภาพ (ลายนิ้วมือ, ใบหน้า)',
  'ข้อมูลพฤติกรรม / การใช้งาน',
  'ข้อมูลอ่อนไหวอื่นๆ (ศาสนา, เชื้อชาติ)',
];
const COLLECTION_METHODS = ['แบบฟอร์มออนไลน์', 'เอกสารกระดาษ', 'ระบบ HR / CRM', 'บุคคลที่สาม / API'];
const DELETION_METHODS = [
  'ลบจากระบบดิจิทัล (Secure Delete)',
  'ทำลายเอกสาร (Shredding)',
  'ทำให้ไม่สามารถระบุตัวตนได้ (Anonymization)',
  'โอนย้ายไปเก็บถาวร (Archiving)',
];
const RETENTION_CRITERIA = ['กฎหมายกำหนด', 'นโยบายองค์กร', 'วัตถุประสงค์สิ้นสุด', 'อื่นๆ'];
const STEPS = [
  { id: 1, label: 'ข้อมูลองค์กร', sub: 'ผู้บันทึกและเจ้าของกิจกรรม' },
  { id: 2, label: 'วัตถุประสงค์', sub: 'และฐานทางกฎหมาย' },
  { id: 3, label: 'ประเภทข้อมูล', sub: 'และเจ้าของข้อมูล' },
  { id: 4, label: 'ระยะเวลาเก็บ', sub: 'และการทำลายข้อมูล' },
  { id: 5, label: 'มาตรการ', sub: 'รักษาความปลอดภัย' },
  { id: 6, label: 'สรุปและส่ง', sub: 'ตรวจสอบก่อนยืนยัน' },
];

// ─── Shared styled helpers ───────────────────────────────────────────────────
const card = 'bg-white border border-gray-200 rounded-2xl';
const inp = 'w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-black text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500';
const txa = `${inp} resize-none`;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1 text-sm font-medium text-white/80">
        {label}{required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function CheckGrid({ options, selected, onChange, cols = 2 }: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void; cols?: number;
}) {
  const toggle = (o: string) =>
    onChange(selected.includes(o) ? selected.filter(s => s !== o) : [...selected, o]);
  return (
    <div className={`grid gap-2 grid-cols-1 sm:grid-cols-${cols}`}>
      {options.map(o => {
        const on = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm text-left transition-all ${on ? 'bg-blue-500/20 border-blue-400/60 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'}`}>
            <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${on ? 'bg-blue-500 border-blue-500' : 'border-white/30'}`}>
              {on && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map(o => {
        const on = value === o;
        return (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${on ? 'bg-blue-500/20 border-blue-400/60 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
            <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${on ? 'border-blue-400' : 'border-white/30'}`}>
              {on && <span className="w-2 h-2 rounded-full bg-blue-400 block" />}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function CardHeader({ step, title, sub }: { step: number; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-4 pb-5 mb-5 border-b border-white/10">
      <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-base font-bold text-blue-300 flex-shrink-0">
        {step}
      </div>
      <div>
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="text-xs text-white/40">{sub}</p>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

interface RopaFormProps {
  onSubmit?: (data: Record<string, unknown>) => void;
  onSaveDraft?: (data: Record<string, unknown>) => void;
}

export default function RopaDCForm({ onSubmit, onSaveDraft }: RopaFormProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INIT);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const { user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 1) return form.companyName.trim() && form.activityName.trim() && form.recorderEmail.trim();
    if (step === 2) return form.purpose.trim() && form.legalBasis.length > 0;
    if (step === 3) return form.dataSubjects.length > 0 && form.personalDataTypes.length > 0;
    return true;
  };

  const handleSaveDraft = () => {
    onSaveDraft?.(form as unknown as Record<string, unknown>);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/api/form/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, formType: 'controller', ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="bg-[#1e2130] rounded-2xl border border-white/10 p-12 text-center">
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">ส่งข้อมูลเรียบร้อยแล้ว</h3>
        <p className="text-sm text-white/50 mb-6">กิจกรรมถูกส่งเพื่อรอการตรวจสอบจาก DPO</p>
        <button onClick={() => { setStep(1); setSubmitted(false); setForm(INIT); }}
          className="px-6 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors">
          สร้างกิจกรรมใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Progress bar ──────────────────────────────────────────────────── */}
      <div className="bg-[#1e2130] rounded-2xl border border-white/10 px-6 py-5">
        <div className="flex items-start gap-1 relative">
          {/* connecting line */}
          <div className="absolute top-4 left-4 right-4 h-px bg-white/10 z-0" />
          <div className="absolute top-4 left-4 h-px bg-blue-500 z-0 transition-all duration-500"
            style={{ width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - 2rem)` }} />
          {STEPS.map(s => {
            const done = s.id < step;
            const active = s.id === step;
            return (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-2 z-10">
                <button
                  onClick={() => done && setStep(s.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? 'bg-blue-500 border-blue-500 text-white cursor-pointer' : active ? 'bg-[#1e2130] border-blue-400 text-blue-400' : 'bg-[#1e2130] border-white/20 text-white/30 cursor-default'}`}>
                  {done ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg> : s.id}
                </button>
                <span className={`text-[10px] font-medium text-center leading-tight hidden md:block ${active ? 'text-blue-400' : done ? 'text-white/50' : 'text-white/25'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold text-white">{STEPS[step - 1].label}</p>
          <p className="text-xs text-white/40">{STEPS[step - 1].sub} · ส่วนที่ {step}/{STEPS.length}</p>
        </div>
      </div>

      {/* ── Step 1: ข้อมูลองค์กร ──────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-[#1e2130] rounded-2xl border border-white/10 p-6 space-y-5">
          <CardHeader step={1} title="ข้อมูลองค์กร / เจ้าของกิจกรรม" sub="ผู้รับผิดชอบและรายละเอียดกิจกรรม" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ชื่อบริษัท / องค์กร" required>
              <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="ABC co." className={inp} />
            </Field>
            <Field label="แผนก / ฝ่ายที่รับผิดชอบ">
              <input type="text" value={form.department} onChange={e => set('department', e.target.value)} placeholder="ฝ่ายบุคคล" className={inp} />
            </Field>
          </div>
          <Field label="ลักษณะกิจกรรมการประมวลผล" required>
            <input type="text" value={form.activityName} onChange={e => set('activityName', e.target.value)} placeholder="การบันทึกข้อมูลเพื่อการสมัครงานและออกจากงาน" className={inp} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ผู้รับผิดชอบ (DATA OWNER)">
              <input type="text" value={form.dataOwner} onChange={e => set('dataOwner', e.target.value)} placeholder="ชายสาทำไดั" className={inp} />
            </Field>
            <Field label="อีเมลผู้ลงบันทึก" required>
              <input type="email" value={form.recorderEmail} onChange={e => set('recorderEmail', e.target.value)} placeholder="tumdee.daidee@gmail.com" className={inp} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="วันที่/เดือน/ปีที่บันทึก">
              <input type="date" value={form.recordDate} onChange={e => set('recordDate', e.target.value)}
                className={`${inp} [color-scheme:dark]`} />
            </Field>
            <Field label="เจ้าหน้าที่คุ้มครองข้อมูล (DPC)">
              <input type="text" value={form.dpcName} onChange={e => set('dpcName', e.target.value)} placeholder="ABC co." className={inp} />
            </Field>
          </div>
        </div>
      )}

      {/* ── Step 2: วัตถุประสงค์และฐานทางกฎหมาย ─────────────────────────── */}
      {step === 2 && (
        <div className="bg-[#1e2130] rounded-2xl border border-white/10 p-6 space-y-5">
          <CardHeader step={2} title="วัตถุประสงค์การประมวลผล" sub="ระบุวัตถุประสงค์และฐานทางกฎหมายที่ใช้" />
          <Field label="วัตถุประสงค์ของการประมวลผล" required>
            <textarea rows={4} value={form.purpose} onChange={e => set('purpose', e.target.value)}
              placeholder="เก็บรวบรวมข้อมูลเพื่อใช้ในการบริหารทรัพยากรบุคคล..." className={txa} />
          </Field>
          <Field label="ฐานทางกฎหมาย (LEGAL BASIS)" required>
            <CheckGrid options={LEGAL_BASES} selected={form.legalBasis} onChange={v => set('legalBasis', v)} cols={2} />
          </Field>
          <Field label="หมายเหตุเพิ่มเติม">
            <textarea rows={2} value={form.legalBasisNote} onChange={e => set('legalBasisNote', e.target.value)}
              placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" className={txa} />
          </Field>
        </div>
      )}

      {/* ── Step 3: ประเภทข้อมูลและเจ้าของข้อมูล ────────────────────────── */}
      {step === 3 && (
        <div className="bg-[#1e2130] rounded-2xl border border-white/10 p-6 space-y-5">
          <CardHeader step={3} title="ประเภทข้อมูลและเจ้าของข้อมูล" sub="ประเภทผู้เป็นเจ้าของข้อมูลและกลุ่มข้อมูลที่ประมวลผล" />
          <Field label="กลุ่มเจ้าของข้อมูล (DATA SUBJECT)" required>
            <CheckGrid options={DATA_SUBJECTS} selected={form.dataSubjects} onChange={v => set('dataSubjects', v)} cols={2} />
          </Field>
          <Field label="ประเภทข้อมูลส่วนบุคคลที่เก็บ" required>
            <CheckGrid options={PERSONAL_DATA_TYPES} selected={form.personalDataTypes} onChange={v => set('personalDataTypes', v)} cols={2} />
          </Field>
          <Field label="ระบุข้อมูลเพิ่มเติม">
            <input type="text" value={form.otherDataNote} onChange={e => set('otherDataNote', e.target.value)}
              placeholder="พิมพ์แล้วกด Enter เพื่อเพิ่ม..." className={inp} />
            <p className="text-xs text-white/30 mt-1">เช่น หมายเลขสัญชาติ, ที่อยู่, ประวัติการศึกษา</p>
          </Field>
          <Field label="วิธีการเก็บรวบรวมข้อมูล">
            <CheckGrid options={COLLECTION_METHODS} selected={form.collectionMethods} onChange={v => set('collectionMethods', v)} cols={2} />
          </Field>
        </div>
      )}

      {/* ── Step 4: ระยะเวลาเก็บรักษาข้อมูล ────────────────────────────── */}
      {step === 4 && (
        <div className="bg-[#1e2130] rounded-2xl border border-white/10 p-6 space-y-5">
          <CardHeader step={4} title="ระยะเวลาเก็บรักษาข้อมูล" sub="กำหนดระยะเวลาและนโยบายการลบหรือทำลายข้อมูล" />
          <Field label="ระยะเวลาเก็บรักษา" required>
            <div className="flex gap-3">
              <input type="number" min="1" value={form.retentionValue} onChange={e => set('retentionValue', e.target.value)}
                placeholder="2" className={`${inp} w-28`} />
              <select value={form.retentionUnit} onChange={e => set('retentionUnit', e.target.value)}
                className={`${inp} flex-1 cursor-pointer [color-scheme:dark]`}>
                <option>วัน</option><option>เดือน</option><option>ปี</option>
              </select>
            </div>
          </Field>
          <Field label="เกณฑ์การกำหนดระยะเวลา" required>
            <RadioGroup options={RETENTION_CRITERIA} value={form.retentionCriteria} onChange={v => set('retentionCriteria', v)} />
          </Field>
          <Field label="วิธีการทำลายข้อมูลเมื่อครบกำหนด">
            <CheckGrid options={DELETION_METHODS} selected={form.deletionMethods} onChange={v => set('deletionMethods', v)} cols={2} />
          </Field>
          <Field label="หมายเหตุเพิ่มเติม">
            <textarea rows={2} value={form.retentionNote} onChange={e => set('retentionNote', e.target.value)}
              placeholder="เช่น เอกสารที่เกี่ยวข้องควรจะเก็บไว้ไม่กี่วันก่อนที่จะลบ..." className={txa} />
          </Field>
        </div>
      )}

      {/* ── Step 5: มาตรการรักษาความปลอดภัย ────────────────────────────── */}
      {step === 5 && (
        <div className="bg-[#1e2130] rounded-2xl border border-white/10 p-6 space-y-5">
          <CardHeader step={5} title="มาตรการรักษาความปลอดภัย" sub="คำอธิบายมาตรการที่ใช้ปกป้องข้อมูล" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="มาตรการเชิงองค์กร (Organizational)">
              <textarea rows={4} value={form.secOrg} onChange={e => set('secOrg', e.target.value)}
                placeholder="นโยบาย, การอบรม, PDPA committee..." className={txa} />
            </Field>
            <Field label="มาตรการเชิงเทคนิค (Technical)">
              <textarea rows={4} value={form.secTech} onChange={e => set('secTech', e.target.value)}
                placeholder="Encryption, Firewall, 2FA..." className={txa} />
            </Field>
            <Field label="มาตรการทางกายภาพ (Physical)">
              <textarea rows={4} value={form.secPhysical} onChange={e => set('secPhysical', e.target.value)}
                placeholder="ระบบล็อค, CCTV, บัตรผ่าน..." className={txa} />
            </Field>
            <Field label="การควบคุมการเข้าถึงข้อมูล (Access Control)">
              <textarea rows={4} value={form.secAccess} onChange={e => set('secAccess', e.target.value)}
                placeholder="Role-based access, Audit log..." className={txa} />
            </Field>
          </div>
        </div>
      )}

      {/* ── Step 6: สรุปและส่ง ───────────────────────────────────────────── */}
      {step === 6 && (
        <div className="bg-[#1e2130] rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-sm font-semibold text-white">สรุปข้อมูลก่อนส่ง</p>
            <p className="text-xs text-white/40 mt-0.5">กรุณาตรวจสอบความถูกต้องก่อนส่งเพื่อรออนุมัติจาก DPO</p>
          </div>
          <div className="p-6 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/40 mb-1">บริษัท / องค์กร</p>
                <p className="text-sm font-semibold text-white">{form.companyName || '—'}</p>
                <p className="text-xs text-white/40 mt-0.5">{form.department || '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/40 mb-1">ผู้บันทึก</p>
                <p className="text-sm font-semibold text-white">{form.recorderEmail || '—'}</p>
                <p className="text-xs text-white/40 mt-0.5">{form.recordDate || '—'}</p>
              </div>
            </div>
            {/* Activity */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20">
              <p className="text-xs text-blue-400 mb-1 font-medium">กิจกรรมการประมวลผล</p>
              <p className="text-base font-bold text-white">{form.activityName || '—'}</p>
            </div>
            {/* Purpose + legal basis */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-xs text-white/40 font-medium">วัตถุประสงค์</p>
              <p className="text-sm text-white/80">{form.purpose || '—'}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.legalBasis.map(l => (
                  <span key={l} className="text-xs px-2.5 py-1 bg-blue-500/15 border border-blue-400/25 rounded-full text-blue-300">{l}</span>
                ))}
              </div>
            </div>
            {/* Data subjects */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/40 mb-2 font-medium">กลุ่มเจ้าของข้อมูล</p>
              <div className="flex flex-wrap gap-1.5">
                {form.dataSubjects.map(s => (
                  <span key={s} className="text-xs px-2.5 py-1 bg-white/10 rounded-full text-white/70">{s}</span>
                ))}
              </div>
            </div>
            {/* Retention */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/40 mb-1 font-medium">ระยะเวลาเก็บรักษา</p>
              <p className="text-sm font-semibold text-white">
                {form.retentionValue ? `${form.retentionValue} ${form.retentionUnit}` : '—'}
                {form.retentionCriteria && <span className="text-white/40 font-normal ml-2">· {form.retentionCriteria}</span>}
              </p>
            </div>
            {/* Warning */}
            <div className="p-4 bg-amber-500/10 border border-amber-400/20 rounded-xl text-xs text-amber-300 leading-relaxed">
              <span className="font-semibold block mb-1">⚠ หมายเหตุ</span>
              เมื่อส่งแล้ว สถานะจะเปลี่ยนเป็น &ldquo;รอการตรวจสอบ&rdquo; และ DPO จะต้องตรวจสอบและอนุมัติก่อนจึงจะมีสถานะ Active
            </div>
          </div>
        </div>
      )}

      {/* ── Footer navigation ────────────────────────────────────────────── */}
      <div className="bg-[#1e2130] rounded-2xl border border-white/10 px-5 py-4 flex items-center justify-between gap-3">
        <button type="button" onClick={handleSaveDraft}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/50 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
          {draftSaved
            ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg><span className="text-emerald-400">บันทึกร่างแล้ว</span></>
            : 'บันทึกร่าง'}
        </button>
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 text-sm font-medium text-white/60 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
              ← ย้อนกลับ
            </button>
          )}
          {step < 6 ? (
            <button type="button" onClick={() => canNext() && setStep(s => s + 1)}
              disabled={!canNext()}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              ถัดไป →
            </button>
          ) : (
            <div className="flex gap-2">
              <button type="button" onClick={handleSaveDraft}
                className="px-4 py-2 text-sm font-medium text-white/60 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                บันทึกร่าง
              </button>
              <button type="button" onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                ยืนยันและบันทึก
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
