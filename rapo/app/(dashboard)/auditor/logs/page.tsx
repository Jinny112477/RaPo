'use client';

import { useState } from 'react';

interface Change {
  field: string;
  before: string;
  after: string;
}

interface History {
  version: number;
  editedBy: string;
  role: string;
  editedAt: string;
  changes: Change[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  history?: History[];
}

const mockLogs: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2568-03-15 14:32:01',
    user: 'jikko',
    role: 'admin',
    action: 'USER_CREATED',
    entity: 'User',
    entityId: 'USR-002',
    details: 'สร้างบัญชีผู้ใช้ใหม่',
    severity: 'info',
    history: [
      {
        version: 2,
        editedBy: 'jikko',
        role: 'admin',
        editedAt: '2568-03-15 14:32:01',
        changes: [
          { field: 'status', before: 'inactive', after: 'active' },
        ],
      },
      {
        version: 1,
        editedBy: 'jin',
        role: 'dpo',
        editedAt: '2568-03-14 10:00:00',
        changes: [
          { field: 'status', before: '-', after: 'inactive' },
        ],
      },
    ],
  },
  {
    id: 'LOG-002',
    timestamp: '2568-03-15 13:45:22',
    user: 'jin',
    role: 'dpo',
    action: 'ACTIVITY_APPROVED',
    entity: 'Activity',
    entityId: 'ACT-001',
    details: 'อนุมัติ Activity',
    severity: 'info',
    history: [],
  },
];

const severityStyle = {
  info: 'text-blue-600 bg-blue-50',
  warning: 'text-amber-600 bg-amber-50',
  critical: 'text-red-600 bg-red-50',
};

export default function AuditLogsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<'all' | 'info' | 'warning' | 'critical'>('all');

  const filtered = mockLogs.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    const matchSeverity = severity === 'all' || log.severity === severity;

    return matchSearch && matchSeverity;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
        <p className="text-sm text-slate-500">
          System activity trail (read-only)
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm w-full sm:max-w-xs"
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as any)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">All Severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>

        <span className="text-xs text-slate-400 self-center">
          {filtered.length} entries
        </span>
      </div>

      {/* Logs */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {filtered.map((log) => {
          const isOpen = expanded === log.id;

          return (
            <div key={log.id} className="border-b last:border-none">

              {/* Main Row */}
              <button
                onClick={() => setExpanded(isOpen ? null : log.id)}
                className="w-full text-left px-6 py-4 hover:bg-slate-50 transition"
              >
                <div className="flex justify-between items-start gap-4">

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${severityStyle[log.severity]}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-slate-600">
                        {log.details}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex gap-2 flex-wrap">
                      <span>{log.user}</span>
                      <span>·</span>
                      <span className="capitalize">{log.role}</span>
                      <span>·</span>
                      <span>{log.entity}</span>
                      <span>·</span>
                      <span className="font-mono">{log.entityId}</span>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </div>
                </div>
              </button>

              {/* Expanded */}
              {isOpen && (
                <div className="px-6 pb-5 bg-slate-50 space-y-4">

                  {log.history && log.history.length > 0 ? (
                    <div>
                      <div className="font-semibold text-slate-700 mb-3 text-sm">
                        Edit History ({log.history.length})
                      </div>

                      <div className="space-y-3">
                        {log.history.map((h) => (
                          <div key={h.version} className="bg-white border rounded-lg p-3">

                            <div className="flex justify-between text-xs text-slate-500 mb-2">
                              <div>
                                v{h.version} · {h.editedBy} ({h.role})
                              </div>
                              <div>{h.editedAt}</div>
                            </div>

                            {h.changes.map((c, i) => (
                              <div key={i} className="grid grid-cols-3 gap-2 text-xs mb-1">
                                <div className="font-mono text-slate-500">{c.field}</div>
                                <div className="bg-red-50 px-2 py-1 rounded text-red-600">{c.before}</div>
                                <div className="bg-green-50 px-2 py-1 rounded text-green-600">{c.after}</div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      No edit history
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}