'use client';

import { useAuth } from '@/context/AuthContext';

const roleLabelMap: Record<string, string> = {
  admin: 'Administrator',
  dataOwner: 'Data Owner',
  dpo: 'Data Protection Officer',
  auditor: 'Auditor',
  executive: 'Executive',
};

export default function ProfilePage() {
  const { user, role } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          My Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          ข้อมูลบัญชีผู้ใช้งาน
        </p>
      </div>

      <div className="max-w-xl space-y-4">

        {/* Avatar + Name */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#203690] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {user.avatarInitials}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {roleLabelMap[role ?? ''] ?? role}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              รายละเอียดบัญชี
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { label: 'ชื่อผู้ใช้', value: user.name },
              { label: 'อีเมล', value: user.email },
              { label: 'บทบาท', value: roleLabelMap[role ?? ''] ?? role },
              ...(role === 'dataOwner' && user.department
                ? [{ label: 'แผนก', value: user.department }]
                : []),
              { label: 'วันที่สร้างบัญชี', value: user.createdAt },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
                <p className="text-sm text-gray-500">{row.label}</p>
                <p className="text-sm font-medium text-gray-800">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}