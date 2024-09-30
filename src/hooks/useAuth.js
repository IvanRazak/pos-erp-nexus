import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      if (data && data.password_hash === password) {
        // In a real-world scenario, you should use proper password hashing
        localStorage.setItem('user', JSON.stringify({ username, isAdmin: data.role === 'admin' }));
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
  };

  return { login, logout, error };
};