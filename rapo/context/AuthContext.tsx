'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User } from '@/types';
import { supabase } from '../lib/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

type LoginResult = {
  ok: boolean;
  mustChangePassword: boolean;
};

interface AuthContextType {
  user: User | null;
  role: Role | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  login: async () => ({ ok: false, mustChangePassword: false }),
  logout: async () => { },
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, user_membership(role, departments(department_name))')
      .eq('user_id', supabaseUser.id)
      .single();

    type Membership = {
      role?: string;
      departments?: {
        department_name?: string;
      };
    };

    const membershipRaw = profile?.user_membership;

    // ✅ Single declaration with correct type cast
    const membership = (
      Array.isArray(membershipRaw) ? membershipRaw[0] : membershipRaw
    ) as Membership | undefined;

    const role = membership?.role ?? 'user';
    const department = membership?.departments?.department_name ?? '';
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

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // ✅ mustChangePassword included in the failure case
    if (error || !data.user) return { ok: false, mustChangePassword: false };

    const { data: profile } = await supabase
      .from("profiles")
      .select("password_change")
      .eq("user_id", data.user.id)
      .single();

    return {
      ok: true,
      mustChangePassword: !profile?.password_change,
    };
  };

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