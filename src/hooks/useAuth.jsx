import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuth: Checking for stored user');
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      console.log('useAuth: Found stored user', JSON.parse(storedUser));
      setUser(JSON.parse(storedUser));
    } else {
      console.log('useAuth: No stored user found');
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    console.log('useAuth: Attempting login', { username });
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      if (data && data.password_hash === password) {
        console.log('useAuth: Login successful', { username });
        const userData = { username, isAdmin: data.role === 'admin' };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return true;
      } else {
        console.log('useAuth: Invalid credentials');
        setError('Usuário ou senha inválidos');
        return false;
      }
    } catch (error) {
      console.error('useAuth: Login error', error);
      setError('Ocorreu um erro durante o login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('useAuth: Logging out');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { login, logout, error, user, loading };
};