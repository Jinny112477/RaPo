import { Activity, User, Notification, DashboardStats } from '@/types';

export const mockActivities: Activity[] = [
  {
    id: 'ACT-001',
    department: 'ฝ่ายทรัพยากรบุคคล',
    activityName: 'การจัดเก็บข้อมูลพนักงาน',
    purpose: 'เพื่อบริหารจัดการข้อมูลพนักงานและการจ่ายเงินเดือน',
    legalBasis: 'ฐานสัญญา (Contract)',
    dataSubject: ['พนักงาน'],
    personalData: ['ชื่อ-นามสกุล', 'เลขบัตรประชาชน'],
    processing: ['การเก็บรวบรวม', 'การจัดเก็บ'],
    riskLevel: 'LOW',
    retentionPeriod: '7 ปี',
    status: 'ACTIVE',
    createdAt: '2567-01-15',
    updatedAt: '2567-03-10',
    owner: 'somshy',
  },
  {
    id: 'ACT-002',
    department: 'ฝ่ายการตลาด',
    activityName: 'การจัดงาน Event และกิจกรรมส่งเสริมการขาย',
    purpose: 'เพื่อเก็บข้อมูลผู้เข้าร่วมงานและประชาสัมพันธ์',
    legalBasis: 'ฐานความยินยอม (Consent)',
    dataSubject: ['ลูกค้า', 'คู่ค้า'],
    personalData: ['ชื่อ-นามสกุล', 'อีเมล'],
    processing: ['การเก็บรวบรวม', 'การเปิดเผย'],
    riskLevel: 'MEDIUM',
    retentionPeriod: '5 ปี',
    status: 'REVIEW',
    createdAt: '2567-02-01',
    updatedAt: '2567-03-14',
    owner: 'meimei',
  },
];

export const mockUsers: User[] = [
  {
    id: 'USR-001',
    name: 'jikko',
    email: 'sarah.chen@company.com',
    role: 'admin',
    department: 'IT',
    avatarInitials: 'JK',
    status: 'active',
    createdAt: '2567-06-01',
  },
  {
    id: 'USR-002',
    name: 'meimei',
    email: 'm.torres@company.com',
    role: 'dataOwner',
    department: 'การตลาด',
    avatarInitials: 'MM',
    status: 'active',
    createdAt: '2567-08-15',
  },
  {
    id: 'USR-003',
    name: 'jin',
    email: 'e.vasquez@company.com',
    role: 'dpo',
    department: 'กฎหมาย',
    avatarInitials: 'JN',
    status: 'active',
    createdAt: '2567-05-20',
  },
  {
    id: 'USR-004',
    name: 'kk',
    email: 'r.nguyen@company.com',
    role: 'auditor',
    department: 'ตรวจสอบ',
    avatarInitials: 'KK',
    status: 'active',
    createdAt: '2567-09-10',
  },
  {
    id: 'USR-005',
    name: 'somshy',
    email: 'c.blake@company.com',
    role: 'executive',
    department: 'ผู้บริหาร',
    avatarInitials: 'SS',
    status: 'active',
    createdAt: '2567-04-01',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'N-001',
    message: 'ACT-002 ถูกส่งเพื่อรอการตรวจสอบ',
    time: '5 นาทีที่แล้ว',
    read: false,
    type: 'info',
  },
  {
    id: 'N-002',
    message: 'พบกิจกรรมความเสี่ยงสูงในฝ่ายการตลาด',
    time: '1 ชั่วโมงที่แล้ว',
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
  'ฝ่ายทรัพยากรบุคคล',
  'ฝ่ายการตลาด',
];

export const LEGAL_BASES = [
  'ฐานความยินยอม (Consent)',
  'ฐานสัญญา (Contract)',
];

export const DATA_SUBJECTS = ['พนักงาน', 'ลูกค้า'];

export const PERSONAL_DATA_TYPES = [
  'ชื่อ-นามสกุล',
  'อีเมล',
];

export const PROCESSING_ACTIVITIES = [
  'การเก็บรวบรวม',
  'การจัดเก็บ',
];

export const RETENTION_PERIODS = [
  '5 ปี',
  '7 ปี',
];