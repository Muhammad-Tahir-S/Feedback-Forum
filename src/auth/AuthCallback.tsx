import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { parseAuthCallbackLocation } from '@/auth/authUrls';
import supabase from '@/lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Completing authentication, please wait...');

  useEffect(() => {
    let cancelled = false;

    const complete = async () => {
      const { error, code } = parseAuthCallbackLocation(window.location.search, window.location.hash);

      if (error) {
        if (!cancelled) {
          setStatus(error);
          navigate('/auth/signin', { replace: true, state: { authError: error } });
        }
        return;
      }
      const { data: existing } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!existing.user && code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (exchangeError) {
          navigate('/auth/signin', { replace: true, state: { authError: exchangeError.message } });
          return;
        }
      }

      const { data } = await supabase.auth.getUser();
      if (cancelled) return;

      if (data.user) {
        navigate('/posts', { replace: true });
        return;
      }

      navigate('/auth/signin', { replace: true });
    };

    void complete();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <p className="text-muted-foreground">{status}</p>
    </div>
  );
};

export default AuthCallback;
