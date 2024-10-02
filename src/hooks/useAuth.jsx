import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    console.log('useAuth - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        console.log('useAuth - User loaded from localStorage:', JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      console.log('useAuth - Attempting login for username:', username);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      if (data && data.password_hash === password) {
        const userData = { username, isAdmin: data.role === 'admin' };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        setUser(userData);
        console.log('useAuth - Login successful, user set:', userData);
        return true;
      } else {
        setError('Invalid username or password');
        console.log('useAuth - Login failed: Invalid credentials');
        return false;
      }
    } catch (error) {
      setError('An error occurred during login');
      console.error('useAuth - Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    setUser(null);
    console.log('useAuth - User logged out');
  };

  return { login, logout, error, user, loading };
};