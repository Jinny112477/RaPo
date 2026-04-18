'use client';

import { useState } from 'react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ip: string;
  severity: 'info' | 'warning' | 'critical';
}

const mockLogs: AuditLog[] = [
  { id: 'LOG-001', timestamp: '2024-03-15 14:32:01', user: 'Sarah Chen', role: 'admin', action: 'USER_CREATED', entity: 'User', entityId: 'USR-006', details: 'New user account created for james.lee@company.com', ip: '10.0.1.24', severity: 'info' },
  { id: 'LOG-002', timestamp: '2024-03-15 13:45:22', user: 'Elena Vasquez', role: 'dpo', action: 'ACTIVITY_APPROVED', entity: 'Activity', entityId: 'ACT-001', details: 'Employee Payroll Processing approved and set to ACTIVE', ip: '10.0.1.18', severity: 'info' },
  { id: 'LOG-003', timestamp: '2024-03-15 12:10:05', user: 'Michael Torres', role: 'dataOwner', action: 'ACTIVITY_SUBMITTED', entity: 'Activity', entityId: 'ACT-002', details: 'Customer Analytics Platform submitted for review', ip: '10.0.2.55', severity: 'info' },
  { id: 'LOG-004', timestamp: '2024-03-15 11:32:44', user: 'Sarah Chen', role: 'admin', action: 'PERMISSION_CHANGED', entity: 'User', entityId: 'USR-003', details: 'User role updated from dataOwner to dpo', ip: '10.0.1.24', severity: 'warning' },
  { id: 'LOG-005', timestamp: '2024-03-15 10:05:30', user: 'Unknown', role: 'N/A', action: 'LOGIN_FAILED', entity: 'System', entityId: 'AUTH', details: 'Failed login attempt for email: admin@company.com (3 attempts)', ip: '203.45.67.89', severity: 'critical' },
  { id: 'LOG-006', timestamp: '2024-03-15 09:48:12', user: 'Anna Williams', role: 'dataOwner', action: 'ACTIVITY_DELETED', entity: 'Activity', entityId: 'ACT-009', details: 'Draft activity "Internal HR Survey" deleted', ip: '10.0.3.12', severity: 'warning' },
  { id: 'LOG-007', timestamp: '2024-03-14 17:22:09', user: 'Robert Nguyen', role: 'auditor', action: 'REPORT_EXPORTED', entity: 'Report', entityId: 'RPT-007', details: 'Full ROPA export downloaded as PDF', ip: '10.0.1.30', severity: 'info' },
  { id: 'LOG-008', timestamp: '2024-03-14 16:05:55', user: 'Elena Vasquez', role: 'dpo', action: 'ACTIVITY_REJECTED', entity: 'Activity', entityId: 'ACT-007', details: 'CRM Lead Management rejected: insufficient legal basis documentation', ip: '10.0.1.18', severity: 'info' },
  { id: 'LOG-009', timestamp: '2024-03-14 14:30:00', user: 'Sarah Chen', role: 'admin', action: 'SYSTEM_CONFIG_CHANGED', entity: 'System', entityId: 'CONFIG', details: 'Retention policy default updated from 3yr to 5yr', ip: '10.0.1.24', severity: 'warning' },
  { id: 'LOG-010', timestamp: '2024-03-14 11:15:20', user: 'Priya Sharma', role: 'dataOwner', action: 'ACTIVITY_CREATED', entity: 'Activity', entityId: 'ACT-004', details: 'New draft activity created: Vendor Contract Management', ip: '10.0.2.77', severity: 'info' },
];

const severityConfig = {
  info: { label: 'Info', dot: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  warning: { label: 'Warning', dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  critical: { label: 'Critical', dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};

const actionColors: Record<string, string> = {
  USER_CREATED: 'text-blue-600 bg-blue-50',
  ACTIVITY_APPROVED: 'text-emerald-600 bg-emerald-50',
  ACTIVITY_SUBMITTED: 'text-slate-600 bg-slate-100',
  PERMISSION_CHANGED: 'text-amber-600 bg-amber-50',
  LOGIN_FAILED: 'text-red-600 bg-red-50',
  ACTIVITY_DELETED: 'text-orange-600 bg-orange-50',
  REPORT_EXPORTED: 'text-purple-600 bg-purple-50',
  ACTIVITY_REJECTED: 'text-red-600 bg-red-50',
  SYSTEM_CONFIG_CHANGED: 'text-amber-700 bg-amber-50',
  ACTIVITY_CREATED: 'text-blue-600 bg-blue-50',
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = mockLogs.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchSev = severity === 'all' || log.severity === severity;
    return matchSearch && matchSev;
  });

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            System activity trail — read-only access
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto">
          <DownloadIcon />
          Export Logs
        </button>
      </div>

      {/* Severity overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Info', key: 'info' as const, count: mockLogs.filter(l => l.severity === 'info').length, color: 'text-blue-700', bg: 'border-blue-100' },
          { label: 'Warnings', key: 'warning' as const, count: mockLogs.filter(l => l.severity === 'warning').length, color: 'text-amber-700', bg: 'border-amber-100' },
          { label: 'Critical', key: 'critical' as const, count: mockLogs.filter(l => l.severity === 'critical').length, color: 'text-red-700', bg: 'border-red-100' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSeverity((prev) => prev === s.key ? 'all' : s.key)}
            className={`text-left p-4 rounded-xl border shadow-sm bg-white transition-all ${
              severity === s.key ? 'ring-2 ring-blue-400 ring-offset-1' : s.bg
            } hover:shadow-md`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label} events</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-full transition-all"
          />
        </div>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as typeof severity)}
          className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        >
          <option value="all">All Severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500 font-medium">{filtered.length} entries found</p>
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.map((log) => {
            const sc = severityConfig[log.severity];
            const isOpen = expanded === log.id;
            return (
              <div key={log.id} className={`transition-colors ${isOpen ? 'bg-slate-50' : 'hover:bg-slate-50/40'}`}>
                {/* Main row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : log.id)}
                  className="w-full flex items-start gap-4 px-5 py-3.5 text-left"
                >
                  {/* Severity dot */}
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />

                  {/* Timestamp */}
                  <span className="font-mono text-xs text-slate-400 flex-shrink-0 mt-0.5 hidden sm:block w-36">
                    {log.timestamp.split(' ')[1]}
                  </span>

                  {/* Action + Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${actionColors[log.action] ?? 'text-slate-600 bg-slate-100'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{log.details}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{log.user}</span>
                      <span>·</span>
                      <span className="capitalize">{log.role}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline">{log.entity} {log.entityId}</span>
                    </div>
                  </div>

                  {/* Severity badge */}
                  <span className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${sc.bg} ${sc.text} flex-shrink-0`}>
                    {sc.label}
                  </span>

                  {/* Expand chevron */}
                  <svg
                    width="14" height="14"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-5 pb-4 ml-6">
                    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
                        {[
                          { label: 'Log ID', value: log.id },
                          { label: 'Date', value: log.timestamp.split(' ')[0] },
                          { label: 'IP Address', value: log.ip, mono: true },
                          { label: 'Entity ID', value: log.entityId, mono: true },
                        ].map((f) => (
                          <div key={f.label} className="px-4 py-3">
                            <p className="text-xs text-slate-400 mb-0.5">{f.label}</p>
                            <p className={`text-sm text-slate-700 font-medium ${f.mono ? 'font-mono text-xs' : ''}`}>{f.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
