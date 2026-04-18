export type Role = 'admin' | 'dataOwner' | 'dpo' | 'auditor' | 'executive';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ActivityStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'ACTIVE'
  | 'REJECTED'
  | 'ARCHIVED';

export type LegalBasis = string ;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatarInitials: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Activity {
  id: string;
  department: string;
  activityName: string;
  purpose: string;
  legalBasis: LegalBasis;
  dataSubject: string[];
  personalData: string[];
  processing: string[];
  riskLevel: RiskLevel;
  retentionPeriod: string;
  status: ActivityStatus;
  createdAt: string;
  updatedAt: string;
  owner?: string;
  reviewedBy?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
}

export interface DashboardStats {
  total: number;
  active: number;
  review: number;
  draft: number;
  highRisk: number;
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}
