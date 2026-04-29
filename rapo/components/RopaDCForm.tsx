'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Info } from 'lucide-react';
import { notifyError } from '@/lib/notify';

// ΓöÇΓöÇΓöÇ Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

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
  retentionValue: '', retentionUnit: 'α╕¢α╕╡', retentionCriteria: '',
  deletionMethods: [], retentionNote: '',
  secOrg: '', secTech: '', secPhysical: '', secAccess: '', secResponsibility: '', secAudit: '',
};

const LEGAL_BASES = [
  'α╕äα╕ºα╕▓α╕íα╕óα╕┤α╕Öα╕óα╕¡α╕í (Consent)',
  'α╕üα╕▓α╕úα╕¢α╕Åα╕┤α╕Üα╕▒α╕òα╕┤α╕òα╕▓α╕íα╕¬α╕▒α╕ìα╕ìα╕▓ (Contract)',
  'α╕¢α╕úα╕░α╣éα╕óα╕èα╕Öα╣îα╣éα╕öα╕óα╕èα╕¡α╕Üα╕öα╣ëα╕ºα╕óα╕üα╕Äα╕½α╕íα╕▓α╕ó (Legitimate Interest)',
  'α╕üα╕▓α╕úα╕¢α╕Åα╕┤α╕Üα╕▒α╕òα╕┤α╕½α╕Öα╣ëα╕▓α╕ùα╕╡α╣êα╕òα╕▓α╕íα╕üα╕Äα╕½α╕íα╕▓α╕ó (Legal Obligation)',
  'α╕áα╕▓α╕úα╕üα╕┤α╕êα╕¬α╕▓α╕ÿα╕▓α╕úα╕ôα╕░ (Public Task)',
  'α╕¢α╕úα╕░α╣éα╕óα╕èα╕Öα╣îα╕¬α╕│α╕äα╕▒α╕ìα╕òα╣êα╕¡α╕èα╕╡α╕ºα╕┤α╕ò (Vital Interest)',
];
const DATA_SUBJECTS = ['α╕₧α╕Öα╕▒α╕üα╕çα╕▓α╕Ö / α╕Ñα╕╣α╕üα╕êα╣ëα╕▓α╕ç', 'α╕£α╕╣α╣ëα╕¬α╕íα╕▒α╕äα╕úα╕çα╕▓α╕Ö', 'α╕Ñα╕╣α╕üα╕äα╣ëα╕▓ / α╕£α╕╣α╣ëα╣âα╕èα╣ëα╕Üα╕úα╕┤α╕üα╕▓α╕ú', 'α╕äα╕╣α╣êα╕äα╣ëα╕▓ / α╕£α╕╣α╣ëα╕êα╕▒α╕öα╕êα╕│α╕½α╕Öα╣êα╕▓α╕ó', 'α╕¡α╕╖α╣êα╕Öα╣å'];
const PERSONAL_DATA_TYPES = [
  'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕úα╕░α╕Üα╕╕α╕òα╕▒α╕ºα╕òα╕Ö (α╕èα╕╖α╣êα╕¡, α╕¡α╕╡α╣Çα╕íα╕Ñ, α╣Çα╕Üα╕¡α╕úα╣îα╣éα╕ùα╕ú)',
  'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕ùα╕▓α╕çα╕üα╕▓α╕úα╣Çα╕çα╕┤α╕Ö (α╣Çα╕çα╕┤α╕Öα╣Çα╕öα╕╖α╕¡α╕Ö, α╕Üα╕▒α╕ìα╕èα╕╡α╕ÿα╕Öα╕▓α╕äα╕▓α╕ú)',
  'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╕╕α╕éα╕áα╕▓α╕₧',
  'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕èα╕╡α╕ºα╕áα╕▓α╕₧ (α╕Ñα╕▓α╕óα╕Öα╕┤α╣ëα╕ºα╕íα╕╖α╕¡, α╣âα╕Üα╕½α╕Öα╣ëα╕▓)',
  'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕₧α╕ñα╕òα╕┤α╕üα╕úα╕úα╕í / α╕üα╕▓α╕úα╣âα╕èα╣ëα╕çα╕▓α╕Ö',
  'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¡α╣êα╕¡α╕Öα╣äα╕½α╕ºα╕¡α╕╖α╣êα╕Öα╣å (α╕¿α╕▓α╕¬α╕Öα╕▓, α╣Çα╕èα╕╖α╣ëα╕¡α╕èα╕▓α╕òα╕┤)',
];
const COLLECTION_METHODS = ['α╣üα╕Üα╕Üα╕ƒα╕¡α╕úα╣îα╕íα╕¡α╕¡α╕Öα╣äα╕Ñα╕Öα╣î', 'α╣Çα╕¡α╕üα╕¬α╕▓α╕úα╕üα╕úα╕░α╕öα╕▓α╕⌐', 'α╕úα╕░α╕Üα╕Ü HR / CRM', 'α╕Üα╕╕α╕äα╕äα╕Ñα╕ùα╕╡α╣êα╕¬α╕▓α╕í / API'];
const DELETION_METHODS = [
  'α╕Ñα╕Üα╕êα╕▓α╕üα╕úα╕░α╕Üα╕Üα╕öα╕┤α╕êα╕┤α╕ùα╕▒α╕Ñ (Secure Delete)',
  'α╕ùα╕│α╕Ñα╕▓α╕óα╣Çα╕¡α╕üα╕¬α╕▓α╕ú (Shredding)',
  'α╕ùα╕│α╣âα╕½α╣ëα╣äα╕íα╣êα╕¬α╕▓α╕íα╕▓α╕úα╕ûα╕úα╕░α╕Üα╕╕α╕òα╕▒α╕ºα╕òα╕Öα╣äα╕öα╣ë (Anonymization)',
  'α╣éα╕¡α╕Öα╕óα╣ëα╕▓α╕óα╣äα╕¢α╣Çα╕üα╣çα╕Üα╕ûα╕▓α╕ºα╕ú (Archiving)',
];
const RETENTION_CRITERIA = ['α╕üα╕Äα╕½α╕íα╕▓α╕óα╕üα╕│α╕½α╕Öα╕ö', 'α╕Öα╣éα╕óα╕Üα╕▓α╕óα╕¡α╕çα╕äα╣îα╕üα╕ú', 'α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣îα╕¬α╕┤α╣ëα╕Öα╕¬α╕╕α╕ö', 'α╕¡α╕╖α╣êα╕Öα╣å'];
const STEPS = [
  { id: 1, label: 'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¡α╕çα╕äα╣îα╕üα╕ú' },
  { id: 2, label: 'α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣î' },
  { id: 3, label: 'α╕¢α╕úα╕░α╣Çα╕áα╕ùα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ' },
  { id: 4, label: 'α╕úα╕░α╕óα╕░α╣Çα╕ºα╕Ñα╕▓α╣Çα╕üα╣çα╕Ü' },
  { id: 5, label: 'α╕íα╕▓α╕òα╕úα╕üα╕▓α╕ú' },
  { id: 6, label: 'α╕¬α╕úα╕╕α╕¢α╣üα╕Ñα╕░α╕¬α╣êα╕ç' },
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
  const parts = String(value || '')
    .split(' - ')
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return {
      retentionValue: parts[0],
      retentionUnit: parts[1],
      retentionCriteria: parts.slice(2).join(' - '),
    };
  }

  if (parts.length === 2) {
    const [first, second] = parts;
    if (/(α╕¢α╕╡|α╣Çα╕öα╕╖α╕¡α╕Ö|α╕ºα╕▒α╕Ö)/.test(first) && !/^(α╕¢α╕╡|α╣Çα╕öα╕╖α╕¡α╕Ö|α╕ºα╕▒α╕Ö)$/.test(second)) {
      return { retentionValue: first, retentionUnit: '', retentionCriteria: second };
    }
    return { retentionValue: first, retentionUnit: second, retentionCriteria: '' };
  }

  return {
    retentionValue: parts[0] || '',
    retentionUnit: 'α╕¢α╕╡',
    retentionCriteria: '',
  };
};

const parseRetentionDurationParts = (value?: string | null) => {
  const raw = String(value || '');
  const years = (raw.match(/(\d+)\s*α╕¢α╕╡/)?.[1] || '').trim();
  const months = (raw.match(/(\d+)\s*α╣Çα╕öα╕╖α╕¡α╕Ö/)?.[1] || '').trim();
  const days = (raw.match(/(\d+)\s*α╕ºα╕▒α╕Ö/)?.[1] || '').trim();
  return { years, months, days };
};

const buildRetentionDuration = (years: string, months: string, days: string) => {
  const parts = [
    days ? `${days} α╕ºα╕▒α╕Ö` : '',
    months ? `${months} α╣Çα╕öα╕╖α╕¡α╕Ö` : '',
    years ? `${years} α╕¢α╕╡` : '',
  ].filter(Boolean);

  return parts.join(' ');
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
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INIT);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [retentionYears, setRetentionYears] = useState('');
  const [retentionMonths, setRetentionMonths] = useState('');
  const [retentionDays, setRetentionDays] = useState('');
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
          notifyError(detail || response.error || 'α╣éα╕½α╕Ñα╕öα╣üα╕Üα╕Üα╕úα╣êα╕▓α╕çα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
          return;
        }

        const data = response.data as ApiFormResponse;
        const draftPayload = parseDraftPayload(data.consentless_data);
        const retention = parseRetention(draftPayload?.retentionPeriod || data.policy?.retention_period);
        const retentionDurationSource =
          draftPayload?.retentionPeriod ||
          data.policy?.retention_period ||
          [draftPayload?.retentionValue, draftPayload?.retentionUnit].filter(Boolean).join(' ');
        const retentionParts = parseRetentionDurationParts(retentionDurationSource);

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

        setRetentionYears(retentionParts.years);
        setRetentionMonths(retentionParts.months);
        setRetentionDays(retentionParts.days);
      } catch (error) {
        console.error(error);
        notifyError('α╣éα╕½α╕Ñα╕öα╣üα╕Üα╕Üα╕úα╣êα╕▓α╕çα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
      }
    };

    fetchExistingDraft();
  }, [API_URL, editActivityId]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(f => ({ ...f, [k]: v }));
  const setRetentionPart = (part: 'years' | 'months' | 'days', value: string) => {
    const sanitized = value.replace(/\D/g, '');

    if (!sanitized) {
      if (part === 'years') setRetentionYears('');
      if (part === 'months') setRetentionMonths('');
      if (part === 'days') setRetentionDays('');
      return;
    }

    const numeric = Number(sanitized);

    if (part === 'years') {
      setRetentionYears(String(Math.min(numeric, 9999)));
      return;
    }

    if (part === 'months') {
      setRetentionMonths(String(Math.min(numeric, 12)));
      return;
    }

    setRetentionDays(String(Math.min(numeric, 31)));
  };

  const retentionDurationText = buildRetentionDuration(retentionYears, retentionMonths, retentionDays);
  const retentionPeriodPayload = [retentionDurationText, form.retentionCriteria].filter(Boolean).join(' - ');

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
      return retentionDurationText.trim() !== '' && form.retentionCriteria.trim() !== '';
    }

    return true;
  };

  const handleSaveDraft = async () => {
    try {
      if (!user?.id) {
        notifyError('α╕üα╕úα╕╕α╕ôα╕▓α╣Çα╕éα╣ëα╕▓α╕¬α╕╣α╣êα╕úα╕░α╕Üα╕Üα╣âα╕½α╕íα╣êα╕üα╣êα╕¡α╕Öα╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣üα╕Üα╕Üα╕úα╣êα╕▓α╕ç');
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
          retentionValue: retentionDurationText,
          retentionUnit: 'α╕úα╕ºα╕í',
          retentionPeriod: retentionPeriodPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = Array.isArray(data.detail) ? data.detail.join('\n') : data.detail;
        notifyError(detail || data.error || 'α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣üα╕Üα╕Üα╕úα╣êα╕▓α╕çα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
        return;
      }

      onSaveDraft?.({
        ...form,
        activity_id: data.activity_id || editingActivityId,
      } as unknown as Record<string, unknown>);

      if (data.activity_id) {
        setEditingActivityId(data.activity_id);
      }

      router.push('/dc/my-ropa?notice=draft-saved&form=dc');
    } catch (err) {
      notifyError((err as Error).message);
    }
  };

  const selectedDepartment = departments.find((d) => d.department_id === form.department)?.department_name || form.department || 'ΓÇö';

  const handleSubmit = async () => {
    try {
      const endpoint = editingActivityId ? `${API_URL}/api/form/${editingActivityId}` : `${API_URL}/api/form/submit`;
      const method = editingActivityId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          formType: 'controller',
          departmentId: form.department,
          ...form,
          retentionValue: retentionDurationText,
          retentionUnit: 'α╕úα╕ºα╕í',
          retentionPeriod: retentionPeriodPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("CREATE FORM ERROR:", data);

        const detail = Array.isArray(data.detail)
          ? data.detail.join("\n")
          : data.detail;

        notifyError(detail || data.error || "Create form failed");
        return;
      }
      setSubmitted(true);
    } catch (err) {
      notifyError((err as Error).message);
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
        <h3 className="text-lg font-bold text-gray-800 mb-1">α╕¬α╣êα╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣Çα╕úα╕╡α╕óα╕Üα╕úα╣ëα╕¡α╕óα╣üα╕Ñα╣ëα╕º</h3>
        <p className="text-sm text-gray-500 mb-5">α╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╕ûα╕╣α╕üα╕¬α╣êα╕çα╣Çα╕₧α╕╖α╣êα╕¡α╕úα╕¡α╕üα╕▓α╕úα╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Üα╕êα╕▓α╕ü DPO</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => router.push('/dc/my-ropa')}
            className="px-5 py-2 bg-white border border-blue-200 text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors"
          >
            α╣äα╕¢α╕½α╕Öα╣ëα╕▓ My Activity
          </button>
          <button onClick={() => {
            setStep(1);
            setSubmitted(false);
            setForm(INIT);
            setRetentionYears('');
            setRetentionMonths('');
            setRetentionDays('');
          }}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            α╕¬α╕úα╣ëα╕▓α╕çα╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╣âα╕½α╕íα╣ê
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 px-4">

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
            α╕¬α╣êα╕ºα╕Öα╕ùα╕╡α╣ê {step}/{STEPS.length}
          </span>
          <span className="text-xs text-gray-500">{STEPS[step - 1].label}</span>
          <span className="ml-auto flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
            Data Controller Form
          </span>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <SectionHeader step={1} title="α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¡α╕çα╕äα╣îα╕üα╕ú / α╣Çα╕êα╣ëα╕▓α╕éα╕¡α╕çα╕üα╕┤α╕êα╕üα╕úα╕úα╕í" sub="α╕£α╕╣α╣ëα╕úα╕▒α╕Üα╕£α╕┤α╕öα╕èα╕¡α╕Üα╣üα╕Ñα╕░α╕úα╕▓α╕óα╕Ñα╕░α╣Çα╕¡α╕╡α╕óα╕öα╕üα╕┤α╕êα╕üα╕úα╕úα╕í" />
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="α╕èα╕╖α╣êα╕¡α╕Üα╕úα╕┤α╕⌐α╕▒α╕ù / α╕¡α╕çα╕äα╣îα╕üα╕ú" required>
                <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="ABC Co., Ltd." className={inp} />
              </Field>
              <Field label="α╣üα╕£α╕Öα╕ü / α╕¥α╣êα╕▓α╕óα╕ùα╕╡α╣êα╕úα╕▒α╕Üα╕£α╕┤α╕öα╕èα╕¡α╕Ü" required>
                <select value={form.department} onChange={e => set('department', e.target.value)} className={inp}>
                  <option value="">α╣Çα╕Ñα╕╖α╕¡α╕üα╣üα╕£α╕Öα╕ü</option>
                  {departments.map((department) => (
                    <option key={department.department_id} value={department.department_id}>
                      {department.department_name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="α╕Ñα╕▒α╕üα╕⌐α╕ôα╕░α╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ" required>
              <input type="text" value={form.activityName} onChange={e => set('activityName', e.target.value)} placeholder="α╕üα╕▓α╕úα╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣Çα╕₧α╕╖α╣êα╕¡α╕üα╕▓α╕úα╕¬α╕íα╕▒α╕äα╕úα╕çα╕▓α╕Öα╣üα╕Ñα╕░α╕¡α╕¡α╕üα╕êα╕▓α╕üα╕çα╕▓α╕Ö" className={inp} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="α╕£α╕╣α╣ëα╕úα╕▒α╕Üα╕£α╕┤α╕öα╕èα╕¡α╕Ü (DATA OWNER)">
                <input type="text" value={form.dataOwner} onChange={e => set('dataOwner', e.target.value)} placeholder="α╕èα╕╖α╣êα╕¡-α╕¬α╕üα╕╕α╕Ñ" className={inp} />
              </Field>
              <Field label="α╕¡α╕╡α╣Çα╕íα╕Ñα╕£α╕╣α╣ëα╕Ñα╕çα╕Üα╕▒α╕Öα╕ùα╕╢α╕ü" required>
                <input type="email" value={form.recorderEmail} onChange={e => set('recorderEmail', e.target.value)} placeholder="email@company.com" className={inp} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="α╕ºα╕▒α╕Öα╕ùα╕╡α╣ê/α╣Çα╕öα╕╖α╕¡α╕Ö/α╕¢α╕╡α╕ùα╕╡α╣êα╕Üα╕▒α╕Öα╕ùα╕╢α╕ü">
                <input type="date" value={form.recordDate} onChange={e => set('recordDate', e.target.value)} className={inp} />
              </Field>
              <Field label="α╣Çα╕êα╣ëα╕▓α╕½α╕Öα╣ëα╕▓α╕ùα╕╡α╣êα╕äα╕╕α╣ëα╕íα╕äα╕úα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ (DPO)">
                <input type="text" value={form.dpcName} onChange={e => set('dpcName', e.target.value)} placeholder="α╕èα╕╖α╣êα╕¡ DPO" className={inp} />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <SectionHeader step={2} title="α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣îα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ" sub="α╕úα╕░α╕Üα╕╕α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣îα╣üα╕Ñα╕░α╕Éα╕▓α╕Öα╕ùα╕▓α╕çα╕üα╕Äα╕½α╕íα╕▓α╕óα╕ùα╕╡α╣êα╣âα╕èα╣ë" />
          <div className="space-y-3 mt-3">
            <Field label="α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣îα╕éα╕¡α╕çα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ" required>
              <textarea rows={3} value={form.purpose} onChange={e => set('purpose', e.target.value)}
                placeholder="α╣Çα╕üα╣çα╕Üα╕úα╕ºα╕Üα╕úα╕ºα╕íα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣Çα╕₧α╕╖α╣êα╕¡α╣âα╕èα╣ëα╣âα╕Öα╕üα╕▓α╕úα╕Üα╕úα╕┤α╕½α╕▓α╕úα╕ùα╕úα╕▒α╕₧α╕óα╕▓α╕üα╕úα╕Üα╕╕α╕äα╕äα╕Ñ..." className={txa} />
            </Field>
            <Field label="α╕Éα╕▓α╕Öα╕ùα╕▓α╕çα╕üα╕Äα╕½α╕íα╕▓α╕ó (LEGAL BASIS)" required>
              <CheckGrid options={LEGAL_BASES} selected={form.legalBasis} onChange={v => set('legalBasis', v)} cols={2} />
            </Field>
            <Field label="α╕½α╕íα╕▓α╕óα╣Çα╕½α╕òα╕╕α╣Çα╕₧α╕┤α╣êα╕íα╣Çα╕òα╕┤α╕í">
              <textarea rows={2} value={form.legalBasisNote} onChange={e => set('legalBasisNote', e.target.value)}
                placeholder="α╕úα╕░α╕Üα╕╕α╕úα╕▓α╕óα╕Ñα╕░α╣Çα╕¡α╕╡α╕óα╕öα╣Çα╕₧α╕┤α╣êα╕íα╣Çα╕òα╕┤α╕í (α╕ûα╣ëα╕▓α╕íα╕╡)" className={txa} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <SectionHeader step={3} title="α╕¢α╕úα╕░α╣Çα╕áα╕ùα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣üα╕Ñα╕░α╣Çα╕êα╣ëα╕▓α╕éα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ" sub="α╕¢α╕úα╕░α╣Çα╕áα╕ùα╕£α╕╣α╣ëα╣Çα╕¢α╣çα╕Öα╣Çα╕êα╣ëα╕▓α╕éα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣üα╕Ñα╕░α╕üα╕Ñα╕╕α╣êα╕íα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕ùα╕╡α╣êα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ" />
          <div className="space-y-3 mt-3">
            <Field label="α╕üα╕Ñα╕╕α╣êα╕íα╣Çα╕êα╣ëα╕▓α╕éα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ (DATA SUBJECT)" required>
              <CheckGrid options={DATA_SUBJECTS} selected={form.dataSubjects} onChange={v => set('dataSubjects', v)} cols={2} />
            </Field>
            <Field label="α╕¢α╕úα╕░α╣Çα╕áα╕ùα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╣êα╕ºα╕Öα╕Üα╕╕α╕äα╕äα╕Ñα╕ùα╕╡α╣êα╣Çα╕üα╣çα╕Ü" required>
              <CheckGrid options={PERSONAL_DATA_TYPES} selected={form.personalDataTypes} onChange={v => set('personalDataTypes', v)} cols={2} />
            </Field>
            <Field label="α╕úα╕░α╕Üα╕╕α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣Çα╕₧α╕┤α╣êα╕íα╣Çα╕òα╕┤α╕í">
              <input type="text" value={form.otherDataNote} onChange={e => set('otherDataNote', e.target.value)}
                placeholder="α╣Çα╕èα╣êα╕Ö α╕½α╕íα╕▓α╕óα╣Çα╕Ñα╕éα╕¬α╕▒α╕ìα╕èα╕▓α╕òα╕┤, α╕ùα╕╡α╣êα╕¡α╕óα╕╣α╣ê, α╕¢α╕úα╕░α╕ºα╕▒α╕òα╕┤α╕üα╕▓α╕úα╕¿α╕╢α╕üα╕⌐α╕▓" className={inp} />
            </Field>
            <Field label="α╕ºα╕┤α╕ÿα╕╡α╕üα╕▓α╕úα╣Çα╕üα╣çα╕Üα╕úα╕ºα╕Üα╕úα╕ºα╕íα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ" required>
              <CheckGrid options={COLLECTION_METHODS} selected={form.collectionMethods} onChange={v => set('collectionMethods', v)} cols={2} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <SectionHeader step={4} title="α╕úα╕░α╕óα╕░α╣Çα╕ºα╕Ñα╕▓α╣Çα╕üα╣çα╕Üα╕úα╕▒α╕üα╕⌐α╕▓α╕éα╣ëα╕¡α╕íα╕╣α╕Ñ" sub="α╕üα╕│α╕½α╕Öα╕öα╕úα╕░α╕óα╕░α╣Çα╕ºα╕Ñα╕▓α╣üα╕Ñα╕░α╕Öα╣éα╕óα╕Üα╕▓α╕óα╕üα╕▓α╕úα╕Ñα╕Üα╕½α╕úα╕╖α╕¡α╕ùα╕│α╕Ñα╕▓α╕óα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ" />
          <div className="space-y-3 mt-3">
            <Field label="α╕úα╕░α╕óα╕░α╣Çα╕ºα╕Ñα╕▓α╣Çα╕üα╣çα╕Üα╕úα╕▒α╕üα╕⌐α╕▓" required>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={31}
                    step={1}
                    value={retentionDays}
                    onChange={e => setRetentionPart('days', e.target.value)}
                    placeholder="dd"
                    className={inp}
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">α╕ºα╕▒α╕Ö</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={12}
                    step={1}
                    value={retentionMonths}
                    onChange={e => setRetentionPart('months', e.target.value)}
                    placeholder="mm"
                    className={inp}
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">α╣Çα╕öα╕╖α╕¡α╕Ö</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    step={1}
                    value={retentionYears}
                    onChange={e => setRetentionPart('years', e.target.value)}
                    placeholder="yyyy"
                    className={inp}
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">α╕¢α╕╡</span>
                </div>
              </div>
            </Field>
            <Field label="α╣Çα╕üα╕ôα╕æα╣îα╕üα╕▓α╕úα╕üα╕│α╕½α╕Öα╕öα╕úα╕░α╕óα╕░α╣Çα╕ºα╕Ñα╕▓" required>
              <RadioGroup options={RETENTION_CRITERIA} value={form.retentionCriteria} onChange={v => set('retentionCriteria', v)} />
            </Field>
            <Field label="α╕ºα╕┤α╕ÿα╕╡α╕üα╕▓α╕úα╕ùα╕│α╕Ñα╕▓α╕óα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣Çα╕íα╕╖α╣êα╕¡α╕äα╕úα╕Üα╕üα╕│α╕½α╕Öα╕ö">
              <CheckGrid options={DELETION_METHODS} selected={form.deletionMethods} onChange={v => set('deletionMethods', v)} cols={2} />
            </Field>
            <Field label="α╕½α╕íα╕▓α╕óα╣Çα╕½α╕òα╕╕α╣Çα╕₧α╕┤α╣êα╕íα╣Çα╕òα╕┤α╕í">
              <textarea rows={2} value={form.retentionNote} onChange={e => set('retentionNote', e.target.value)}
                placeholder="α╣Çα╕èα╣êα╕Ö α╣Çα╕¡α╕üα╕¬α╕▓α╕úα╕ùα╕╡α╣êα╣Çα╕üα╕╡α╣êα╕óα╕ºα╕éα╣ëα╕¡α╕çα╕äα╕ºα╕úα╕êα╕░α╣Çα╕üα╣çα╕Üα╣äα╕ºα╣ëα╣äα╕íα╣êα╕üα╕╡α╣êα╕ºα╕▒α╕Öα╕üα╣êα╕¡α╕Öα╕ùα╕╡α╣êα╕êα╕░α╕Ñα╕Ü..." className={txa} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 5 */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <SectionHeader step={5} title="α╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╕úα╕▒α╕üα╕⌐α╕▓α╕äα╕ºα╕▓α╕íα╕¢α╕Ñα╕¡α╕öα╕áα╕▒α╕ó" sub="α╕äα╕│α╕¡α╕ÿα╕┤α╕Üα╕▓α╕óα╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╕ùα╕╡α╣êα╣âα╕èα╣ëα╕¢α╕üα╕¢α╣ëα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <Field label="α╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╣Çα╕èα╕┤α╕çα╕¡α╕çα╕äα╣îα╕üα╕ú (Organizational)">
              <textarea rows={3} value={form.secOrg} onChange={e => set('secOrg', e.target.value)}
                placeholder="α╕Öα╣éα╕óα╕Üα╕▓α╕ó, α╕üα╕▓α╕úα╕¡α╕Üα╕úα╕í, PDPA committee..." className={txa} />
            </Field>
            <Field label="α╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╣Çα╕èα╕┤α╕çα╣Çα╕ùα╕äα╕Öα╕┤α╕ä (Technical)">
              <textarea rows={3} value={form.secTech} onChange={e => set('secTech', e.target.value)}
                placeholder="Encryption, Firewall, 2FA..." className={txa} />
            </Field>
            <Field label="α╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╕ùα╕▓α╕çα╕üα╕▓α╕óα╕áα╕▓α╕₧ (Physical)">
              <textarea rows={3} value={form.secPhysical} onChange={e => set('secPhysical', e.target.value)}
                placeholder="α╕úα╕░α╕Üα╕Üα╕Ñα╣çα╕¡α╕ä, CCTV, α╕Üα╕▒α╕òα╕úα╕£α╣êα╕▓α╕Ö..." className={txa} />
            </Field>
            <Field label="α╕üα╕▓α╕úα╕äα╕ºα╕Üα╕äα╕╕α╕íα╕üα╕▓α╕úα╣Çα╕éα╣ëα╕▓α╕ûα╕╢α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ (Access Control)">
              <textarea rows={3} value={form.secAccess} onChange={e => set('secAccess', e.target.value)}
                placeholder="Role-based access, Audit log..." className={txa} />
            </Field>
            <Field label="α╕üα╕▓α╕úα╕üα╕│α╕½α╕Öα╕öα╕½α╕Öα╣ëα╕▓α╕ùα╕╡α╣êα╕äα╕ºα╕▓α╕íα╕úα╕▒α╕Üα╕£α╕┤α╕öα╕èα╕¡α╕Üα╕éα╕¡α╕çα╕£α╕╣α╣ëα╣âα╕èα╣ëα╕çα╕▓α╕Ö">
              <textarea rows={3} value={form.secResponsibility} onChange={e => set('secResponsibility', e.target.value)}
                placeholder="α╕üα╕│α╕½α╕Öα╕ö role, α╕¬α╕┤α╕ùα╕ÿα╕┤α╣îα╕üα╕▓α╕úα╣âα╕èα╣ëα╕çα╕▓α╕Ö, α╕£α╕╣α╣ëα╕úα╕▒α╕Üα╕£α╕┤α╕öα╕èα╕¡α╕Üα╣üα╕òα╣êα╕Ñα╕░α╕úα╕░α╕Üα╕Ü..." className={txa} />
            </Field>
            <Field label="α╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Üα╕óα╣ëα╕¡α╕Öα╕½α╕Ñα╕▒α╕ç">
              <textarea rows={3} value={form.secAudit} onChange={e => set('secAudit', e.target.value)}
                placeholder="Audit log, α╕üα╕▓α╕úα╕ùα╕Üα╕ùα╕ºα╕Öα╕¬α╕┤α╕ùα╕ÿα╕┤α╣îα╕¢α╕úα╕░α╕êα╕│α╕¢α╕╡..." className={txa} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 6 */}
      {step === 6 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-bold text-gray-800">α╕¬α╕úα╕╕α╕¢α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕üα╣êα╕¡α╕Öα╕¬α╣êα╕ç</p>
            <p className="text-xs text-gray-500">α╕üα╕úα╕╕α╕ôα╕▓α╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Üα╕äα╕ºα╕▓α╕íα╕ûα╕╣α╕üα╕òα╣ëα╕¡α╕çα╕üα╣êα╕¡α╕Öα╕¬α╣êα╕çα╣Çα╕₧α╕╖α╣êα╕¡α╕úα╕¡α╕¡α╕Öα╕╕α╕íα╕▒α╕òα╕┤α╕êα╕▓α╕ü DPO</p>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">α╕Üα╕úα╕┤α╕⌐α╕▒α╕ù / α╕¡α╕çα╕äα╣îα╕üα╕ú</p>
                <p className="text-sm font-semibold text-gray-800">{form.companyName || 'ΓÇö'}</p>
                <p className="text-xs text-gray-500">{selectedDepartment}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">α╕£α╕╣α╣ëα╕Üα╕▒α╕Öα╕ùα╕╢α╕ü</p>
                <p className="text-sm font-semibold text-gray-800">{form.recorderEmail || 'ΓÇö'}</p>
                <p className="text-xs text-gray-500">{form.recordDate || 'ΓÇö'}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-500 mb-0.5 font-medium">α╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ</p>
              <p className="text-sm font-bold text-gray-800">{form.activityName || 'ΓÇö'}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <p className="text-xs text-gray-400 font-medium">α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣î</p>
              <p className="text-sm text-gray-700">{form.purpose || 'ΓÇö'}</p>
              <div className="flex flex-wrap gap-1.5">
                {form.legalBasis.map(l => (
                  <span key={l} className="text-xs px-2.5 py-0.5 bg-blue-100 border border-blue-200 rounded-full text-blue-700">{l}</span>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1.5 font-medium">α╕üα╕Ñα╕╕α╣êα╕íα╣Çα╕êα╣ëα╕▓α╕éα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ</p>
              <div className="flex flex-wrap gap-1.5">
                {form.dataSubjects.map(s => (
                  <span key={s} className="text-xs px-2.5 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">{s}</span>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5 font-medium">α╕úα╕░α╕óα╕░α╣Çα╕ºα╕Ñα╕▓α╣Çα╕üα╣çα╕Üα╕úα╕▒α╕üα╕⌐α╕▓</p>
              <p className="text-sm font-semibold text-gray-800">
                {retentionDurationText || 'ΓÇö'}
                {form.retentionCriteria && <span className="text-gray-400 font-normal ml-2">┬╖ {form.retentionCriteria}</span>}
              </p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold block mb-0.5"><Info className="w-4 h-4" /> α╕½α╕íα╕▓α╕óα╣Çα╕½α╕òα╕╕</span>
              α╣Çα╕íα╕╖α╣êα╕¡α╕¬α╣êα╕çα╣üα╕Ñα╣ëα╕º α╕¬α╕ûα╕▓α╕Öα╕░α╕êα╕░α╣Çα╕¢α╕Ñα╕╡α╣êα╕óα╕Öα╣Çα╕¢α╣çα╕Ö &ldquo;α╕úα╕¡α╕üα╕▓α╕úα╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Ü&rdquo; α╣üα╕Ñα╕░ DPO α╕êα╕░α╕òα╣ëα╕¡α╕çα╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Üα╣üα╕Ñα╕░α╕¡α╕Öα╕╕α╕íα╕▒α╕òα╕┤α╕üα╣êα╕¡α╕Öα╕êα╕╢α╕çα╕êα╕░α╕íα╕╡α╕¬α╕ûα╕▓α╕Öα╕░ Active
            </div>
          </div>
        </div>
      )}

      {/* Footer navigation */}
      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
        <button type="button" onClick={handleSaveDraft}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          {draftSaved
            ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg><span className="text-emerald-600">α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣üα╕Üα╕Üα╕úα╣êα╕▓α╕çα╣üα╕Ñα╣ëα╕º</span></>
            : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣üα╕Üα╕Üα╕úα╣êα╕▓α╕ç</>}
        </button>
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              α╕óα╣ëα╕¡α╕Öα╕üα╕Ñα╕▒α╕Ü
            </button>
          )}
          {step < 6 ? (
            <button type="button" onClick={() => canNext() && setStep(s => s + 1)}
              disabled={!canNext()}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              α╕ûα╕▒α╕öα╣äα╕¢
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          ) : (
            <button type="button" onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              α╕óα╕╖α╕Öα╕óα╕▒α╕Öα╣üα╕Ñα╕░α╕¬α╣êα╕ç
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
