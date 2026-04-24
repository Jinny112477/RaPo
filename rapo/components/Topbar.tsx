'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSidebar } from '@/lib/sidebarContext';
import { useAuth } from '@/context/AuthContext';
import { mockNotifications } from '@/lib/mockData';

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);



const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function Topbar() {
  const { toggleCollapsed, toggleMobile } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // LOGOUT: handler
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // NOTIFICATION: mark all read (MOCK DATA)
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // NOTIFICATION: notify type color-based (MOCK DATA)
  const notifTypeColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-600',
    warning: 'bg-amber-100 text-amber-600',
    success: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-[#203690] border-b border-[#182a73] z-30 flex items-center justify-between px-4 lg:px-6 transition-all duration-200">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleCollapsed}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>
        <h1 className="text-lg font-semibold text-white">
          RaPO | RoPA Management System
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications((p) => !p); setShowProfile(false); }}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-200"
            aria-label="Notifications"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <CheckIcon /> Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
                  >
                    <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${notifTypeColors[n.type]}`}>
                      {n.type === 'warning' ? '!' : n.type === 'success' ? '✓' : 'i'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile((p) => !p); setShowNotifications(false); }}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.avatarInitials ?? 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-800 leading-tight">{user?.name ?? 'User'}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role ?? ''}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hidden sm:block">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <span className="text-slate-400"><UserIcon /></span>
                  My Profile
                </Link>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOutIcon />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
