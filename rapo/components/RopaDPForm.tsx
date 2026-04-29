'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock8, AlertCircle, SearchAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notifyError } from '@/lib/notify';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const ACCESS_DRAFT_PREFIX = '__ACCESS_DRAFT__:';

// ΓöÇΓöÇΓöÇ Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

type FormType = 'controller' | 'processor' | null;

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

// ΓöÇΓöÇΓöÇ Constants ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const DATA_CATEGORIES = ['α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕Ñα╕╣α╕üα╕äα╣ëα╕▓', 'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕äα╕╣α╣êα╕äα╣ëα╕▓', 'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕£α╕╣α╣ëα╕òα╕┤α╕öα╕òα╣êα╕¡', 'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕₧α╕Öα╕▒α╕üα╕çα╕▓α╕Ö'];
const DATA_TYPES = ['α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕ùα╕▒α╣êα╕ºα╣äα╕¢', 'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¡α╣êα╕¡α╕Öα╣äα╕½α╕º'];
const COLLECTION_METHODS = ['Soft File (α╣äα╕ƒα╕Ñα╣îα╕¡α╕┤α╣Çα╕Ñα╣çα╕üα╕ùα╕úα╕¡α╕Öα╕┤α╕üα╕¬α╣î)', 'Hard Copy (α╣Çα╕¡α╕üα╕¬α╕▓α╕úα╕üα╕úα╕░α╕öα╕▓α╕⌐)'];
const LEGAL_BASES_TH = [
  'α╕Éα╕▓α╕Öα╕äα╕ºα╕▓α╕íα╕óα╕┤α╕Öα╕óα╕¡α╕í (Consent)',
  'α╕Éα╕▓α╕Öα╕¬α╕▒α╕ìα╕ìα╕▓ (Contract)',
  'α╕Éα╕▓α╕Öα╕½α╕Öα╣ëα╕▓α╕ùα╕╡α╣êα╕òα╕▓α╕íα╕üα╕Äα╕½α╕íα╕▓α╕ó (Legal Obligation)',
  'α╕Éα╕▓α╕Öα╕¢α╕úα╕░α╣éα╕óα╕èα╕Öα╣îα╕¬α╕│α╕äα╕▒α╕ìα╕òα╣êα╕¡α╕èα╕╡α╕ºα╕┤α╕ò (Vital Interest)',
  'α╕Éα╕▓α╕Öα╕áα╕▓α╕úα╕üα╕┤α╕êα╕¬α╕▓α╕ÿα╕▓α╕úα╕ôα╕░ (Public Task)',
  'α╕Éα╕▓α╕Öα╕¢α╕úα╕░α╣éα╕óα╕èα╕Öα╣îα╣éα╕öα╕óα╕èα╕¡α╕Üα╕öα╣ëα╕ºα╕óα╕üα╕Äα╕½α╕íα╕▓α╕ó (Legitimate Interest)',
];
const PERSONAL_DATA_EXAMPLES = [
  'α╕èα╕╖α╣êα╕¡-α╕Öα╕▓α╕íα╕¬α╕üα╕╕α╕Ñ', 'α╕ùα╕╡α╣êα╕¡α╕óα╕╣α╣ê', 'α╣Çα╕Üα╕¡α╕úα╣îα╣éα╕ùα╕úα╕¿α╕▒α╕₧α╕ùα╣î', 'α╕¡α╕╡α╣Çα╕íα╕Ñ', 'α╣Çα╕Ñα╕éα╕Üα╕▒α╕òα╕úα╕¢α╕úα╕░α╕èα╕▓α╕èα╕Ö',
  'α╕ºα╕▒α╕Öα╣Çα╕öα╕╖α╕¡α╕Öα╕¢α╕╡α╣Çα╕üα╕┤α╕ö', 'α╕áα╕▓α╕₧α╕ûα╣êα╕▓α╕ó', 'α╕áα╕▓α╕₧α╣Çα╕äα╕Ñα╕╖α╣êα╕¡α╕Öα╣äα╕½α╕º/α╕ºα╕┤α╕öα╕╡α╣éα╕¡', 'α╕äα╕Ñα╕┤α╕¢α╕¬α╕▒α╕íα╕áα╕▓α╕⌐α╕ôα╣î',
  'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕ùα╕▓α╕çα╕üα╕▓α╕úα╣Çα╕çα╕┤α╕Ö', 'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╕╕α╕éα╕áα╕▓α╕₧', 'α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕èα╕╡α╕ºα╕áα╕▓α╕₧', 'IP Address', 'Cookie',
];
const STORAGE_TYPES = ['Soft File (α╣äα╕ƒα╕Ñα╣îα╕¡α╕┤α╣Çα╕Ñα╣çα╕üα╕ùα╕úα╕¡α╕Öα╕┤α╕üα╕¬α╣î)', 'Hard Copy (α╣Çα╕¡α╕üα╕¬α╕▓α╕úα╕üα╕úα╕░α╕öα╕▓α╕⌐)'];
const TRANSFER_EXCEPTIONS = [
  'α╕¢α╕Åα╕┤α╕Üα╕▒α╕òα╕┤α╕òα╕▓α╕íα╕üα╕Äα╕½α╕íα╕▓α╕ó', 'α╕äα╕ºα╕▓α╕íα╕óα╕┤α╕Öα╕óα╕¡α╕í', 'α╕¢α╕Åα╕┤α╕Üα╕▒α╕òα╕┤α╕òα╕▓α╕íα╕¬α╕▒α╕ìα╕ìα╕▓',
  'α╕¢α╕úα╕░α╣éα╕óα╕èα╕Öα╣îα╕¬α╕▓α╕ÿα╕▓α╕úα╕ôα╕░', 'α╕¢α╕úα╕░α╣éα╕óα╕èα╕Öα╣îα╕¬α╕│α╕äα╕▒α╕ìα╕òα╣êα╕¡α╕èα╕╡α╕ºα╕┤α╕ò', 'α╕éα╣ëα╕¡α╕óα╕üα╣Çα╕ºα╣ëα╕Öα╕¡α╕╖α╣êα╕Öα╣å',
];

const STEPS = [
  { id: 1, label: 'α╕£α╕╣α╣ëα╕Ñα╕çα╕Üα╕▒α╕Öα╕ùα╕╢α╕ü', short: 'α╕£α╕╣α╣ëα╕Üα╕▒α╕Öα╕ùα╕╢α╕ü' },
  { id: 2, label: 'α╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ', short: 'α╕üα╕┤α╕êα╕üα╕úα╕úα╕í' },
  { id: 3, label: 'α╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╕úα╕▒α╕üα╕⌐α╕▓α╕äα╕ºα╕▓α╕íα╕¢α╕Ñα╕¡α╕öα╕áα╕▒α╕ó', short: 'α╕äα╕ºα╕▓α╕íα╕¢α╕Ñα╕¡α╕öα╕áα╕▒α╕ó' },
  { id: 4, label: 'α╕¬α╕úα╕╕α╕¢α╣üα╕Ñα╕░α╕¬α╣êα╕ç', short: 'α╕¬α╕úα╕╕α╕¢' },
];

// ΓöÇΓöÇΓöÇ Small helper components ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

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

function YesNo({ value, onChange, options = ['α╕íα╕╡', 'α╣äα╕íα╣êα╕íα╕╡'] }: {
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
    transferAbroad: 'α╣äα╕íα╣êα╕íα╕╡',
    transferCountry: '',
    transferAffiliate: 'α╣äα╕íα╣êα╣âα╕èα╣ê',
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

// ΓöÇΓöÇΓöÇ Sub-activity accordion ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

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
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${open ? 'bg-white text-blue-700' : 'bg-blue-600 text-slate-700'}`}>
            {idx + 1}
          </span>
          <div>
            <p className={`text-sm font-semibold ${open ? 'text-slate-700' : 'text-slate-700'}`}>
              α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣îα╕ùα╕╡α╣ê {idx + 1}
            </p>
            {sub.purpose && (
              <p className={`text-xs mt-0.5 ${open ? 'text-blue-200' : 'text-slate-400'}`}>
                {sub.purpose.length > 50 ? sub.purpose.slice(0, 50) + 'ΓÇª' : sub.purpose}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button type="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className={`p-1.5 rounded-lg transition-colors ${open ? 'text-slate-700/60 hover:text-slate-700 hover:bg-white/15' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          )}
          <span className={open ? 'text-slate-700/70' : 'text-slate-400'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {open && (
        <div className="p-5 space-y-5 bg-white">

          {/* 1. α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣î */}
          <Field label="α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣îα╕éα╕¡α╕çα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ" required>
            <textarea rows={2} value={sub.purpose} onChange={e => set('purpose', e.target.value)}
              className={txa} />
          </Field>

          <Field label="α╕éα╕¡α╕Üα╣Çα╕éα╕òα╕üα╕▓α╕úα╣âα╕èα╣ëα╕çα╕▓α╕Öα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ" required>
            <textarea
              rows={3}
              value={sub.scope}
              onChange={e => set('scope', e.target.value)}
              placeholder="α╣Çα╕èα╣êα╕Ö α╣âα╕èα╣ëα╣Çα╕ëα╕₧α╕▓α╕░α╕èα╕╖α╣êα╕¡-α╕Öα╕▓α╕íα╕¬α╕üα╕╕α╕Ñα╣üα╕Ñα╕░α╕¡α╕╡α╣Çα╕íα╕Ñ α╣Çα╕₧α╕╖α╣êα╕¡α╕öα╕│α╣Çα╕Öα╕┤α╕Öα╕üα╕▓α╕úα╕òα╕▓α╕íα╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣îα╕ùα╕╡α╣êα╕úα╕░α╕Üα╕╕"
              className={txa}
            />
          </Field>

          {/* 2. α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕ùα╕╡α╣êα╕êα╕▒α╕öα╣Çα╕üα╣çα╕Ü */}
          <Field label="α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╣êα╕ºα╕Öα╕Üα╕╕α╕äα╕äα╕Ñα╕ùα╕╡α╣êα╕êα╕▒α╕öα╣Çα╕üα╣çα╕Ü" required >
            <MultiCheck options={PERSONAL_DATA_EXAMPLES} selected={sub.personalDataItems} onChange={v => set('personalDataItems', v)} cols={3} />
          </Field>

          {/* 3-4. α╕½α╕íα╕ºα╕öα╕½α╕íα╕╣α╣ê + α╕¢α╕úα╕░α╣Çα╕áα╕ù */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="α╕½α╕íα╕ºα╕öα╕½α╕íα╕╣α╣êα╕éα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ" required>
              <MultiCheck options={DATA_CATEGORIES} selected={sub.dataCategory} onChange={v => set('dataCategory', v)} />
            </Field>
            <Field label="α╕¢α╕úα╕░α╣Çα╕áα╕ùα╕éα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ" required>
              <MultiCheck options={DATA_TYPES} selected={sub.dataType} onChange={v => set('dataType', v)} />
            </Field>
          </div>

          {/* 5. α╕ºα╕┤α╕ÿα╕╡α╕üα╕▓α╕úα╣äα╕öα╣ëα╕íα╕▓ */}
          <Field label="α╕ºα╕┤α╕ÿα╕╡α╕üα╕▓α╕úα╣äα╕öα╣ëα╕íα╕▓α╕ïα╕╢α╣êα╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ" required>
            <MultiCheck options={COLLECTION_METHODS} selected={sub.collectionMethod} onChange={v => set('collectionMethod', v)} />
          </Field>

          {/* 6. α╣üα╕½α╕Ñα╣êα╕çα╕ùα╕╡α╣êα╕íα╕▓ */}
          <Field label="α╣üα╕½α╕Ñα╣êα╕çα╕ùα╕╡α╣êα╣äα╕öα╣ëα╕íα╕▓α╕ïα╕╢α╣êα╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ" required>
            <div className="flex gap-3">
              {['α╕êα╕▓α╕üα╣Çα╕êα╣ëα╕▓α╕éα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣éα╕öα╕óα╕òα╕úα╕ç', 'α╕êα╕▓α╕üα╣üα╕½α╕Ñα╣êα╕çα╕¡α╕╖α╣êα╕Ö'].map(v => (
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

          {/* 7. α╕Éα╕▓α╕Öα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ */}
          <Field label="α╕Éα╕▓α╕Öα╣âα╕Öα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ" required>
            <MultiCheck options={LEGAL_BASES_TH} selected={sub.legalBasis} onChange={v => set('legalBasis', v)} />
          </Field>

          {/* 8. α╕£α╕╣α╣ëα╣Çα╕óα╕▓α╕ºα╣î (Controller α╣Çα╕ùα╣êα╕▓α╕Öα╕▒α╣ëα╕Ö) */}
          {isCtrl && (
            <div className="p-4 rounded-xl border border-amber-200 bg-50 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-800">α╕üα╕▓α╕úα╕éα╕¡α╕äα╕ºα╕▓α╕íα╕óα╕┤α╕Öα╕óα╕¡α╕íα╕éα╕¡α╕çα╕£α╕╣α╣ëα╣Çα╕óα╕▓α╕ºα╣î</span>
                {/* <span className="text-xs text-amber-500">(α╣Çα╕ëα╕₧α╕▓α╕░ Data Controller)</span> */}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="α╕¡α╕▓α╕óα╕╕α╣äα╕íα╣êα╣Çα╕üα╕┤α╕Ö 10 α╕¢α╕╡" >
                  <textarea rows={2} value={sub.minorConsentUnder10}
                    onChange={e => set('minorConsentUnder10', e.target.value)}
                    className={txa} />
                </Field>
                <Field label="α╕¡α╕▓α╕óα╕╕ 10ΓÇô20 α╕¢α╕╡" >
                  <textarea rows={2} value={sub.minorConsentAge10to20}
                    onChange={e => set('minorConsentAge10to20', e.target.value)}
                    className={txa} />
                </Field>
              </div>
            </div>
          )}

          {/* 9. α╕üα╕▓α╕úα╣éα╕¡α╕Öα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕òα╣êα╕▓α╕çα╕¢α╕úα╕░α╣Çα╕ùα╕¿ */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">α╕üα╕▓α╕úα╕¬α╣êα╕çα╕½α╕úα╕╖α╕¡α╣éα╕¡α╕Öα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣äα╕¢α╕óα╕▒α╕çα╕òα╣êα╕▓α╕çα╕¢α╕úα╕░α╣Çα╕ùα╕¿</span>
            </div>
            <Field label="α╕íα╕╡α╕üα╕▓α╕úα╕¬α╣êα╕çα╕½α╕úα╕╖α╕¡α╣éα╕¡α╕Öα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣äα╕¢α╕òα╣êα╕▓α╕çα╕¢α╕úα╕░α╣Çα╕ùα╕¿α╕½α╕úα╕╖α╕¡α╣äα╕íα╣ê">
              <YesNo value={sub.transferAbroad} onChange={v => set('transferAbroad', v)} />
            </Field>

            {sub.transferAbroad === 'α╕íα╕╡' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="α╕¢α╕úα╕░α╣Çα╕ùα╕¿α╕¢α╕Ñα╕▓α╕óα╕ùα╕▓α╕ç" required>
                    <input type="text" value={sub.transferCountry} onChange={e => set('transferCountry', e.target.value)}
                      className={inp} />
                  </Field>
                  <Field label="α╕ºα╕┤α╕ÿα╕╡α╕üα╕▓α╕úα╣éα╕¡α╕Öα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ">
                    <input type="text" value={sub.transferMethod} onChange={e => set('transferMethod', e.target.value)}
                      className={inp} />
                  </Field>
                </div>
                <Field label="α╣Çα╕¢α╣çα╕Öα╕üα╕▓α╕úα╕¬α╣êα╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣âα╕Öα╕üα╕Ñα╕╕α╣êα╕íα╕Üα╕úα╕┤α╕⌐α╕▒α╕ùα╣âα╕Öα╣Çα╕äα╕úα╕╖α╕¡α╕½α╕úα╕╖α╕¡α╣äα╕íα╣ê">
                  <YesNo value={sub.transferAffiliate} onChange={v => set('transferAffiliate', v)} options={['α╣âα╕èα╣ê', 'α╣äα╕íα╣êα╣âα╕èα╣ê']} />
                </Field>
                {sub.transferAffiliate === 'α╣âα╕èα╣ê' && (
                  <Field label="α╕èα╕╖α╣êα╕¡α╕Üα╕úα╕┤α╕⌐α╕▒α╕ùα╣âα╕Öα╣Çα╕äα╕úα╕╖α╕¡">
                    <input type="text" value={sub.transferAffiliateCompany} onChange={e => set('transferAffiliateCompany', e.target.value)}
                      className={inp} />
                  </Field>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="α╕íα╕▓α╕òα╕úα╕Éα╕▓α╕Öα╕üα╕▓α╕úα╕äα╕╕α╣ëα╕íα╕äα╕úα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕éα╕¡α╕çα╕¢α╕úα╕░α╣Çα╕ùα╕¿α╕¢α╕Ñα╕▓α╕óα╕ùα╕▓α╕ç">
                    <input type="text" value={sub.transferStandard} onChange={e => set('transferStandard', e.target.value)}
                      className={inp} />
                  </Field>
                  <Field label="α╕éα╣ëα╕¡α╕óα╕üα╣Çα╕ºα╣ëα╕Öα╕òα╕▓α╕íα╕íα╕▓α╕òα╕úα╕▓ 28">
                    <select value={sub.transferException28} onChange={e => set('transferException28', e.target.value)} className={sel}>
                      <option value="">α╣Çα╕Ñα╕╖α╕¡α╕üα╕éα╣ëα╕¡α╕óα╕üα╣Çα╕ºα╣ëα╕Ö</option>
                      {TRANSFER_EXCEPTIONS.map(x => <option key={x}>{x}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* 10. α╕Öα╣éα╕óα╕Üα╕▓α╕óα╕üα╕▓α╕úα╣Çα╕üα╣çα╕Üα╕úα╕▒α╕üα╕⌐α╕▓ */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">α╕Öα╣éα╕óα╕Üα╕▓α╕óα╕üα╕▓α╕úα╣Çα╕üα╣çα╕Üα╕úα╕▒α╕üα╕⌐α╕▓α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╣êα╕ºα╕Öα╕Üα╕╕α╕äα╕äα╕Ñ</span>
            </div>
            <Field label="α╕¢α╕úα╕░α╣Çα╕áα╕ùα╕éα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕ùα╕╡α╣êα╕êα╕▒α╕öα╣Çα╕üα╣çα╕Ü">
              <MultiCheck options={STORAGE_TYPES} selected={sub.storageType} onChange={v => set('storageType', v)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="α╕ºα╕┤α╕ÿα╕╡α╕üα╕▓α╕úα╣Çα╕üα╣çα╕Üα╕úα╕▒α╕üα╕⌐α╕▓α╕éα╣ëα╕¡α╕íα╕╣α╕Ñ">
                <textarea rows={2} value={sub.storageMethod} onChange={e => set('storageMethod', e.target.value)}
                  className={txa} />
              </Field>
              <Field label="α╕úα╕░α╕óα╕░α╣Çα╕ºα╕Ñα╕▓α╕üα╕▓α╕úα╣Çα╕üα╣çα╕Üα╕úα╕▒α╕üα╕⌐α╕▓α╕éα╣ëα╕¡α╕íα╕╣α╕Ñ" required>
                <input type="text" value={sub.retentionPeriod} onChange={e => set('retentionPeriod', e.target.value)}
                  className={inp} />
              </Field>
            </div>
            <Field label="α╕¬α╕┤α╕ùα╕ÿα╕┤α╣üα╕Ñα╕░α╕ºα╕┤α╕ÿα╕╡α╕üα╕▓α╕úα╣Çα╕éα╣ëα╕▓α╕ûα╕╢α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╣êα╕ºα╕Öα╕Üα╕╕α╕äα╕äα╕Ñ"
            >
              <textarea rows={2} value={sub.accessRights} onChange={e => set('accessRights', e.target.value)}
                className={txa} />
            </Field>
            <Field label="α╕ºα╕┤α╕ÿα╕╡α╕üα╕▓α╕úα╕Ñα╕Üα╕½α╕úα╕╖α╕¡α╕ùα╕│α╕Ñα╕▓α╕óα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣Çα╕íα╕╖α╣êα╕¡α╕¬α╕┤α╣ëα╕Öα╕¬α╕╕α╕öα╕úα╕░α╕óα╕░α╣Çα╕ºα╕Ñα╕▓">
              <textarea rows={2} value={sub.deletionMethod} onChange={e => set('deletionMethod', e.target.value)}
                className={txa} />
            </Field>
          </div>

          {/* 11-12. Controller-only fields */}
          {isCtrl && (
            <div className="space-y-4">
              <div className="border-t border-dashed border-slate-200 pt-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">α╣Çα╕ëα╕₧α╕▓α╕░ Data Controller</span>
              </div>
              <Field label="α╕üα╕▓α╕úα╣âα╕èα╣ëα╕½α╕úα╕╖α╕¡α╣Çα╕¢α╕┤α╕öα╣Çα╕£α╕óα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕ùα╕╡α╣êα╣äα╕öα╣ëα╕úα╕▒α╕Üα╕óα╕üα╣Çα╕ºα╣ëα╕Öα╣äα╕íα╣êα╕òα╣ëα╕¡α╕çα╕éα╕¡α╕äα╕ºα╕▓α╕íα╕óα╕┤α╕Öα╕óα╕¡α╕í"
              >
                <textarea rows={2} value={sub.exemptDisclosure} onChange={e => set('exemptDisclosure', e.target.value)}
                  className={txa} />
              </Field>
              <Field label="α╕üα╕▓α╕úα╕¢α╕Åα╕┤α╣Çα╕¬α╕ÿα╕äα╕│α╕éα╕¡α╕½α╕úα╕╖α╕¡α╕äα╕│α╕äα╕▒α╕öα╕äα╣ëα╕▓α╕Öα╕üα╕▓α╕úα╣âα╕èα╣ëα╕¬α╕┤α╕ùα╕ÿα╕┤α╕éα╕¡α╕çα╣Çα╕êα╣ëα╕▓α╕éα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ"
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

// ΓöÇΓöÇΓöÇ Main export ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

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
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formType] = useState<FormType>('processor');
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [requestId, setRequestId] = useState<string | undefined>(editRequestId);

  // Part 1
  const [rec, setRec] = useState<RecorderInfo>({ name: '', address: '', email: '', phone: '' });

  // Part 2 - controller
  const [ownerName, setOwnerName] = useState('');
  // Part 2 - processor
  const [processorName, setProcessorName] = useState('');
  const [ctrlAddress, setCtrlAddress] = useState('');
  // Shared
  const [mainActivity, setMainActivity] = useState('');
  const [subs, setSubs] = useState<SubActivity[]>([newSub(0)]);

  // Security
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
          notifyError(detail || response.error || 'α╣éα╕½α╕Ñα╕ö DP Form α╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
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
        notifyError('α╣éα╕½α╕Ñα╕ö DP Form α╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
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
        notifyError('α╕üα╕úα╕╕α╕ôα╕▓α╣Çα╕éα╣ëα╕▓α╕¬α╕╣α╣êα╕úα╕░α╕Üα╕Üα╣âα╕½α╕íα╣êα╕üα╣êα╕¡α╕Öα╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣üα╕Üα╕Üα╕úα╣êα╕▓α╕ç');
        return;
      }

      if (!activityId) {
        notifyError('α╣äα╕íα╣êα╕₧α╕Ü ROPA α╕ùα╕╡α╣êα╕òα╣ëα╕¡α╕çα╕üα╕▓α╕úα╕éα╕¡α╣âα╕èα╣ëα╕çα╕▓α╕Ö');
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

        notifyError(detail || data.error || 'α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣üα╕Üα╕Üα╕úα╣êα╕▓α╕çα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
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

      router.push('/dc/my-ropa?notice=draft-saved&form=dp');
    } catch (error) {
      console.error(error);
      notifyError('α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣üα╕Üα╕Üα╕úα╣êα╕▓α╕çα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        notifyError('α╕üα╕úα╕╕α╕ôα╕▓α╣Çα╕éα╣ëα╕▓α╕¬α╕╣α╣êα╕úα╕░α╕Üα╕Üα╣âα╕½α╕íα╣êα╕üα╣êα╕¡α╕Öα╕¬α╣êα╕çα╕ƒα╕¡α╕úα╣îα╕í');
        return;
      }

      if (!activityId) {
        notifyError('α╣äα╕íα╣êα╕₧α╕Ü ROPA α╕ùα╕╡α╣êα╕òα╣ëα╕¡α╕çα╕üα╕▓α╕úα╕éα╕¡α╣âα╕èα╣ëα╕çα╕▓α╕Ö');
        return;
      }

      const firstSub = subs[0];

      if (!firstSub?.purpose?.trim()) {
        notifyError('α╕üα╕úα╕╕α╕ôα╕▓α╕üα╕úα╕¡α╕üα╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣î');
        return;
      }

      if (!firstSub?.scope?.trim()) {
        notifyError('α╕üα╕úα╕╕α╕ôα╕▓α╕üα╕úα╕¡α╕üα╕éα╕¡α╕Üα╣Çα╕éα╕òα╕üα╕▓α╕úα╣âα╕èα╣ëα╕çα╕▓α╕Öα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ');
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

        notifyError(detail || data.error || 'α╕¬α╣êα╕ç DP Form α╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
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
      notifyError('α╕¬α╣êα╕ç DP Form α╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
    }
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
        <h3 className="text-xl font-bold text-slate-800 mb-2">α╕¬α╣êα╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╣Çα╕úα╕╡α╕óα╕Üα╕úα╣ëα╕¡α╕óα╣üα╕Ñα╣ëα╕º</h3>
        <p className="text-sm text-slate-500 mb-3">α╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñα╕ûα╕╣α╕üα╕¬α╣êα╕çα╣Çα╕₧α╕╖α╣êα╕¡α╕úα╕¡α╕üα╕▓α╕úα╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Üα╕êα╕▓α╕ü DPO</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-700 font-medium mb-6">
          {isCtrl ? 'Data Controller' : 'Data Processor'} ┬╖ {mainActivity}
        </div>
        <br />
        <button onClick={() => {
          setStep(1); setSubmitted(false);
          setRec({ name: '', address: '', email: '', phone: '' });
          setMainActivity(''); setSubs([newSub(0)]);
          setOwnerName(''); setProcessorName(''); setCtrlAddress('');
        }} className="px-6 py-2.5 bg-blue-600 text-slate-700 text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          α╕¬α╕úα╣ëα╕▓α╕çα╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╣âα╕½α╕íα╣ê
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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200 ${s.id < step ? 'bg-blue-600 border-blue-600 text-slate-700 cursor-pointer' :
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
            <p className="text-xs text-slate-400">α╕¬α╣êα╕ºα╕Öα╕ùα╕╡α╣ê {step} / {STEPS.length}</p>
          </div>
          {formType && (
            <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full border ${isCtrl ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {isCtrl ? 'Data Controller Form' : 'Data Processor Form'}
            </span>
          )}
        </div>
      </div>

      {/* ΓöÇ Step 2: α╕£α╕╣α╣ëα╕Ñα╕çα╕Üα╕▒α╕Öα╕ùα╕╢α╕ü ΓöÇ */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">1</div>
            <div>
              <p className="text-sm font-semibold text-slate-800">α╕¬α╣êα╕ºα╕Öα╕ùα╕╡α╣ê 1: α╕úα╕▓α╕óα╕Ñα╕░α╣Çα╕¡α╕╡α╕óα╕öα╕éα╕¡α╕çα╕£α╕╣α╣ëα╕Ñα╕çα╕Üα╕▒α╕Öα╕ùα╕╢α╕ü ROPA</p>
              <p className="text-xs text-slate-400">α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕£α╕╣α╣ëα╕úα╕▒α╕Üα╕£α╕┤α╕öα╕èα╕¡α╕Üα╕üα╕▓α╕úα╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╕Öα╕╡α╣ë</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="α╕èα╕╖α╣êα╕¡-α╕Öα╕▓α╕íα╕¬α╕üα╕╕α╕Ñ / α╕èα╕╖α╣êα╕¡α╕¡α╕çα╕äα╣îα╕üα╕ú" required>
              <input type="text" value={rec.name} onChange={e => setRec(r => ({ ...r, name: e.target.value }))}
                className={inp} />
            </Field>
            <Field label="α╣Çα╕Üα╕¡α╕úα╣îα╣éα╕ùα╕úα╕¿α╕▒α╕₧α╕ùα╣î" required>
              <input type="tel" value={rec.phone} onChange={e => setRec(r => ({ ...r, phone: e.target.value }))}
                className={inp} />
            </Field>
          </div>
          <Field label="α╕ùα╕╡α╣êα╕¡α╕óα╕╣α╣ê" required >
            <textarea rows={2} value={rec.address} onChange={e => setRec(r => ({ ...r, address: e.target.value }))}
              className={txa} />
          </Field>
          <Field label="α╕¡α╕╡α╣Çα╕íα╕Ñ" required>
            <input type="email" value={rec.email} onChange={e => setRec(r => ({ ...r, email: e.target.value }))}
              className={inp} />
          </Field>
        </div>
      )}

      {/* ΓöÇ Step 3: α╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ ΓöÇ */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">2</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">α╕¬α╣êα╕ºα╕Öα╕ùα╕╡α╣ê 2: α╕òα╕▓α╕úα╕▓α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ</p>
                <p className="text-xs text-slate-400">α╕úα╕░α╕Üα╕╕α╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╕½α╕Ñα╕▒α╕üα╣üα╕Ñα╕░α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣îα╕óα╣êα╕¡α╕óα╕ùα╕▒α╣ëα╕çα╕½α╕íα╕ö</p>
              </div>
            </div>

            {isCtrl ? (
              <Field label="α╕èα╕╖α╣êα╕¡α╣Çα╕êα╣ëα╕▓α╕éα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╣êα╕ºα╕Öα╕Üα╕╕α╕äα╕äα╕Ñ" required >
                <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  className={inp} />
              </Field>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="α╕èα╕╖α╣êα╕¡α╕£α╕╣α╣ëα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╣êα╕ºα╕Öα╕Üα╕╕α╕äα╕äα╕Ñ" required >
                  <input type="text" value={processorName} onChange={e => setProcessorName(e.target.value)}
                    className={inp} />
                </Field>
                <Field label="α╕ùα╕╡α╣êα╕¡α╕óα╕╣α╣êα╕£α╕╣α╣ëα╕äα╕ºα╕Üα╕äα╕╕α╕íα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╣êα╕ºα╕Öα╕Üα╕╕α╕äα╕äα╕Ñ (α╕£α╕╣α╣ëα╕ºα╣êα╕▓α╕êα╣ëα╕▓α╕ç)" required >
                  <input type="text" value={ctrlAddress} onChange={e => setCtrlAddress(e.target.value)}
                    className={inp} />
                </Field>
              </div>
            )}

            <Field label="α╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñα╕½α╕Ñα╕▒α╕ü" required >
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
            α╣Çα╕₧α╕┤α╣êα╕íα╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣îα╕óα╣êα╕¡α╕ó
          </button>
        </div>
      )}

      {/* ΓöÇ Step 4: α╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╕úα╕▒α╕üα╕⌐α╕▓α╕äα╕ºα╕▓α╕íα╕¢α╕Ñα╕¡α╕öα╕áα╕▒α╕ó ΓöÇ */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">3</div>
            <div>
              <p className="text-sm font-semibold text-slate-800">α╕¬α╣êα╕ºα╕Öα╕ùα╕╡α╣ê 3: α╕äα╕│α╕¡α╕ÿα╕┤α╕Üα╕▓α╕óα╣Çα╕üα╕╡α╣êα╕óα╕ºα╕üα╕▒α╕Üα╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╕úα╕▒α╕üα╕⌐α╕▓α╕äα╕ºα╕▓α╕íα╕íα╕▒α╣êα╕Öα╕äα╕çα╕¢α╕Ñα╕¡α╕öα╕áα╕▒α╕ó</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="α╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╣Çα╕èα╕┤α╕çα╕¡α╕çα╕äα╣îα╕üα╕ú (Organizational)" >
              <textarea rows={4} value={secOrg} onChange={e => setSecOrg(e.target.value)}
                className={txa} />
            </Field>
            <Field label="α╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╣Çα╕èα╕┤α╕çα╣Çα╕ùα╕äα╕Öα╕┤α╕ä (Technical)" >
              <textarea rows={4} value={secTech} onChange={e => setSecTech(e.target.value)}
                className={txa} />
            </Field>
            <Field label="α╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╕ùα╕▓α╕çα╕üα╕▓α╕óα╕áα╕▓α╕₧ (Physical)" >
              <textarea rows={4} value={secPhysical} onChange={e => setSecPhysical(e.target.value)}
                className={txa} />
            </Field>
            <Field label="α╕üα╕▓α╕úα╕äα╕ºα╕Üα╕äα╕╕α╕íα╕üα╕▓α╕úα╣Çα╕éα╣ëα╕▓α╕ûα╕╢α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ (Access Control)" >
              <textarea rows={4} value={secAccess} onChange={e => setSecAccess(e.target.value)}
                className={txa} />
            </Field>
            <Field label="α╕üα╕▓α╕úα╕üα╕│α╕½α╕Öα╕öα╕½α╕Öα╣ëα╕▓α╕ùα╕╡α╣êα╕äα╕ºα╕▓α╕íα╕úα╕▒α╕Üα╕£α╕┤α╕öα╕èα╕¡α╕Üα╕éα╕¡α╕çα╕£α╕╣α╣ëα╣âα╕èα╣ëα╕çα╕▓α╕Ö" >
              <textarea rows={4} value={secUser} onChange={e => setSecUser(e.target.value)}
                className={txa} />
            </Field>
            <Field label="α╕íα╕▓α╕òα╕úα╕üα╕▓α╕úα╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Üα╕óα╣ëα╕¡α╕Öα╕½α╕Ñα╕▒α╕ç (Audit Trail)" >
              <textarea rows={4} value={secAudit} onChange={e => setSecAudit(e.target.value)}
                className={txa} />
            </Field>
          </div>
        </div>
      )}

      {/* ΓöÇ Step 5: α╕¬α╕úα╕╕α╕¢ ΓöÇ */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">α╕¬α╕úα╕╕α╕¢α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕üα╣êα╕¡α╕Öα╕¬α╣êα╕ç</p>
            <p className="text-xs text-slate-400 mt-0.5">α╕üα╕úα╕╕α╕ôα╕▓α╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Üα╕äα╕ºα╕▓α╕íα╕ûα╕╣α╕üα╕òα╣ëα╕¡α╕çα╕üα╣êα╕¡α╕Öα╕¬α╣êα╕ç DPO α╣Çα╕₧α╕╖α╣êα╕¡α╕úα╕¡α╕¡α╕Öα╕╕α╕íα╕▒α╕òα╕┤</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">α╕¢α╕úα╕░α╣Çα╕áα╕ùα╕ƒα╕¡α╕úα╣îα╕í</p>
                <span className={`text-sm font-bold ${isCtrl ? 'text-blue-700' : 'text-emerald-700'}`}>
                  {isCtrl ? 'Data Controller (α╕£α╕╣α╣ëα╕äα╕ºα╕Üα╕äα╕╕α╕íα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ)' : 'Data Processor (α╕£α╕╣α╣ëα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ)'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">α╕£α╕╣α╣ëα╕Ñα╕çα╕Üα╕▒α╕Öα╕ùα╕╢α╕ü</p>
                <p className="text-sm font-semibold text-slate-800">{rec.name || 'ΓÇö'}</p>
                <p className="text-xs text-slate-500">{rec.email} ┬╖ {rec.phone}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-500 mb-1 font-medium">α╕üα╕┤α╕êα╕üα╕úα╕úα╕íα╕üα╕▓α╕úα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñα╕½α╕Ñα╕▒α╕ü</p>
              <p className="text-base font-bold text-blue-800">{mainActivity || 'ΓÇö'}</p>
              <p className="text-xs text-blue-600 mt-1">
                {isCtrl ? `α╣Çα╕êα╣ëα╕▓α╕éα╕¡α╕çα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ: ${ownerName || 'ΓÇö'}` : `α╕£α╕╣α╣ëα╕¢α╕úα╕░α╕íα╕ºα╕Ñα╕£α╕Ñ: ${processorName || 'ΓÇö'} ┬╖ α╕£α╕╣α╣ëα╕ºα╣êα╕▓α╕êα╣ëα╕▓α╕ç: ${ctrlAddress || 'ΓÇö'}`}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣îα╕óα╣êα╕¡α╕ó ({subs.length} α╕úα╕▓α╕óα╕üα╕▓α╕ú)
              </p>
              <div className="space-y-2">
                {subs.map((s, i) => (
                  <div key={s.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">{s.purpose || '(α╕óα╕▒α╕çα╣äα╕íα╣êα╕úα╕░α╕Üα╕╕α╕ºα╕▒α╕òα╕ûα╕╕α╕¢α╕úα╕░α╕¬α╕çα╕äα╣î)'}</p>
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
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${s.transferAbroad === 'α╕íα╕╡' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                          {s.transferAbroad === 'α╕íα╕╡' ? `≡ƒîÉ α╣éα╕¡α╕Öα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ ΓåÆ ${s.transferCountry}` : 'Γ£ô α╣äα╕íα╣êα╣éα╕¡α╕Öα╕òα╣êα╕▓α╕çα╕¢α╕úα╕░α╣Çα╕ùα╕¿'}
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
                α╕½α╕íα╕▓α╕óα╣Çα╕½α╕òα╕╕:
              </span> α╣Çα╕íα╕╖α╣êα╕¡α╕¬α╣êα╕çα╣üα╕Ñα╣ëα╕º α╕¬α╕ûα╕▓α╕Öα╕░α╕êα╕░α╣Çα╕¢α╕Ñα╕╡α╣êα╕óα╕Öα╣Çα╕¢α╣çα╕Ö &ldquo;α╕úα╕¡α╕üα╕▓α╕úα╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Ü (REVIEW)&rdquo;
              α╣üα╕Ñα╕░ DPO α╕êα╕░α╕òα╣ëα╕¡α╕çα╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Üα╣üα╕Ñα╕░α╕¡α╕Öα╕╕α╕íα╕▒α╕òα╕┤α╕üα╣êα╕¡α╕Öα╕êα╕╢α╕çα╕êα╕░α╕íα╕╡α╕¬α╕ûα╕▓α╕Öα╕░ ACTIVE
            </div>
          </div>
        </div>
      )}

      {/* ΓöÇ Footer ΓöÇ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button type="button" onClick={handleSaveDraft}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          {draftSaved
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg><span className="text-emerald-600">α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣üα╕Üα╕Üα╕úα╣êα╕▓α╕çα╣üα╕Ñα╣ëα╕º</span></>
            : 'α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣üα╕Üα╕Üα╕úα╣êα╕▓α╕ç'}
        </button>
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button type="button" onClick={prev}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              ΓåÉ α╕óα╣ëα╕¡α╕Öα╕üα╕Ñα╕▒α╕Ü
            </button>
          )}
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={next}
              disabled={!canNext()}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              α╕ûα╕▒α╕öα╣äα╕¢ ΓåÆ
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
              α╕¬α╣êα╕çα╣Çα╕₧α╕╖α╣êα╕¡α╕úα╕¡α╕üα╕▓α╕úα╕òα╕úα╕ºα╕êα╕¬α╕¡α╕Ü
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
