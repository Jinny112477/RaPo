'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'Admin' | 'Data Owner' | 'DPO' | 'Auditor' | 'Executive';

interface User {
  email: string;
  role: Role;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const mockUsers: Record<string, User> = {
  'jikko@company.com':  { email: 'jikko@company.com',  role: 'Admin',      name: 'Jikko' },
  'meimei@company.com': { email: 'meimei@company.com', role: 'Data Owner', name: 'Meimei' },
  'jin@company.com':    { email: 'jin@company.com',    role: 'DPO',        name: 'Jin' },
  'kk@company.com':     { email: 'kk@company.com',     role: 'Auditor',    name: 'KK' },
  'somshy@company.com': { email: 'somshy@company.com', role: 'Executive',  name: 'Somshy' },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ropa_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    const found = mockUsers[email.toLowerCase()];
    if (!found) return false;
    setUser(found);
    localStorage.setItem('ropa_user', JSON.stringify(found));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ropa_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
