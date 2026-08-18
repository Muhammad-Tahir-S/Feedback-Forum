import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Database } from 'database.types';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { UserType } from '@/types/auth';

import supabase from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: UserType | null;
  isPasswordRecovery: boolean;
  signUp: (email: string, password: string, username: string) => ReturnType<typeof supabase.auth.signUp>;
  signIn: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  resetPassword: (email: string) => ReturnType<typeof supabase.auth.resetPasswordForEmail>;
  updatePassword: (password: string) => ReturnType<typeof supabase.auth.updateUser>;
};
type Board = Database['public']['Tables']['boards']['Row'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [boards] = useLocalStorage<Board[] | null>('boards');

  useEffect(() => {
    let cancelled = false;

    const applyVerifiedUser = (nextUser: User | null, nextSession: Session | null) => {
      if (cancelled) return;
      setSession(nextSession);
      setUser(nextUser ? getUserFromSupabase(nextUser) : null);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setIsPasswordRecovery(false);
      }

      // INITIAL_SESSION is storage-only. Identity is confirmed with getUser() below.
      if (event === 'INITIAL_SESSION') {
        return;
      }

      applyVerifiedUser(nextSession?.user ?? null, nextSession);
      setLoading(false);
    });

    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!error && data.user) {
        const { data: sessionData } = await supabase.auth.getSession();
        applyVerifiedUser(data.user, sessionData.session);
        if (isRecoveryRedirect()) {
          setIsPasswordRecovery(true);
        }
      } else {
        applyVerifiedUser(null, null);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && !boards) {
      supabase
        .from('boards')
        .select('id, name, value')
        .then(({ data }) => {
          if (data?.length) {
            localStorage.setItem('boards', JSON.stringify(data));
          }
        });
    }
  }, [user, boards]);

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    const response = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
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
    localStorage.removeItem('boards');

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
    if (!isPasswordRecovery) {
      const message = 'Password can only be updated from a reset link.';
      toast.error('Password update failed', { description: message });
      return {
        data: { user: null },
        error: { message, name: 'AuthError', status: 403 },
      } as Awaited<ReturnType<typeof supabase.auth.updateUser>>;
    }

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
    isPasswordRecovery,
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

function getUserFromSupabase(user: User): UserType {
  return {
    id: user.id,
    email: user.email,
    username: user.user_metadata?.['username'] || '',
    avatar_url: '',
  };
}

function isRecoveryRedirect() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  return (
    hash.get('type') === 'recovery' ||
    search.get('type') === 'recovery' ||
    (window.location.pathname.includes('/auth/update-password') && search.has('code'))
  );
}
