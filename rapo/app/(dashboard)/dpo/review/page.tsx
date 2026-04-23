'use client';

import { useState } from 'react';
import { useRopa } from '@/lib/ropaContext';
import { StatusBadge, RiskBadge } from '@/components/StatusBadge';
import { Activity, DpRecord } from '@/types';

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

// ─── Modal ดู DC ────────────────────────────────────────────────────────────────
function DCModal({ activity, onClose, onApprove, onReject }: {
  activity: Activity;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <div>
            <p className="text-xs font-semibold text-blue-600 mb-0.5">DC Form</p>
            <h2 className="text-base font-bold text-gray-800">{activity.activityName}</h2>
            <p className="text-xs text-gray-500">{activity.department} · {activity.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100">
            <XIcon />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={activity.status} size="md" />
            <RiskBadge level={activity.riskLevel} size="md" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'ฐานกฎหมาย', value: activity.legalBasis },
              { label: 'ระยะเวลาเก็บ', value: activity.retentionPeriod },
              { label: 'เจ้าของข้อมูล', value: activity.dataSubject.join(', ') },
              { label: 'ข้อมูลส่วนบุคคล', value: activity.personalData.join(', ') },
              { label: 'การประมวลผล', value: activity.processing.join(', ') },
              { label: 'อัปเดตล่าสุด', value: activity.updatedAt },
            ].map(f => (
              <div key={f.label} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                <p className="text-sm font-medium text-gray-700">{f.value}</p>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">วัตถุประสงค์</p>
            <p className="text-sm text-gray-700">{activity.purpose}</p>
          </div>

          {rejecting && (
            <div>
              <label className="text-sm font-medium text-gray-700">เหตุผลที่ปฏิเสธ <span className="text-red-500">*</span></label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                rows={3} placeholder="ระบุเหตุผล..."
                className="w-full mt-1 px-3 py-2 text-sm border border-red-200 rounded-lg bg-red-50 resize-none focus:outline-none focus:ring-1 focus:ring-red-400" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">ปิด</button>
          <div className="flex gap-2">
            {!rejecting ? (
              <>
                <button onClick={() => setRejecting(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                  <XIcon /> ปฏิเสธ
                </button>
                <button onClick={() => onApprove(activity.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                  <CheckIcon /> อนุมัติ
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setRejecting(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">ยกเลิก</button>
                <button onClick={() => reason.trim() && onReject(activity.id, reason)}
                  disabled={!reason.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                  <XIcon /> ยืนยันปฏิเสธ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal ดู DP ────────────────────────────────────────────────────────────────
function DPModal({ dp, onClose, onApprove, onReject }: {
  dp: DpRecord;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  // นำเข้า activities จาก Context เพื่อค้นหา DC record ที่ผูกอยู่
  const { activities } = useRopa();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const linkedActivity = activities.find(a => a.id === dp.activityId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <div>
            <p className="text-xs font-semibold text-emerald-600 mb-0.5">DP Form</p>
            <h2 className="text-base font-bold text-gray-800">{dp.processorName}</h2>
            <p className="text-xs text-gray-500">{dp.id} · ผูกกับ {dp.activityId}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100"><XIcon /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* DC record ที่ผูกอยู่ */}
          {linkedActivity && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 mb-1">DC Record ที่ผูกอยู่</p>
              <p className="text-sm font-medium text-gray-800">{linkedActivity.activityName}</p>
              <p className="text-xs text-gray-500">{linkedActivity.department}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'ชื่อผู้ประมวลผล', value: dp.processorName },
              { label: 'วันที่สร้าง', value: dp.createdAt },
              { label: 'สร้างโดย', value: dp.createdBy },
              { label: 'สถานะ', value: dp.status },
            ].map(f => (
              <div key={f.label} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                <p className="text-sm font-medium text-gray-700">{f.value}</p>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">วัตถุประสงค์</p>
            <p className="text-sm text-gray-700">{dp.purpose}</p>
          </div>

          {rejecting && (
            <div>
              <label className="text-sm font-medium text-gray-700">เหตุผลที่ปฏิเสธ <span className="text-red-500">*</span></label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                rows={3} placeholder="ระบุเหตุผล..."
                className="w-full mt-1 px-3 py-2 text-sm border border-red-200 rounded-lg bg-red-50 resize-none focus:outline-none focus:ring-1 focus:ring-red-400" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">ปิด</button>
          <div className="flex gap-2">
            {!rejecting ? (
              <>
                <button onClick={() => setRejecting(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                  <XIcon /> ปฏิเสธ
                </button>
                <button onClick={() => onApprove(dp.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                  <CheckIcon /> อนุมัติ
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setRejecting(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">ยกเลิก</button>
                <button onClick={() => reason.trim() && onReject(dp.id, reason)}
                  disabled={!reason.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                  <XIcon /> ยืนยันปฏิเสธ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function DPOReviewPage() {
  const [activeTab, setActiveTab] = useState<'dc' | 'dp'>('dc');

  // ดึงข้อมูลและฟังก์ชันจาก Context
  const { activities, dpRecords, updateActivity, updateDpRecord } = useRopa();

  // เปลี่ยนมาใช้ข้อมูลจาก Context แทน mockData
  const [dcQueue, setDcQueue] = useState(activities.filter(a => a.status === 'REVIEW'));
  const [dcProcessed, setDcProcessed] = useState<{ id: string; action: 'approved' | 'rejected' }[]>([]);
  const [viewingDC, setViewingDC] = useState<Activity | null>(null);

  const [dpQueue, setDpQueue] = useState(dpRecords.filter(d => d.status === 'PENDING'));
  const [dpProcessed, setDpProcessed] = useState<{ id: string; action: 'approved' | 'rejected' }[]>([]);
  const [viewingDP, setViewingDP] = useState<DpRecord | null>(null);

  // DC handlers (อัปเดตลง Global Context ด้วย)
  const handleDCApprove = (id: string) => {
    updateActivity(id, { status: 'ACTIVE' });
    setDcQueue(q => q.filter(a => a.id !== id));
    setDcProcessed(p => [...p, { id, action: 'approved' }]);
    setViewingDC(null);
  };
  
  const handleDCReject = (id: string, reason: string) => {
    updateActivity(id, { status: 'REJECTED', rejectionReason: reason });
    setDcQueue(q => q.filter(a => a.id !== id));
    setDcProcessed(p => [...p, { id, action: 'rejected' }]);
    setViewingDC(null);
  };

  // DP handlers (อัปเดตลง Global Context ด้วย)
  const handleDPApprove = (id: string) => {
    updateDpRecord(id, { status: 'APPROVED' });
    setDpQueue(q => q.filter(d => d.id !== id));
    setDpProcessed(p => [...p, { id, action: 'approved' }]);
    setViewingDP(null);
  };
  
  const handleDPReject = (id: string, reason: string) => {
    updateDpRecord(id, { status: 'REJECTED', rejectionReason: reason });
    setDpQueue(q => q.filter(d => d.id !== id));
    setDpProcessed(p => [...p, { id, action: 'rejected' }]);
    setViewingDP(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Approval Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          ตรวจสอบและอนุมัติ ROPA Form ของ DC และ DP
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Form DC รออนุมัติ', value: dcQueue.length, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
          { label: 'Form DP รออนุมัติ', value: dpQueue.length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'อนุมัติวันนี้', value: dcProcessed.filter(p => p.action === 'approved').length + dpProcessed.filter(p => p.action === 'approved').length, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'ปฏิเสธวันนี้', value: dcProcessed.filter(p => p.action === 'rejected').length + dpProcessed.filter(p => p.action === 'rejected').length, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.bg} p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('dc')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all
            ${activeTab === 'dc'
              ? 'bg-[#203690] text-white border-[#203690]'
              : 'bg-white text-gray-600 border-gray-300 hover:border-[#203690]'}`}>
          DC Form
          {dcQueue.length > 0 && (
            <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full">
              {dcQueue.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('dp')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all
            ${activeTab === 'dp'
              ? 'bg-[#203690] text-white border-[#203690]'
              : 'bg-white text-gray-600 border-gray-300 hover:border-[#203690]'}`}>
          DP Form
          {dpQueue.length > 0 && (
            <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full">
              {dpQueue.length}
            </span>
          )}
        </button>
      </div>

      {/* DC TAB */}
      {activeTab === 'dc' && (
        <div className="bg-white border border-black rounded-md overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">DC Form รออนุมัติ ({dcQueue.length})</p>
            {dcQueue.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-yellow-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                รอดำเนินการ
              </span>
            )}
          </div>
          {dcQueue.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm"> ไม่มี DC Form ที่รออนุมัติ</div>
          ) : (
            <div className="divide-y">
              {dcQueue.map(act => (
                <div key={act.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{act.id}</span>
                      <RiskBadge level={act.riskLevel} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{act.activityName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{act.department} · {act.owner} · {act.updatedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewingDC(act)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
                      <EyeIcon /> ดู
                    </button>
                    <button onClick={() => handleDCApprove(act.id)}
                      className="p-2 rounded-lg text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100" title="อนุมัติ">
                      <CheckIcon />
                    </button>
                    <button onClick={() => setViewingDC(act)}
                      className="p-2 rounded-lg text-red-500 bg-red-50 border border-red-200 hover:bg-red-100" title="ปฏิเสธ">
                      <XIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recently processed DC */}
          {dcProcessed.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="px-5 py-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase">ดำเนินการแล้ว</p>
              </div>
              {dcProcessed.map(({ id, action }) => {
                const act = activities.find(a => a.id === id); // ใช้ activities จาก Context
                if (!act) return null;
                return (
                  <div key={id} className="flex items-center gap-3 px-5 py-3 border-t">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${action === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                      {action === 'approved' ? <CheckIcon /> : <XIcon />}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{act.activityName}</p>
                      <p className="text-xs text-gray-400">{act.department}</p>
                    </div>
                    <span className={`text-xs font-semibold ${action === 'approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {action === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DP TAB */}
      {activeTab === 'dp' && (
        <div className="bg-white border border-black rounded-md overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">DP Form รออนุมัติ ({dpQueue.length})</p>
            {dpQueue.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-yellow-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                รอดำเนินการ
              </span>
            )}
          </div>
          {dpQueue.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm"> ไม่มี DP Form ที่รออนุมัติ</div>
          ) : (
            <div className="divide-y">
              {dpQueue.map(dp => {
                const linked = activities.find(a => a.id === dp.activityId); // ใช้ activities จาก Context
                return (
                  <div key={dp.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">{dp.id}</span>
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                          ผูกกับ {dp.activityId}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{dp.processorName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {linked?.activityName} · สร้างโดย {dp.createdBy} · {dp.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewingDP(dp)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
                        <EyeIcon /> ดู
                      </button>
                      <button onClick={() => handleDPApprove(dp.id)}
                        className="p-2 rounded-lg text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100" title="อนุมัติ">
                        <CheckIcon />
                      </button>
                      <button onClick={() => setViewingDP(dp)}
                        className="p-2 rounded-lg text-red-500 bg-red-50 border border-red-200 hover:bg-red-100" title="ปฏิเสธ">
                        <XIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {dpProcessed.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="px-5 py-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase">ดำเนินการแล้ว</p>
              </div>
              {dpProcessed.map(({ id, action }) => {
                const dp = dpRecords.find((d: DpRecord) => d.id === id); // ใช้ dpRecords จาก Context
                if (!dp) return null;
                return (
                  <div key={id} className="flex items-center gap-3 px-5 py-3 border-t">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${action === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                      {action === 'approved' ? <CheckIcon /> : <XIcon />}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{dp.processorName}</p>
                      <p className="text-xs text-gray-400">{dp.activityId}</p>
                    </div>
                    <span className={`text-xs font-semibold ${action === 'approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {action === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {viewingDC && (
        <DCModal activity={viewingDC} onClose={() => setViewingDC(null)}
          onApprove={handleDCApprove} onReject={handleDCReject} />
      )}
      {viewingDP && (
        <DPModal dp={viewingDP} onClose={() => setViewingDP(null)}
          onApprove={handleDPApprove} onReject={handleDPReject} />
      )}
    </div>
  );
}