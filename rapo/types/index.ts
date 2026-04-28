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

// ข้อมูลผู้ลงบันทึก ROPA
export interface RecorderInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
}

// มาตรการรักษาความมั่นคงปลอดภัย (ข้อ 15 DC / ข้อ 13 DP)
export interface SecurityMeasures {
  organizational: string;
  technical: string;
  physical: string;
  accessControl: string;
  userResponsibility: string;
  auditTrail: string;
}

// วัตถุประสงค์ย่อยแต่ละรายการ
export interface SubActivity {
  id: string;
  purpose: string;
  personalDataItems: string[];
  dataCategory: string[];
  dataType: string[];
  collectionMethod: string[];
  sourceFromOwner: string;
  sourceFromOther: string;
  legalBasis: string[];
  minorConsentUnder10: string;
  minorConsentAge10to20: string;
  transferAbroad: string;
  transferCountry: string;
  transferAffiliate: string;
  transferAffiliateCompany: string;
  transferMethod: string;
  transferStandard: string;
  transferException28: string;
  storageType: string[];
  storageMethod: string;
  retentionPeriod: string;
  accessRights: string;
  deletionMethod: string;
  exemptDisclosure: string;
  rightsDenial: string;
}

export interface Activity {
  id: string;
  formType: 'controller' | 'processor';
  recorder?: RecorderInfo;
  department: string;
  activityName: string;
  dataOwnerName?: string;
  processorName?: string;
  controllerAddress?: string;
  subActivities?: SubActivity[];
  securityMeasures?: SecurityMeasures;
  // backward compat fields
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
    requestedBy: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
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
  activityId: string;
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
    activityId: 'ACT-003',
    processorName: 'บริษัท meimei จำกัด',
    purpose: 'ประมวลผลข้อมูลลูกค้าเพื่อจัดงาน Event',
    status: 'PENDING',
    createdAt: '2568-03-15',
    createdBy: 'meimei',
  },
];