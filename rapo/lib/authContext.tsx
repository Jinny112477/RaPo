'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User { id: string; email: string; name: string; avatarInitials: string;  role: Role; department?: string;}
type Role = 'admin' | 'dataOwner' | 'dpo' | 'auditor' | 'executive';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const MOCK_USERS = [
  { email: 'jikko@company.com',  user: { id: '1', email: 'jikko@company.com',  name: 'Jikko',  avatarInitials: 'JK', role: 'admin'      as Role }, role: 'admin'      as Role },
  { email: 'meimei@company.com', user: { id: '2', email: 'meimei@company.com', name: 'Meimei', avatarInitials: 'MM', role: 'dataOwner'  as Role }, role: 'dataOwner'  as Role },
  { email: 'jin@company.com',    user: { id: '3', email: 'jin@company.com',    name: 'Jin',    avatarInitials: 'JN', role: 'dpo'        as Role }, role: 'dpo'        as Role },
  { email: 'kk@company.com',     user: { id: '4', email: 'kk@company.com',     name: 'KK',     avatarInitials: 'KK', role: 'auditor'    as Role }, role: 'auditor'    as Role },
  { email: 'somshy@company.com', user: { id: '5', email: 'somshy@company.com', name: 'Somshy', avatarInitials: 'SM', role: 'executive'  as Role }, role: 'executive'  as Role },
];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // โหลด user จาก localStorage ตอน mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mock_user');
      const savedRole = localStorage.getItem('mock_role');
      if (savedUser && savedRole) {
        setUser(JSON.parse(savedUser));
        setRole(savedRole as Role);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    const found = MOCK_USERS.find(
      u => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (found) {
      setUser(found.user);
      setRole(found.role);
      localStorage.setItem('mock_user', JSON.stringify(found.user));
      localStorage.setItem('mock_role', found.role);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('mock_user');
    localStorage.removeItem('mock_role');
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
