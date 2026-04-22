export type Role = 'admin' | 'dataOwner' | 'dpo' | 'auditor' | 'executive';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ActivityStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'ACTIVE'
  | 'REJECTED'
  | 'ARCHIVED';

export type LegalBasis = string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
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

  accessRequests?: {
    requestedBy: string   // user id ของ DP
    status: 'pending' | 'approved' | 'rejected'
  }[]
  rejectionReason?: string;
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

export interface DpRecord {
  id: string;
  activityId: string; // link ไป DC record
  processorName: string;
  purpose: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  createdBy: string;
  rejectionReason?: string;
}
export const mockDpRecords: DpRecord[] = [
  {
    id: 'DP-001',
    activityId: 'ACT-003',         // ผูกกับ DC record ที่ ACTIVE
    processorName: 'บริษัท meimei จำกัด',
    purpose: 'ประมวลผลข้อมูลลูกค้าเพื่อจัดงาน Event',
    status: 'PENDING',
    createdAt: '2568-03-15',
    createdBy: 'meimei',
  },
];
