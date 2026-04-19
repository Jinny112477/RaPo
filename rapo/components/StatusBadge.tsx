import { ActivityStatus, RiskLevel } from '@/types';

interface StatusBadgeProps {
  status: ActivityStatus;
  size?: 'sm' | 'md';
}

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  ActivityStatus,
  { label: string; className: string; dot: string }
> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
    dot: 'bg-slate-400',
  },
  REVIEW: {
    label: 'In Review',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'bg-gray-50 text-gray-500 border border-gray-200',
    dot: 'bg-gray-400',
  },
};

const riskConfig: Record<
  RiskLevel,
  { label: string; className: string; dot: string }
> = {
  LOW: {
    label: 'Low',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
  },
  HIGH: {
    label: 'High',
    className: 'bg-orange-50 text-orange-700 border border-orange-200',
    dot: 'bg-orange-500',
  },
  CRITICAL: {
    label: 'Critical',
    className: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${textSize} ${padding} ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function RiskBadge({ level, size = 'sm' }: RiskBadgeProps) {
  const config = riskConfig[level];
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${textSize} ${padding} ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
