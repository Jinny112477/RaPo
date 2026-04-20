'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User } from '@/types';
import { mockUsers } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  login: async () => false,
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ropa_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    const found = mockUsers.find((u) => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem('ropa_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ropa_user');
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
