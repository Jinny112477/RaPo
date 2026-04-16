'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Input } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@datacorp.th')
  const [password, setPassword] = useState('••••••••')

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-xl w-[380px] overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gray-900 border-b-[3px] border-red-700 px-7 py-7 text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-9 h-9 bg-red-700 rounded flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="6" height="6" fill="white" opacity=".9" />
                <rect x="11" y="3" width="6" height="6" fill="white" opacity=".6" />
                <rect x="3" y="11" width="6" height="6" fill="white" opacity=".6" />
                <rect x="11" y="11" width="6" height="6" fill="white" opacity=".3" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[15px] font-semibold text-white">RoPA Management System</p>
              <p className="text-[11px] text-gray-400">ระบบบริหารจัดการ PDPA</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-7">
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">อีเมลผู้ใช้งาน</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">รหัสผ่าน</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-red-700" />
              จดจำฉัน
            </label>
            <button className="text-xs text-red-700 hover:underline">ลืมรหัสผ่าน?</button>
          </div>

          <Button variant="primary" className="w-full py-2.5 justify-center" onClick={() => router.push('/dashboard')}>
            เข้าสู่ระบบ
          </Button>

          <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
            ระบบนี้สงวนสิทธิ์เฉพาะผู้ได้รับอนุญาต<br />
            การเข้าถึงโดยไม่ได้รับอนุญาตเป็นความผิดตาม พ.ร.บ. PDPA พ.ศ. 2562
          </p>
        </div>
      </div>
    </div>
  )
}
