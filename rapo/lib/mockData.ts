import { Activity, User, Notification, DashboardStats } from '@/types';

export const mockActivities: Activity[] = [
  {
    id: 'ACT-001',
    department: 'ฝ่ายทรัพยากรบุคคล',
    activityName: 'การจัดเก็บข้อมูลพนักงาน',
    purpose: 'เพื่อบริหารจัดการข้อมูลพนักงานและการจ่ายเงินเดือน',
    legalBasis: 'ฐานสัญญา (Contract)',
    dataSubject: ['พนักงาน'],
    personalData: ['ชื่อ-นามสกุล', 'เลขบัตรประชาชน', 'ที่อยู่'],
    processing: ['การเก็บรวบรวม', 'การใช้', 'การจัดเก็บ'],
    riskLevel: 'LOW',
    retentionPeriod: '7 ปี',
    status: 'ACTIVE',
    createdAt: '2567-01-15',
    updatedAt: '2567-03-10',
    owner: 'สมหญิง ใจดี',
  },
  {
    id: 'ACT-002',
    department: 'ฝ่ายการตลาด',
    activityName: 'การจัดงาน Event และกิจกรรมส่งเสริมการขาย',
    purpose: 'เพื่อเก็บข้อมูลผู้เข้าร่วมงานและประชาสัมพันธ์',
    legalBasis: 'ฐานความยินยอม (Consent)',
    dataSubject: ['ลูกค้า', 'คู่ค้า'],
    personalData: ['ชื่อ-นามสกุล', 'อีเมล', 'เบอร์โทรศัพท์', 'ภาพถ่าย'],
    processing: ['การเก็บรวบรวม', 'การใช้', 'การเปิดเผย'],
    riskLevel: 'MEDIUM',
    retentionPeriod: '5 ปี',
    status: 'REVIEW',
    createdAt: '2567-02-01',
    updatedAt: '2567-03-14',
    owner: 'สมชาย รักดี',
  },
];


export const mockUsers: User[] = [
  {
    id: 'USR-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'admin',
    department: 'IT',
    avatarInitials: 'SC',
    status: 'active',
    createdAt: '2023-06-01',
  },
  {
    id: 'USR-002',
    name: 'Michael Torres',
    email: 'm.torres@company.com',
    role: 'dataOwner',
    department: 'Marketing',
    avatarInitials: 'MT',
    status: 'active',
    createdAt: '2023-08-15',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'N-001',
    message: 'ACT-005 submitted for review',
    time: '5 min ago',
    read: false,
    type: 'info',
  },
  {
    id: 'N-002',
    message: 'High risk activity detected in Marketing',
    time: '1 hour ago',
    read: false,
    type: 'warning',
  },
];

export const mockStats: DashboardStats = {
  total: 2,
  active: 1,
  review: 1,
  draft: 0,
  highRisk: 0,
};


export const DEPARTMENTS = [
  'Human Resources',
  'Marketing',
  'IT Operations',
  'Legal',
  'Finance',
  'Customer Service',
  'Sales',
  'Research & Development',
  'Compliance',
  'Operations',
];

export const LEGAL_BASES = [
  'Consent',
  'Contract',
  'Legal Obligation',
  'Vital Interests',
  'Public Task',
  'Legitimate Interests',
];

export const DATA_SUBJECTS = ['Employee', 'Customer', 'Vendor', 'Contractor', 'Partner'];

export const PERSONAL_DATA_TYPES = [
  'Name',
  'Email',
  'Phone',
  'ID Number',
  'Address',
  'Date of Birth',
  'Financial Data',
  'Health Data',
  'Biometric Data',
];

export const PROCESSING_ACTIVITIES = [
  'Collection',
  'Use',
  'Disclosure',
  'Storage',
  'Deletion',
  'Transfer',
  'Profiling',
];

export const RETENTION_PERIODS = [
  '6 months',
  '1 year',
  '2 years',
  '3 years',
  '5 years',
  '7 years',
  '10 years',
  'Indefinite',
];
