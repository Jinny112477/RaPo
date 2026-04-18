'use client';

import { useState } from 'react';

interface Processor {
  id: string;
  name: string;
  type: 'Cloud Provider' | 'SaaS' | 'Contractor' | 'Partner';
  country: string;
  contract: string;
  dpa: boolean;
  activities: number;
  status: 'active' | 'inactive' | 'review';
  contact: string;
  updatedAt: string;
}

const mockProcessors: Processor[] = [
  { id: 'PRC-001', name: 'AWS (Amazon Web Services)', type: 'Cloud Provider', country: 'USA', contract: '2025-12-31', dpa: true, activities: 12, status: 'active', contact: 'aws-dpa@amazon.com', updatedAt: '2024-03-01' },
  { id: 'PRC-002', name: 'Salesforce Inc.', type: 'SaaS', country: 'USA', contract: '2024-09-30', dpa: true, activities: 4, status: 'active', contact: 'privacy@salesforce.com', updatedAt: '2024-02-15' },
  { id: 'PRC-003', name: 'Cognizant Technology', type: 'Contractor', country: 'India', contract: '2024-06-30', dpa: false, activities: 2, status: 'review', contact: 'legal@cognizant.com', updatedAt: '2024-03-10' },
  { id: 'PRC-004', name: 'Microsoft Azure', type: 'Cloud Provider', country: 'USA', contract: '2025-06-30', dpa: true, activities: 8, status: 'active', contact: 'azure-dpa@microsoft.com', updatedAt: '2024-01-20' },
  { id: 'PRC-005', name: 'Accenture Ltd.', type: 'Partner', country: 'Ireland', contract: '2024-03-31', dpa: true, activities: 3, status: 'inactive', contact: 'dpa@accenture.com', updatedAt: '2024-03-12' },
];

const typeColors: Record<string, string> = {
  'Cloud Provider': 'bg-blue-50 text-blue-700 border-blue-200',
  'SaaS': 'bg-purple-50 text-purple-700 border-purple-200',
  'Contractor': 'bg-amber-50 text-amber-700 border-amber-200',
  'Partner': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  active: { label: 'Active', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  inactive: { label: 'Inactive', dot: 'bg-slate-400', text: 'text-slate-500' },
  review: { label: 'Under Review', dot: 'bg-amber-500', text: 'text-amber-700' },
};

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function ProcessorPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Processor | null>(null);

  const filtered = mockProcessors.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Processors</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage third-party processors and data processing agreements
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 self-start sm:self-auto">
          <PlusIcon />
          Add Processor
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Processors', value: mockProcessors.length, color: 'text-slate-800' },
          { label: 'Active', value: mockProcessors.filter(p => p.status === 'active').length, color: 'text-emerald-700' },
          { label: 'DPA Signed', value: mockProcessors.filter(p => p.dpa).length, color: 'text-blue-700' },
          { label: 'Needs Review', value: mockProcessors.filter(p => p.status === 'review' || !p.dpa).length, color: 'text-amber-700' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* Table */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Processor Registry</h3>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><SearchIcon /></span>
              <input
                type="text"
                placeholder="Search processors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-48 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Processor', 'Type', 'Country', 'DPA', 'Activities', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((proc) => {
                  const sc = statusConfig[proc.status];
                  const isSelected = selected?.id === proc.id;
                  return (
                    <tr
                      key={proc.id}
                      onClick={() => setSelected(isSelected ? null : proc)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50/60'}`}
                    >
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{proc.name}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{proc.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[proc.type]}`}>
                          {proc.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-600">{proc.country}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${proc.dpa ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                          {proc.dpa ? <CheckIcon /> : <XIcon />}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-600">{proc.activities}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelected(isSelected ? null : proc); }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          {isSelected ? 'Close' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="xl:w-72 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Processor Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <XIcon />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-base font-semibold text-slate-800 mb-0.5">{selected.name}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[selected.type]}`}>
                  {selected.type}
                </span>
              </div>

              {[
                { label: 'Processor ID', value: selected.id, mono: true },
                { label: 'Country', value: selected.country },
                { label: 'Contact', value: selected.contact },
                { label: 'Contract Expiry', value: selected.contract },
                { label: 'Activities', value: `${selected.activities} linked activities` },
              ].map((row) => (
                <div key={row.label} className="flex flex-col gap-0.5">
                  <p className="text-xs text-slate-400">{row.label}</p>
                  <p className={`text-sm font-medium text-slate-700 ${row.mono ? 'font-mono text-xs' : ''}`}>
                    {row.value}
                  </p>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className={`flex items-center gap-2 p-2.5 rounded-lg ${selected.dpa ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center ${selected.dpa ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-600'}`}>
                    {selected.dpa ? <CheckIcon /> : <XIcon />}
                  </span>
                  <span className={`text-xs font-medium ${selected.dpa ? 'text-emerald-700' : 'text-red-600'}`}>
                    {selected.dpa ? 'DPA Agreement Signed' : 'DPA Agreement Missing'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Edit
                </button>
                <button className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  View Activities
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
