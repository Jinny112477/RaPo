'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User } from '@/types';
import { supabase } from '../lib/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  login: async () => false,
  logout: async () => { },
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Map Supabase user → fetch role from profiles table
  const mapUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, user_membership(role, departments(department_name))')
      .eq('user_id', supabaseUser.id)
      .single();

    const membership = (profile?.user_membership as any) ?? {};
    const role = membership.role ?? 'user';
    const department = membership.departments?.department_name ?? '';
    const name = profile?.name ?? '';

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: role as Role,
      name,
      department,
      avatarInitials: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
    };
  };

  // GET: fetch session
  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const mapped = await mapUser(data.session.user);
        setUser(mapped);
      }
      setIsLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const mapped = await mapUser(session.user);
          setUser(mapped);
        } else {
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // LOGIN: handler
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('TRY LOGIN:', email);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('LOGIN ERROR:', error.message);
      return false;
    }

    console.log('LOGIN SUCCESS:', data);
    return true;
  };

  // LOGOUT: handler
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);