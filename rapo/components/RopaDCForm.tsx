'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Info } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormData {
  companyName: string;
  department: string;
  activityName: string;
  dataOwner: string;
  recorderEmail: string;
  recordDate: string;
  dpcName: string;
  purpose: string;
  legalBasis: string[];
  legalBasisNote: string;
  dataSubjects: string[];
  personalDataTypes: string[];
  sensitiveData: string[];
  collectionMethods: string[];
  otherDataNote: string;
  retentionValue: string;
  retentionUnit: string;
  retentionCriteria: string;
  deletionMethods: string[];
  retentionNote: string;
  secOrg: string;
  secTech: string;
  secPhysical: string;
  secAccess: string;
  secResponsibility: string;
  secAudit: string;
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

const INIT: FormData = {
  companyName: '', department: '', activityName: '', dataOwner: '',
  recorderEmail: '', recordDate: '', dpcName: '',
  purpose: '', legalBasis: [], legalBasisNote: '',
  dataSubjects: [], personalDataTypes: [], sensitiveData: [],
  collectionMethods: [], otherDataNote: '',
  retentionValue: '', retentionUnit: 'ปี', retentionCriteria: '',
  deletionMethods: [], retentionNote: '',
  secOrg: '', secTech: '', secPhysical: '', secAccess: '', secResponsibility: '', secAudit: '',
};

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
  { id: 1, label: 'ข้อมูลองค์กร' },
  { id: 2, label: 'วัตถุประสงค์' },
  { id: 3, label: 'ประเภทข้อมูล' },
  { id: 4, label: 'ระยะเวลาเก็บ' },
  { id: 5, label: 'มาตรการ' },
  { id: 6, label: 'สรุปและส่ง' },
];

const inp = 'w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
const txa = `${inp} resize-none`;

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-0.5">
      {text}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Field({ label, required, children, className }: {
  label: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <Label text={label} required={required} />
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
    <div className={`grid gap-1.5 ${cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
      {options.map(o => {
        const on = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm text-left transition-all ${on
              ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}>
            <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${on ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
              {on && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
            </span>
            <span>{o}</span>
          </button>
        );
      })}
    </div>
  );
}

function RadioGroup({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => {
        const on = value === o;
        return (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${on
              ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
            <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${on ? 'border-blue-500' : 'border-gray-300'}`}>
              {on && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block" />}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function SectionHeader({ step, title, sub }: { step: number; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 pb-4 mb-1 border-b border-gray-100">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
        {step}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

interface RopaFormProps {
  editActivityId?: string;
  onSubmit?: (data: Record<string, unknown>) => void;
  onSaveDraft?: (data: Record<string, unknown>) => void;
}

const splitCsv = (value?: string | null) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseRetention = (value?: string | null) => {
  const [retentionValue = '', retentionUnit = 'ปี', retentionCriteria = ''] = String(value || '')
    .split(' - ')
    .map((item) => item.trim());

  return { retentionValue, retentionUnit, retentionCriteria };
};

const parseDraftPayload = (value?: string | null) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export default function RopaDCForm({ editActivityId, onSubmit, onSaveDraft }: RopaFormProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INIT);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [editingActivityId, setEditingActivityId] = useState<string | undefined>(editActivityId);
  const { user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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
          const detail = Array.isArray(response.detail)
            ? response.detail.join('\n')
            : response.detail;
          alert(detail || response.error || 'โหลดแบบร่างไม่สำเร็จ');
          return;
        }

        const data = response.data as ApiFormResponse;
        const draftPayload = parseDraftPayload(data.consentless_data);
        const retention = parseRetention(draftPayload?.retentionPeriod || data.policy?.retention_period);

        setEditingActivityId(data.activity_id);
        setForm({
          companyName: draftPayload?.companyName || data.source?.name || '',
          department: draftPayload?.department || data.activity_subject || '',
          activityName: draftPayload?.activityName || data.activity_name || '',
          dataOwner: draftPayload?.dataOwner || '',
          recorderEmail: draftPayload?.recorderEmail || '',
          recordDate: draftPayload?.recordDate || '',
          dpcName: draftPayload?.dpcName || '',
          purpose: draftPayload?.purpose || data.purpose || '',
          legalBasis: draftPayload?.legalBasis || splitCsv(data.legal_basis?.name),
          legalBasisNote: draftPayload?.legalBasisNote || '',
          dataSubjects: draftPayload?.dataSubjects || [],
          personalDataTypes: draftPayload?.personalDataTypes || splitCsv(data.policy?.data_type),
          sensitiveData: draftPayload?.sensitiveData || [],
          collectionMethods: draftPayload?.collectionMethods || [],
          otherDataNote: draftPayload?.otherDataNote || '',
          retentionValue: draftPayload?.retentionValue || retention.retentionValue,
          retentionUnit: draftPayload?.retentionUnit || retention.retentionUnit,
          retentionCriteria: draftPayload?.retentionCriteria || retention.retentionCriteria,
          deletionMethods: draftPayload?.deletionMethods || splitCsv(data.policy?.deletion_method),
          retentionNote: draftPayload?.retentionNote || '',
          secOrg: draftPayload?.secOrg || data.security_measurement?.organizational_measures || '',
          secTech: draftPayload?.secTech || data.security_measurement?.technical_measures || '',
          secPhysical: draftPayload?.secPhysical || data.security_measurement?.physical_measures || '',
          secAccess: draftPayload?.secAccess || data.security_measurement?.access_control || '',
          secResponsibility: draftPayload?.secResponsibility || data.security_measurement?.define_responsibility || '',
          secAudit: draftPayload?.secAudit || data.security_measurement?.audit_trail || '',
        });
      } catch (error) {
        console.error(error);
        alert('โหลดแบบร่างไม่สำเร็จ');
      }
    };

    fetchExistingDraft();
  }, [API_URL, editActivityId]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 1) {
      return form.companyName.trim() && form.department.trim() && form.activityName.trim() && form.recorderEmail.trim();
    }

    if (step === 2) {
      return form.purpose.trim() && form.legalBasis.length > 0;
    }

    if (step === 3) {
      return (
        form.dataSubjects.length > 0 &&
        form.personalDataTypes.length > 0 &&
        form.collectionMethods.length > 0
      );
    }

    if (step === 4) {
      return form.retentionValue.trim() && form.retentionCriteria.trim();
    }

    return true;
  };

  const handleSaveDraft = async () => {
    try {
      if (!user?.id) {
        alert('กรุณาเข้าสู่ระบบใหม่ก่อนบันทึกแบบร่าง');
        return;
      }

      const endpoint = editingActivityId ? `${API_URL}/api/form/${editingActivityId}` : `${API_URL}/api/form`;
      const method = editingActivityId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          formType: 'controller',
          approval_status: 'draft',
          save_as_draft: true,
          departmentId: form.department,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = Array.isArray(data.detail) ? data.detail.join('\n') : data.detail;
        alert(detail || data.error || 'บันทึกแบบร่างไม่สำเร็จ');
        return;
      }

      onSaveDraft?.({
        ...form,
        activity_id: data.activity_id || editingActivityId,
      } as unknown as Record<string, unknown>);

      if (data.activity_id) {
        setEditingActivityId(data.activity_id);
      }

      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const selectedDepartment = departments.find((d) => d.department_id === form.department)?.department_name || form.department || '—';

  const handleSubmit = async () => {
    try {
      const endpoint = editingActivityId ? `${API_URL}/api/form/${editingActivityId}` : `${API_URL}/api/form/submit`;
      const method = editingActivityId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, formType: 'controller', departmentId: form.department, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("CREATE FORM ERROR:", data);

        const detail = Array.isArray(data.detail)
          ? data.detail.join("\n")
          : data.detail;

        alert(detail || data.error || "Create form failed");
        return;
      }
      setSubmitted(true);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-14 h-14 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">ส่งข้อมูลเรียบร้อยแล้ว</h3>
        <p className="text-sm text-gray-500 mb-5">กิจกรรมถูกส่งเพื่อรอการตรวจสอบจาก DPO</p>
        <button onClick={() => { setStep(1); setSubmitted(false); setForm(INIT); }}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          สร้างกิจกรรมใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
        <div className="flex items-start relative">
          <div className="absolute top-4 left-4 right-4 h-px bg-gray-200 z-0" />
          <div className="absolute top-4 left-4 h-px bg-blue-600 z-0 transition-all duration-500"
            style={{ width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - 2rem)` }} />
          {STEPS.map(s => {
            const done = s.id < step;
            const active = s.id === step;
            return (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5 z-10">
                <button
                  onClick={() => done && setStep(s.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done
                    ? 'bg-blue-600 border-blue-600 text-white cursor-pointer hover:bg-blue-700'
                    : active
                      ? 'bg-white border-blue-600 text-blue-600 shadow-sm'
                      : 'bg-white border-gray-300 text-gray-400 cursor-default'
                    }`}>
                  {done
                    ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                    : s.id}
                </button>
                <span className={`text-[10px] font-medium text-center leading-tight hidden sm:block ${active ? 'text-blue-600' : done ? 'text-gray-500' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            ส่วนที่ {step}/{STEPS.length}
          </span>
          <span className="text-xs text-gray-500">{STEPS[step - 1].label}</span>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <SectionHeader step={1} title="ข้อมูลองค์กร / เจ้าของกิจกรรม" sub="ผู้รับผิดชอบและรายละเอียดกิจกรรม" />
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="ชื่อบริษัท / องค์กร" required>
                <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="ABC Co., Ltd." className={inp} />
              </Field>
              <Field label="แผนก / ฝ่ายที่รับผิดชอบ" required>
                <select value={form.department} onChange={e => set('department', e.target.value)} className={inp}>
                  <option value="">เลือกแผนก</option>
                  {departments.map((department) => (
                    <option key={department.department_id} value={department.department_id}>
                      {department.department_name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="ลักษณะกิจกรรมการประมวลผล" required>
              <input type="text" value={form.activityName} onChange={e => set('activityName', e.target.value)} placeholder="การบันทึกข้อมูลเพื่อการสมัครงานและออกจากงาน" className={inp} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="ผู้รับผิดชอบ (DATA OWNER)">
                <input type="text" value={form.dataOwner} onChange={e => set('dataOwner', e.target.value)} placeholder="ชื่อ-สกุล" className={inp} />
              </Field>
              <Field label="อีเมลผู้ลงบันทึก" required>
                <input type="email" value={form.recorderEmail} onChange={e => set('recorderEmail', e.target.value)} placeholder="email@company.com" className={inp} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="วันที่/เดือน/ปีที่บันทึก">
                <input type="date" value={form.recordDate} onChange={e => set('recordDate', e.target.value)} className={inp} />
              </Field>
              <Field label="เจ้าหน้าที่คุ้มครองข้อมูล (DPO)">
                <input type="text" value={form.dpcName} onChange={e => set('dpcName', e.target.value)} placeholder="ชื่อ DPO" className={inp} />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <SectionHeader step={2} title="วัตถุประสงค์การประมวลผล" sub="ระบุวัตถุประสงค์และฐานทางกฎหมายที่ใช้" />
          <div className="space-y-3 mt-3">
            <Field label="วัตถุประสงค์ของการประมวลผล" required>
              <textarea rows={3} value={form.purpose} onChange={e => set('purpose', e.target.value)}
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
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <SectionHeader step={3} title="ประเภทข้อมูลและเจ้าของข้อมูล" sub="ประเภทผู้เป็นเจ้าของข้อมูลและกลุ่มข้อมูลที่ประมวลผล" />
          <div className="space-y-3 mt-3">
            <Field label="กลุ่มเจ้าของข้อมูล (DATA SUBJECT)" required>
              <CheckGrid options={DATA_SUBJECTS} selected={form.dataSubjects} onChange={v => set('dataSubjects', v)} cols={2} />
            </Field>
            <Field label="ประเภทข้อมูลส่วนบุคคลที่เก็บ" required>
              <CheckGrid options={PERSONAL_DATA_TYPES} selected={form.personalDataTypes} onChange={v => set('personalDataTypes', v)} cols={2} />
            </Field>
            <Field label="ระบุข้อมูลเพิ่มเติม">
              <input type="text" value={form.otherDataNote} onChange={e => set('otherDataNote', e.target.value)}
                placeholder="เช่น หมายเลขสัญชาติ, ที่อยู่, ประวัติการศึกษา" className={inp} />
            </Field>
            <Field label="วิธีการเก็บรวบรวมข้อมูล" required>
              <CheckGrid options={COLLECTION_METHODS} selected={form.collectionMethods} onChange={v => set('collectionMethods', v)} cols={2} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <SectionHeader step={4} title="ระยะเวลาเก็บรักษาข้อมูล" sub="กำหนดระยะเวลาและนโยบายการลบหรือทำลายข้อมูล" />
          <div className="space-y-3 mt-3">
            <Field label="ระยะเวลาเก็บรักษา" required>
              <div className="flex items-center gap-3">
                <input type="number" min="1" value={form.retentionValue} onChange={e => set('retentionValue', e.target.value)}
                  placeholder="2" className={`${inp} w-20`} />
                <div className="flex gap-1.5">
                  {['วัน', 'เดือน', 'ปี'].map(unit => (
                    <button key={unit} type="button" onClick={() => set('retentionUnit', unit)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${form.retentionUnit === unit
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}>
                      {unit}
                    </button>
                  ))}
                </div>
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
        </div>
      )}

      {/* Step 5 */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <SectionHeader step={5} title="มาตรการรักษาความปลอดภัย" sub="คำอธิบายมาตรการที่ใช้ปกป้องข้อมูล" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <Field label="มาตรการเชิงองค์กร (Organizational)">
              <textarea rows={3} value={form.secOrg} onChange={e => set('secOrg', e.target.value)}
                placeholder="นโยบาย, การอบรม, PDPA committee..." className={txa} />
            </Field>
            <Field label="มาตรการเชิงเทคนิค (Technical)">
              <textarea rows={3} value={form.secTech} onChange={e => set('secTech', e.target.value)}
                placeholder="Encryption, Firewall, 2FA..." className={txa} />
            </Field>
            <Field label="มาตรการทางกายภาพ (Physical)">
              <textarea rows={3} value={form.secPhysical} onChange={e => set('secPhysical', e.target.value)}
                placeholder="ระบบล็อค, CCTV, บัตรผ่าน..." className={txa} />
            </Field>
            <Field label="การควบคุมการเข้าถึงข้อมูล (Access Control)">
              <textarea rows={3} value={form.secAccess} onChange={e => set('secAccess', e.target.value)}
                placeholder="Role-based access, Audit log..." className={txa} />
            </Field>
            <Field label="การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน">
              <textarea rows={3} value={form.secResponsibility} onChange={e => set('secResponsibility', e.target.value)}
                placeholder="กำหนด role, สิทธิ์การใช้งาน, ผู้รับผิดชอบแต่ละระบบ..." className={txa} />
            </Field>
            <Field label="มาตรการตรวจสอบย้อนหลัง">
              <textarea rows={3} value={form.secAudit} onChange={e => set('secAudit', e.target.value)}
                placeholder="Audit log, การทบทวนสิทธิ์ประจำปี..." className={txa} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 6 */}
      {step === 6 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-bold text-gray-800">สรุปข้อมูลก่อนส่ง</p>
            <p className="text-xs text-gray-500">กรุณาตรวจสอบความถูกต้องก่อนส่งเพื่อรออนุมัติจาก DPO</p>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">บริษัท / องค์กร</p>
                <p className="text-sm font-semibold text-gray-800">{form.companyName || '—'}</p>
                <p className="text-xs text-gray-500">{selectedDepartment}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">ผู้บันทึก</p>
                <p className="text-sm font-semibold text-gray-800">{form.recorderEmail || '—'}</p>
                <p className="text-xs text-gray-500">{form.recordDate || '—'}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-500 mb-0.5 font-medium">กิจกรรมการประมวลผล</p>
              <p className="text-sm font-bold text-gray-800">{form.activityName || '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <p className="text-xs text-gray-400 font-medium">วัตถุประสงค์</p>
              <p className="text-sm text-gray-700">{form.purpose || '—'}</p>
              <div className="flex flex-wrap gap-1.5">
                {form.legalBasis.map(l => (
                  <span key={l} className="text-xs px-2.5 py-0.5 bg-blue-100 border border-blue-200 rounded-full text-blue-700">{l}</span>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1.5 font-medium">กลุ่มเจ้าของข้อมูล</p>
              <div className="flex flex-wrap gap-1.5">
                {form.dataSubjects.map(s => (
                  <span key={s} className="text-xs px-2.5 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">{s}</span>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5 font-medium">ระยะเวลาเก็บรักษา</p>
              <p className="text-sm font-semibold text-gray-800">
                {form.retentionValue ? `${form.retentionValue} ${form.retentionUnit}` : '—'}
                {form.retentionCriteria && <span className="text-gray-400 font-normal ml-2">· {form.retentionCriteria}</span>}
              </p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold block mb-0.5"><Info className="w-4 h-4" /> หมายเหตุ</span>
              เมื่อส่งแล้ว สถานะจะเปลี่ยนเป็น &ldquo;รอการตรวจสอบ&rdquo; และ DPO จะต้องตรวจสอบและอนุมัติก่อนจึงจะมีสถานะ Active
            </div>
          </div>
        </div>
      )}

      {/* Footer navigation */}
      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
        <button type="button" onClick={handleSaveDraft}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          {draftSaved
            ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg><span className="text-emerald-600">บันทึกแบบร่างแล้ว</span></>
            : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>บันทึกแบบร่าง</>}
        </button>
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              ย้อนกลับ
            </button>
          )}
          {step < 6 ? (
            <button type="button" onClick={() => canNext() && setStep(s => s + 1)}
              disabled={!canNext()}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ถัดไป
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          ) : (
            <button type="button" onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              ยืนยันและส่ง
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
