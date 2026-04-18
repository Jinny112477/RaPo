'use client';

import { DashboardStats } from '@/types';

interface DashboardCardsProps {
  stats: DashboardStats;
}

const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const cards = [
  {
    key: 'total' as keyof DashboardStats,
    label: 'Total Activities',
    color: 'blue',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    change: '+3 this month',
    bgClass: 'bg-blue-50',
    iconClass: 'text-blue-600',
    valueClass: 'text-blue-700',
    borderClass: 'border-blue-100',
  },
  {
    key: 'active' as keyof DashboardStats,
    label: 'Active',
    color: 'emerald',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    change: '+1 this week',
    bgClass: 'bg-emerald-50',
    iconClass: 'text-emerald-600',
    valueClass: 'text-emerald-700',
    borderClass: 'border-emerald-100',
  },
  {
    key: 'review' as keyof DashboardStats,
    label: 'Under Review',
    color: 'amber',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    change: 'Needs attention',
    bgClass: 'bg-amber-50',
    iconClass: 'text-amber-600',
    valueClass: 'text-amber-700',
    borderClass: 'border-amber-100',
  },
  {
    key: 'draft' as keyof DashboardStats,
    label: 'Draft',
    color: 'slate',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    change: 'In progress',
    bgClass: 'bg-slate-50',
    iconClass: 'text-slate-500',
    valueClass: 'text-slate-700',
    borderClass: 'border-slate-200',
  },
  {
    key: 'highRisk' as keyof DashboardStats,
    label: 'High Risk',
    color: 'red',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    change: 'Requires review',
    bgClass: 'bg-red-50',
    iconClass: 'text-red-600',
    valueClass: 'text-red-700',
    borderClass: 'border-red-100',
  },
];

export function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const value = stats[card.key];
        return (
          <div
            key={card.key}
            className={`bg-white rounded-xl border ${card.borderClass} p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.bgClass} flex items-center justify-center ${card.iconClass}`}>
                {card.icon}
              </div>
              <span className={`text-xs flex items-center gap-1 text-slate-400`}>
                <TrendUpIcon />
              </span>
            </div>
            <div className={`text-3xl font-bold ${card.valueClass} mb-1`}>
              {value}
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">{card.label}</p>
            <p className="text-xs text-slate-400">{card.change}</p>
          </div>
        );
      })}
    </div>
  );
}
