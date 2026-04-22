'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
  { email: 'jikko@company.com', role: 'Admin', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { email: 'meimei@company.com', role: 'Data Owner', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { email: 'jin.vasquez@company.com', role: 'DPO', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { email: 'kk@company.com', role: 'Auditor', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { email: 'somshy@company.com', role: 'Executive', color: 'bg-amber-100 text-amber-700 border-amber-200' },
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

  // ✅ Uncomment this — it was using the correct name "login"
  const quickLogin = async (e: string) => {
    setEmail(e);
    const ok = await login(e, 'demo');
    if (ok) router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0f1e36] flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-[#0a1628] border-r border-white/10 p-10 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center">
              <ShieldIcon />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">ROPA</p>
              <p className="text-slate-400 text-xs">Management System</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-white text-3xl font-bold leading-tight mb-3">
                Privacy compliance<br />made simple.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Manage your Record of Processing Activities in one secure, organized platform built for modern enterprises.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '🔒', label: 'GDPR Compliant Workflows' },
                { icon: '📋', label: 'Automated Risk Assessment' },
                { icon: '👥', label: 'Role-Based Access Control' },
                { icon: '📊', label: 'Real-time Analytics & Reports' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-900/50 rounded-lg flex items-center justify-center text-sm">{f.icon}</span>
                  <span className="text-slate-300 text-sm">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500">
            © 2024 ROPA Management System. Enterprise Edition v2.4
          </p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShieldIcon />
            </div>
            <span className="text-white font-bold text-lg">ROPA Management</span>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-slate-100">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Sign in</h1>
              <p className="text-sm text-slate-500">Access your ROPA dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (or leave blank for demo)"
                    className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
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
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-blue-200 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="px-8 pb-8">
              <div className="border-t border-slate-100 pt-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Quick Demo Access
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => quickLogin(acc.email)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 hover:shadow-sm ${acc.color}`}
                    >
                      <span className="truncate">{acc.email}</span>
                      <span className="ml-2 flex-shrink-0 opacity-70">{acc.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
