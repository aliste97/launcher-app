
"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { onAuthUserStateChanged, signInWithGoogle as signInService, signOutUser as signOutService, type User } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthUserStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    const authedUser = await signInService();
    if (authedUser) {
      setUser(authedUser);
      router.push('/'); // Redirect to home after successful login
    }
    setLoading(false);
  };

  const signOutUser = async () => {
    setLoading(true);
    await signOutService();
    setUser(null);
    router.push('/login'); // Redirect to login after sign out
    setLoading(false);
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
