import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { UserType } from '@/types/auth';

import supabase from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: UserType | null;
  signUp: (email: string, password: string) => ReturnType<typeof supabase.auth.signUp>;
  signIn: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  resetPassword: (email: string) => ReturnType<typeof supabase.auth.resetPasswordForEmail>;
  updatePassword: (password: string) => ReturnType<typeof supabase.auth.updateUser>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function initAuth() {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }

  useEffect(() => {
    initAuth();
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const response = await supabase.auth.signUp({
      email,
      password,
    });

    if (response.error) {
      toast.error('Sign up failed', {
        description: response.error.message,
      });
    } else if (response.data?.user) {
      toast.success('Verification email sent', {
        description: 'Please check your email to verify your account.',
      });
    }

    setLoading(false);
    return response;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (response.error) {
      toast.error('Sign in failed', {
        description: response.error.message,
      });
    }

    setLoading(false);
    return response;
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();

    toast.info('Signed out', {
      description: 'You have been successfully signed out.',
    });

    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    const response = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (response.error) {
      toast.error('Password reset failed', {
        description: response.error.message,
      });
    } else {
      toast.success('Password reset email sent', {
        description: 'Please check your email for the password reset link.',
      });
    }

    setLoading(false);
    return response;
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    const response = await supabase.auth.updateUser({
      password,
    });

    if (response.error) {
      toast.error('Password update failed', {
        description: response.error.message,
      });
    } else {
      toast.success('Password updated', {
        description: 'Your password has been successfully updated.',
      });
    }

    setLoading(false);
    return response;
  };

  const value = {
    session,
    user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    loading,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
