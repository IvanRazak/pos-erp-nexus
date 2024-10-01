import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    if (session) {
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      localStorage.setItem('session', JSON.stringify(data.session));
      setUser(data.user);
      return true;
    } catch (error) {
      console.error('Error logging in:', error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('session');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return { user, loading, login, logout };
};