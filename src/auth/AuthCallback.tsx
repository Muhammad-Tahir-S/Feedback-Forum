import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import supabase from '@/lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { hash } = window.location;

      if (hash) {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error during auth callback:', error);
          navigate('/auth/signin');
        } else if (data.session) {
          navigate('/');
        }
      } else {
        navigate('/auth/signin');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="auth-callback">
      <p>Completing authentication, please wait...</p>
    </div>
  );
};

export default AuthCallback;
