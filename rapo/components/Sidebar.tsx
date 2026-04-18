'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/lib/sidebarContext';
import { useAuth } from '@/lib/authContext';
import { Role } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
}

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const ServerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon />, roles: ['admin', 'dataOwner', 'dpo', 'auditor', 'executive'] },
  { label: 'User Management', href: '/admin/users', icon: <UsersIcon />, roles: ['admin'] },
  { label: 'Create Activity', href: '/createactivity', icon: <PlusCircleIcon />, roles: ['admin', 'dataOwner'] },
  { label: 'My Activities', href: '/admin/activities', icon: <ListIcon />, roles: ['dataOwner'] },
  { label: 'Processor', href: '/processor', icon: <ServerIcon />, roles: ['admin'] },
  { label: 'Reports', href: '/admin/reports', icon: <FileTextIcon />, roles: ['admin'] },
  { label: 'Review Queue', href: '/dpo/review', icon: <ClipboardIcon />, roles: ['dpo'] },
  { label: 'Risk Assessment', href: '/dpo/risk', icon: <AlertTriangleIcon />, roles: ['dpo'] },
  { label: 'Audit Logs', href: '/auditor/logs', icon: <LogIcon />, roles: ['auditor'] },
  { label: 'Risk Dashboard', href: '/executive/risk', icon: <AlertTriangleIcon />, roles: ['executive'] },
  { label: 'Analytics', href: '/executive/analytics', icon: <BarChartIcon />, roles: ['executive'] },
];

const roleLabelMap: Record<Role, string> = {
  admin: 'Administrator',
  dataOwner: 'Data Owner',
  dpo: 'Data Protection Officer',
  auditor: 'Auditor',
  executive: 'Executive',
};

export function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebar();
  const { user, role } = useAuth();
  const pathname = usePathname();

  const filtered = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 h-full z-50 flex flex-col',
          'bg-[#0f1e36] text-white',
          'transition-all duration-200 ease-in-out',
          // Desktop
          'lg:static lg:translate-x-0',
          isCollapsed ? 'lg:w-[64px]' : 'lg:w-[240px]',
          // Mobile
          isMobileOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full w-[240px]',
          'lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-16 border-b border-white/10 flex-shrink-0 ${
            isCollapsed ? 'justify-center px-0' : 'px-5 gap-3'
          }`}
        >
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <ShieldIcon />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white tracking-tight leading-tight truncate">
                ROPA
              </p>
              <p className="text-xs text-slate-400 truncate">Management System</p>
            </div>
          )}
        </div>

        {/* Role Label */}
        {!isCollapsed && role && (
          <div className="px-4 pt-4 pb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {roleLabelMap[role]}
            </span>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
            {filtered.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={[
                      'flex items-center rounded-lg transition-all duration-200',
                      'text-sm font-medium group relative',
                      isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3',
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                        : 'text-slate-300 hover:bg-white/8 hover:text-white',
                    ].join(' ')}
                  >
                    <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {/* Tooltip for collapsed */}
                    {isCollapsed && (
                      <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-xl border border-white/10 z-50">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info + Collapse Toggle */}
        <div className="border-t border-white/10 p-3 flex-shrink-0">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg bg-white/5">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.department}</p>
              </div>
            </div>
          )}

          {/* Collapse button — desktop only */}
          <button
            onClick={toggleCollapsed}
            className={`hidden lg:flex items-center justify-center w-full rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 ${isCollapsed ? '' : 'gap-2'}`}
          >
            <span className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}>
              <ChevronLeftIcon />
            </span>
            {!isCollapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
