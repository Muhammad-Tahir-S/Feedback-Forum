import { Session, User } from '@supabase/supabase-js';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Database } from 'database.types';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { UserType } from '@/types/auth';

import supabase from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: UserType | null;
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
  const localSession = localStorage.getItem(
    'sb-' + import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token'
  );
  const sessionData = localSession ? (JSON.parse(localSession) as Session) : null;

  const [user, setUser] = useState<UserType | null>(sessionData?.user ? getUserFromSupabase(sessionData.user) : null);
  const [session, setSession] = useState<Session | null>(sessionData || null);
  const [loading, setLoading] = useState(true);
  const [boards] = useLocalStorage<Board[] | null>('boards');

  async function initAuth() {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(getUserFromSupabase(session?.user));

        if (!boards) {
          supabase
            .from('boards')
            .select()
            .then(({ data }) => {
              if (data?.length) {
                localStorage.setItem('boards', JSON.stringify(data));
              }
            });
        }
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ? getUserFromSupabase(session?.user) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (user && !boards) {
      supabase
        .from('boards')
        .select()
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

function getUserFromSupabase(user: User): UserType {
  return {
    id: user.id,
    email: user.email,
    username: user.user_metadata?.['username'] || '',
    avatar_url: '',
  };
}
