import { Activity, User, Notification, DashboardStats } from '@/types';
import { DpRecord } from '@/types';

export const mockActivities: Activity[] = [
  {
    id: 'ACT-001',
    formType: 'controller' as const,
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
    owner: 'Somying Jaidee',
  },
  {
    id: 'ACT-002',
    formType: 'controller' as const,
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
    owner: 'Somying Jaidee',
  },
  {
    id: 'ACT-003',
    formType: 'controller' as const,
    department: 'ฝ่ายการตลาด',
    activityName: 'ทดสอบ DP Flow',
    purpose: 'test',
    legalBasis: 'ฐานความยินยอม (Consent)',
    dataSubject: ['ลูกค้า'],
    personalData: ['ชื่อ-นามสกุล'],
    processing: ['การเก็บรวบรวม'],
    riskLevel: 'LOW',
    retentionPeriod: '5 ปี',
    status: 'ACTIVE',
    createdAt: '2567-03-01',
    updatedAt: '2567-03-15',
    owner: 'Somying Jaidee',
  },
  // สำหรับทดสอบสถานะ REJECTED
  {
    id: 'ACT-004',
    formType: 'controller' as const,
    department: 'ฝ่ายทรัพยากรบุคคล',
    activityName: 'การประเมินผลพนักงานประจำปี',
    purpose: 'เพื่อประเมินผลการปฏิบัติงาน',
    legalBasis: 'ฐานสัญญา (Contract)',
    dataSubject: ['พนักงาน'],
    personalData: ['ชื่อ-นามสกุล'],
    processing: ['การเก็บรวบรวม'],
    riskLevel: 'LOW',
    retentionPeriod: '5 ปี',
    status: 'REJECTED',
    rejectionReason: 'ฐานกฎหมายไม่ครบถ้วน กรุณาระบุเพิ่มเติม',
    createdAt: '2567-03-20',
    updatedAt: '2567-03-22',
    owner: 'Somying Jaidee',
  },
  // สำหรับทดสอบสถานะ DRAFT
  {
  id: 'ACT-005',
    formType: 'controller' as const,
  department: 'ฝ่ายการตลาด',
  activityName: 'การเก็บข้อมูลแบบสอบถามออนไลน์',
  purpose: 'เพื่อสำรวจความพึงพอใจลูกค้า',
  legalBasis: 'ฐานความยินยอม (Consent)',
  dataSubject: ['ลูกค้า'],
  personalData: ['ชื่อ-นามสกุล', 'อีเมล'],
  processing: ['การเก็บรวบรวม'],
  riskLevel: 'LOW',
  retentionPeriod: '1 ปี',
  status: 'DRAFT',
  createdAt: '2568-03-20',
  updatedAt: '2568-03-20',
  owner: 'Somying Jaidee',
},
];

export const mockUsers: User[] = [
  {
    id: 'USR-001',
    name: 'jikko',
    email: 'jikko@company.com',
    role: 'admin',
    department: '',
    avatarInitials: 'JK',
    status: 'active',
    createdAt: '2567-06-01',
  },
  {
    id: 'USR-002',
    name: 'meimei',
    email: 'meimei@company.com',
    role: 'dataOwner',
    department: 'การตลาด',
    avatarInitials: 'MM',
    status: 'active',
    createdAt: '2567-08-15',
  },
  {
    id: 'USR-003',
    name: 'jin',
    email: 'jin@company.com',
    role: 'dpo',
    department: '',
    avatarInitials: 'JN',
    status: 'active',
    createdAt: '2567-05-20',
  },
  {
    id: 'USR-004',
    name: 'kk',
    email: 'kk@company.com',
    role: 'auditor',
    department: '',
    avatarInitials: 'KK',
    status: 'active',
    createdAt: '2567-09-10',
  },
  {
    id: 'USR-005',
    name: 'somshy',
    email: 'somshy@company.com',
    role: 'executive',
    department: '',
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

export const mockDpRecords: DpRecord[] = [
  {
    id: 'DP-001',
    activityId: 'ACT-003',
    processorName: 'บริษัท kk Solutions จำกัด',
    purpose: 'ประมวลผลข้อมูลลูกค้าเพื่อจัดงาน Event',
    status: 'PENDING',
    createdAt: '2568-03-15',
    createdBy: 'meimei',
  },
  {
    id: 'DP-002',
    activityId: 'ACT-003',
    processorName: 'Vendor Draft Test',
    purpose: 'ทดสอบ draft',
    status: 'DRAFT',
    createdAt: '2568-03-16',
    createdBy: 'meimei',
  },
  // เพิ่ม Mock Data สำหรับทดสอบสถานะ REJECTED
  {
    id: 'DP-003',
    activityId: 'ACT-003',
    processorName: 'บริษัท Data Analytics จำกัด',
    purpose: 'วิเคราะห์พฤติกรรมลูกค้า',
    status: 'REJECTED',
    rejectionReason: 'วัตถุประสงค์ไม่ชัดเจน กรุณาEdit',
    createdAt: '2568-03-17',
    createdBy: 'meimei',
  }
];