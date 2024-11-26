import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAddEventLog } from '../integrations/supabase/hooks/events_log';

export const useAuth = () => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const addEventLog = useAddEventLog();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      if (data && data.password_hash === password) {
        const userData = { username, isAdmin: data.role === 'admin', role: data.role };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        // Log login event with proper IP address format
        await addEventLog.mutateAsync({
          user_name: username,
          description: 'User logged in',
          ip_address: window.location.hostname
        });

        return true;
      } else {
        setError('Invalid username or password');
        return false;
      }
    } catch (error) {
      setError('An error occurred during login');
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return { login, logout, error, user };
};