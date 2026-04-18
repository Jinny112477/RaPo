'use client';

import { useState } from 'react';
import { mockActivities } from '@/lib/mockData';
import { StatusBadge, RiskBadge } from '@/components/StatusBadge';
import { Activity } from '@/types';

const pendingActivities = mockActivities.filter((a) => a.status === 'REVIEW');

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

function ReviewModal({ activity, onClose, onApprove, onReject }: {
  activity: Activity;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{activity.activityName}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{activity.department} · {activity.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex gap-3 flex-wrap">
            <StatusBadge status={activity.status} size="md" />
            <RiskBadge level={activity.riskLevel} size="md" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Legal Basis', value: activity.legalBasis },
              { label: 'Retention Period', value: activity.retentionPeriod },
              { label: 'Data Subjects', value: activity.dataSubject.join(', ') },
              { label: 'Personal Data', value: activity.personalData.join(', ') },
              { label: 'Processing Operations', value: activity.processing.join(', ') },
              { label: 'Last Updated', value: activity.updatedAt },
            ].map((f) => (
              <div key={f.label} className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">{f.label}</p>
                <p className="text-sm font-medium text-slate-700">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Purpose of Processing</p>
            <p className="text-sm text-slate-700">{activity.purpose}</p>
          </div>

          {rejecting && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rejection Reason <span className="text-red-500">*</span></label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={3}
                className="w-full px-4 py-3 text-sm border border-red-200 rounded-lg bg-red-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none transition-all"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            Close
          </button>
          <div className="flex gap-2">
            {!rejecting ? (
              <>
                <button
                  onClick={() => setRejecting(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <XIcon /> Reject
                </button>
                <button
                  onClick={() => onApprove(activity.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <CheckIcon /> Approve
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setRejecting(false)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => reason.trim() && onReject(activity.id, reason)}
                  disabled={!reason.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <XIcon /> Confirm Rejection
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DPOReviewPage() {
  const [queue, setQueue] = useState(pendingActivities);
  const [viewing, setViewing] = useState<Activity | null>(null);
  const [processed, setProcessed] = useState<{ id: string; action: 'approved' | 'rejected' }[]>([]);

  const handleApprove = (id: string) => {
    setQueue((q) => q.filter((a) => a.id !== id));
    setProcessed((p) => [...p, { id, action: 'approved' }]);
    setViewing(null);
  };

  const handleReject = (id: string, _reason: string) => {
    setQueue((q) => q.filter((a) => a.id !== id));
    setProcessed((p) => [...p, { id, action: 'rejected' }]);
    setViewing(null);
  };

  return (
    <div className="space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Review Queue</h1>
        <p className="text-sm text-slate-500 mt-0.5">Activities pending DPO review and approval</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: queue.length, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
          { label: 'Approved Today', value: processed.filter(p => p.action === 'approved').length, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Rejected Today', value: processed.filter(p => p.action === 'rejected').length, color: 'text-red-700', bg: 'bg-red-50 border-red-100' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.bg} shadow-sm p-4 text-center`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Pending Activities ({queue.length})</h3>
          {queue.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Requires attention
            </span>
          )}
        </div>

        {queue.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <h4 className="text-base font-semibold text-slate-700 mb-1">All caught up!</h4>
            <p className="text-sm text-slate-400">No activities pending review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {queue.map((act) => (
              <div key={act.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-slate-400">{act.id}</span>
                    <RiskBadge level={act.riskLevel} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{act.activityName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{act.department} · Submitted {act.updatedAt}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setViewing(act)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <EyeIcon /> Review
                  </button>
                  <button
                    onClick={() => handleApprove(act.id)}
                    className="p-2 rounded-lg text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    title="Approve"
                  >
                    <CheckIcon />
                  </button>
                  <button
                    onClick={() => { setViewing(act); }}
                    className="p-2 rounded-lg text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                    title="Reject"
                  >
                    <XIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Processed */}
      {processed.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Recently Processed</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {processed.map(({ id, action }) => {
              const act = mockActivities.find((a) => a.id === id);
              if (!act) return null;
              return (
                <div key={id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${action === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                    {action === 'approved' ? <CheckIcon /> : <XIcon />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{act.activityName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{act.department}</p>
                  </div>
                  <span className={`text-xs font-semibold capitalize ${action === 'approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {action}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {viewing && (
        <ReviewModal
          activity={viewing}
          onClose={() => setViewing(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
