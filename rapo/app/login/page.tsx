<<<<<<< Updated upstream
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
=======
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const demoAccounts = [
  { email: 'jikko@company.com', role: 'Admin', color: 'bg-[#1e3a6e] text-white border-[#1e3a6e]' },
  { email: 'meimei@company.com', role: 'Data Owner', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { email: 'jin@company.com', role: 'DPO', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { email: 'kk@company.com', role: 'Auditor', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { email: 'somshy@company.com', role: 'Executive', color: 'bg-amber-50 text-amber-700 border-amber-200' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password || 'demo');
    setLoading(false);
    if (ok) router.push('/dashboard');
    else setError('Account not found. Use a demo email below.');
  };

  return (
    <div className="min-h-screen bg-[#1e3a6e] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="px-8 pt-7 pb-5 border-b border-slate-100">
            <h1 className="text-xl font-semibold text-slate-800 mb-0.5">Sign in</h1>
            <p className="text-sm text-slate-400">Access your ROPA dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]/20 focus:border-[#1e3a6e]/60 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (or leave blank for demo)"
                  className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]/20 focus:border-[#1e3a6e]/60 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1e3a6e] text-white text-sm font-medium rounded-lg hover:bg-[#163060] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="px-8 pb-7 border-t border-slate-100 pt-4">
            <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-3">Quick Demo Access</p>
            <div className="space-y-1.5">
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    const ok = await login(a.email, 'Temp1234');
                    setLoading(false);
                    if (ok) router.push('/dashboard');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all hover:opacity-80 ${a.color}`}
                >
                  <span className="font-medium">{a.email}</span>
                  <span className="font-semibold">{a.role}</span>
                </button>
              ))}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  )
}
=======
  );
}
>>>>>>> Stashed changes
