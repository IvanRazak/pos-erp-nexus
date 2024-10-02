import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      console.log('Login - Attempting login:', username);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      if (data && data.password_hash === password) {
        const userData = { username, isAdmin: data.role === 'admin' };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('Login - Successful:', userData);
        return true;
      } else {
        setError('Invalid username or password');
        console.log('Login - Failed: Invalid credentials');
        return false;
      }
    } catch (error) {
      setError('An error occurred during login');
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    console.log('Logout - User logged out');
  };

  return { login, logout, error, user, loading };
};