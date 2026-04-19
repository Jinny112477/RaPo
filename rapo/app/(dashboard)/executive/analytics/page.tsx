'use client';

import { mockActivities } from '@/lib/mockData';
import { RiskBadge, StatusBadge } from '@/components/StatusBadge';

const riskBreakdown = [
  { label: 'Low', count: mockActivities.filter(a => a.riskLevel === 'LOW').length, color: 'bg-emerald-500', light: 'bg-emerald-100 text-emerald-700' },
  { label: 'Medium', count: mockActivities.filter(a => a.riskLevel === 'MEDIUM').length, color: 'bg-amber-500', light: 'bg-amber-100 text-amber-700' },
  { label: 'High', count: mockActivities.filter(a => a.riskLevel === 'HIGH').length, color: 'bg-orange-500', light: 'bg-orange-100 text-orange-700' },
  { label: 'Critical', count: mockActivities.filter(a => a.riskLevel === 'CRITICAL').length, color: 'bg-red-500', light: 'bg-red-100 text-red-700' },
];

const statusBreakdown = [
  { label: 'Active', count: mockActivities.filter(a => a.status === 'ACTIVE').length, color: 'bg-emerald-500' },
  { label: 'Review', count: mockActivities.filter(a => a.status === 'REVIEW').length, color: 'bg-amber-500' },
  { label: 'Draft', count: mockActivities.filter(a => a.status === 'DRAFT').length, color: 'bg-slate-400' },
  { label: 'Rejected', count: mockActivities.filter(a => a.status === 'REJECTED').length, color: 'bg-red-500' },
  { label: 'Archived', count: mockActivities.filter(a => a.status === 'ARCHIVED').length, color: 'bg-gray-300' },
];

const departmentData = [
  { dept: 'HR', activities: 3, risk: 'LOW' },
  { dept: 'Marketing', activities: 2, risk: 'HIGH' },
  { dept: 'IT Ops', activities: 2, risk: 'MEDIUM' },
  { dept: 'Finance', activities: 3, risk: 'CRITICAL' },
  { dept: 'Legal', activities: 2, risk: 'LOW' },
  { dept: 'Sales', activities: 2, risk: 'MEDIUM' },
];

const monthlyTrend = [
  { month: 'Oct', value: 3 },
  { month: 'Nov', value: 5 },
  { month: 'Dec', value: 4 },
  { month: 'Jan', value: 7 },
  { month: 'Feb', value: 6 },
  { month: 'Mar', value: 8 },
];

const MAX_TREND = Math.max(...monthlyTrend.map(d => d.value));

export default function ExecutiveAnalyticsPage() {
  const totalActivities = mockActivities.length;
  const complianceRate = Math.round((mockActivities.filter(a => a.status === 'ACTIVE').length / totalActivities) * 100);

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics & Risk Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Executive-level overview of ROPA compliance posture</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Compliance', value: `${complianceRate}%`, sub: 'Activities fully active', trend: '+2.4%', positive: true },
          { label: 'Total Activities', value: totalActivities, sub: 'Across all departments', trend: '+3 this month', positive: true },
          { label: 'Critical Risk Items', value: mockActivities.filter(a => a.riskLevel === 'CRITICAL').length, sub: 'Requires immediate attention', trend: 'Stable', positive: null },
          { label: 'DPA Coverage', value: '94%', sub: 'Processors with signed DPA', trend: '+1%', positive: true },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{kpi.label}</p>
            <p className="text-3xl font-bold text-slate-800 mb-1">{kpi.value}</p>
            <p className="text-xs text-slate-400 mb-2">{kpi.sub}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              kpi.positive === true ? 'bg-emerald-50 text-emerald-700' :
              kpi.positive === false ? 'bg-red-50 text-red-600' :
              'bg-slate-100 text-slate-500'
            }`}>
              {kpi.positive === true && '↑'}
              {kpi.positive === false && '↓'}
              {kpi.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Activity Volume Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">New activities created per month</p>
            </div>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">+33% vs last month</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {monthlyTrend.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600">{d.value}</span>
                <div className="w-full flex items-end" style={{ height: '112px' }}>
                  <div
                    className="w-full rounded-t-md bg-blue-500 hover:bg-blue-600 transition-colors cursor-default"
                    style={{ height: `${(d.value / MAX_TREND) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Risk Distribution</h3>
          <p className="text-xs text-slate-400 mb-5">By risk level</p>
          <div className="space-y-3">
            {riskBreakdown.map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${r.color}`} />
                    <span className="text-sm text-slate-700">{r.label}</span>
                  </div>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${r.light}`}>
                    {r.count}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${r.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(r.count / totalActivities) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status + Department Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Donut (simulated) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Status Breakdown</h3>
          <div className="flex items-center gap-6">
            {/* Stacked bar */}
            <div className="flex-1">
              <div className="flex h-6 rounded-full overflow-hidden gap-px">
                {statusBreakdown.filter(s => s.count > 0).map((s) => (
                  <div
                    key={s.label}
                    className={`${s.color} transition-all`}
                    style={{ flex: s.count }}
                    title={`${s.label}: ${s.count}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                {statusBreakdown.map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${s.color}`} />
                    <span className="text-xs text-slate-600">{s.label}</span>
                    <span className="text-xs font-bold text-slate-800">({s.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity list */}
          <div className="mt-5 space-y-2">
            {mockActivities.slice(0, 4).map((act) => (
              <div key={act.id} className="flex items-center justify-between py-2 border-t border-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-slate-400 flex-shrink-0">{act.id}</span>
                  <span className="text-sm text-slate-700 truncate">{act.activityName}</span>
                </div>
                <StatusBadge status={act.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Department Risk Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Department Risk Matrix</h3>
          <div className="space-y-3">
            {departmentData.map((d) => {
              const riskWidths = { LOW: 20, MEDIUM: 45, HIGH: 70, CRITICAL: 95 };
              const w = riskWidths[d.risk as keyof typeof riskWidths];
              const barColors = { LOW: 'bg-emerald-500', MEDIUM: 'bg-amber-500', HIGH: 'bg-orange-500', CRITICAL: 'bg-red-500' };
              return (
                <div key={d.dept} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-600 w-16 flex-shrink-0">{d.dept}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColors[d.risk as keyof typeof barColors]} rounded-full transition-all duration-500`}
                      style={{ width: `${w}%` }}
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <RiskBadge level={d.risk as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} />
                  </div>
                  <span className="text-xs text-slate-400 w-16 text-right">{d.activities} activities</span>
                </div>
              );
            })}
          </div>

          {/* Compliance score card */}
          <div className="mt-5 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-blue-800">GDPR Compliance Score</p>
              <p className="text-2xl font-bold text-blue-700">87/100</p>
            </div>
            <div className="h-2.5 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '87%' }} />
            </div>
            <p className="text-xs text-blue-600 mt-2">Based on activity completeness, legal basis coverage, and DPA status.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
